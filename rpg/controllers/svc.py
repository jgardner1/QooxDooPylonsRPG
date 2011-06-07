import logging

from pylons import request, response, session, tmpl_context as c, url
from pylons.controllers.util import abort, redirect

from rpg.lib.base import BaseController, render

log = logging.getLogger(__name__)

import json
import urllib
import traceback
from datetime import time, datetime, date, timedelta
from uuid import uuid4, UUID

def json_default(o):
    __json__ = getattr(o, '__json__', None)
    if __json__:
        return __json__()

    if isinstance(o, time):
        return (o.seconds*1000) + (o.microseconds/1000.0)

    if isinstance(o, (datetime, date)):
        o = o-datetime(1970, 1, 1, 0, 0, 0, 0, utc)

    if isinstance(o, timedelta):
        return (o.days*24*60*60 + o.seconds)*1000 + (o.microseconds/1000.0)

    return unicode(o)

class JSONFormatter(object):

    @staticmethod
    def start_response(start_response):
        start_response('200 OK',
            [('Content-type', 'application/json'),
             ('Cache-Control', 'no-cache'),
             ('Pragma', 'no-cache'),
             ('Expires', '-1')])

    @staticmethod
    def response(response):
        return json.dumps(dict(response=response),
            default=json_default)

    @staticmethod
    def exception(exception):
        return json.dumps(dict(exception=dict(
                name=exception.__class__.__name__,
                message=exception.args[0],
                args=exception.args,
                traceback=traceback.format_exc(exception))),
            default=json_default)
        

class SvcController(BaseController):

    def handle(self, environ, start_response, method, format):
        if method.startswith('_'):
            abort(404)

        if format == 'json':
            formatter = JSONFormatter
        else:
            abort(404)

        try:
            func = getattr(Service, method)
        except AttributeError:
            abort(404)

        qs = environ.get('QUERY_STRING', None)
        if qs:
            args = json.loads(urllib.unquote_plus(qs))

            args = dict([(str(key), value)
                for (key, value) in args.items()])
        else:
            args = dict()

        try:
            response = func(**args)
            formatter.start_response(start_response)
            return formatter.response(response)
        except Exception as exception:
            formatter.start_response(start_response)
            return formatter.exception(exception)


from rpg.model import meta, Account, MudObj, Universe

class RPGSession(object):
    def __init__(self, session):
        self.session = session

    @property
    def account(self):
        try:
            return meta.Session.query(Account).get(session['account_id'])
        except KeyError:
            raise AttributeError("account is not set")


    @account.setter
    def account(self, account):
        session.clear()
        session['account_id'] = account.id
        session.save()

    @account.deleter
    def account(self):
        session.clear()
        session.save()

    @property
    def mob(self):
        try:
            return meta.Session.query(MudObj).get(session['mob_id'])
        except KeyError:
            raise AttributeError("mob is not set")

    @mob.setter
    def mob(self, mob):
        session.clear()
        session['mob_id'] = mob.id
        session.save()

    @mob.deleter
    def mob(self):
        del session['mob_id']
        session.save()

rpg_session = RPGSession(session)

class Service(object):
    @staticmethod
    def register(email, password):

        account = Account()
        account.email = email
        account.password = password

        meta.Session.add(account)
        meta.Session.commit()

        rpg_session.account = account

        return account

    @staticmethod
    def login(email, password):
        account = Account.find_account(email, password)
        rpg_session.account = account

        return account

    @staticmethod
    def logout():
        del rpg_session.account
        return True

    @staticmethod
    def get_mob_account():
        result = dict()

        try:
            result['account'] = rpg_session.account
            result['mob'] = rpg_session.mob
        except AttributeError:
            pass

        return result

    @staticmethod
    def choose_mob(mob_id):
        account = rpg_session.account
        mob = account.mobs[mob_id]
        rpg_session.mob = mob
        return mob

    @staticmethod
    def logout_mob():
        del rpg_session.mob
        return True

    @staticmethod
    def create_mob(name):
        account = get_current_account()

        mob = MudObj()
        mob.account = account
        mob.name = name
        mob.container = meta.Session.query(Universe).get('main').starting_world
        mob.size = 2.0
        mob.x = 0.0
        mob.y = 0.0
        meta.Session.add(mob)
        meta.Session.commit()

        rpg_session.mob = mob

        return mob
            
    @staticmethod
    def status():
        return rpg_session.mob

    @staticmethod
    def update(id, **attrs):
        mob = rpg_session.mob
        if not mob.god:
            raise Exception("you are not god")
        o = meta.Session.query(MudObj).get(id)
        o.update(**attrs)
        meta.Session.commit()
        return True

    @staticmethod
    def look():
        """Looks at the room the character is in. Note that the IDs are not
        the actual DB IDs."""
        mob = rpg_session.mob

        room = mob.container
        return room.__json__(show=set(('contents', 'exits')))


    @staticmethod
    def do(cmd):
        raise NotImplementedError

    @staticmethod
    def create(**attrs):
        mob = rpg_session.mob
        if not mob.god:
            raise Exception("you are not a god")
        new_mob = MudObj(**attrs)
        meta.Session.add(new_mob)
        meta.Session.commit()
        return new_mob

    @staticmethod
    def go(exit_id):
        mob = rpg_session.mob
        mob.go(UUID(exit_id))
        meta.Session.commit()
        return True
