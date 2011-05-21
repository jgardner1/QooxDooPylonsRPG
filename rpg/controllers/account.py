import logging

from pylons import request, response, session, tmpl_context as c, url
from pylons.controllers.util import abort, redirect

from rpg.lib.base import BaseController, render

log = logging.getLogger(__name__)

class AccountController(BaseController):

    def register(self):
        return render('/account/register.mako')

    def register_submit(self):
        return 'Thanks!'

    def verify_email(self):
        return "Verified"

    def login(self):
        return render('/account/login.mako')

    def login_submit(self):
        pass

    def view(self):
        return render('/account/view.mako')
