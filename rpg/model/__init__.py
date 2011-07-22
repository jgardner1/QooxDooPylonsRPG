"""The application's model objects"""
from rpg.model.meta import Session, Base

def init_model(engine):
    """Call me before using any of the tables or classes in the model"""
    Session.configure(bind=engine)

def populate_schema():
    if meta.Session.query(Universe).count() == 0:
        starting_world = Mob()
        starting_world.name = 'Starting World'
        starting_world.description = "A vast, limitless world with no end"
        universe = Universe('main', starting_world)
        meta.Session.add(universe)

    meta.Session.commit()

from rpg.model.guid import GUID
from sqlalchemy import Column, ForeignKey
from sqlalchemy.types import String, Unicode, Integer, Float, Binary, DateTime, Boolean
from sqlalchemy.orm import relationship, backref
from sqlalchemy.orm.collections import mapped_collection

from os import urandom
from hashlib import sha256
from uuid import uuid4, UUID

def gen_password_sha256(salt, password):
    """Returns the password_sha256 given salt and password"""
    return sha256(salt+str(password)).digest()

class Account(Base):
    __tablename__ = 'accounts'

    id = Column(GUID, primary_key=True, default=uuid4)
    email = Column(Unicode)
    salt = Column(Binary(20))
    password_sha256 = Column(Binary(256/8))

    def _set_password(self, password):
        self.salt = urandom(20)
        self.password_sha256 = gen_password_sha256(self.salt, password)

    password = property(None, _set_password, None)

    def check_password(self, password):
        return gen_password_sha256(self.salt, password) == \
            self.password_sha256

    @staticmethod
    def find_account(email, password):
        for account in meta.Session.query(Account)\
                .filter(Account.email == email):
            if account.check_password(password):
                return account

        raise ValueError("no such account")

    def __json__(self):
        return dict(
            email=self.email,
            mobs=self.mobs,
        )

    def get_mob(self, mob_id):
        return meta.Session.query(Mob)\
            .filter(Mob.id == mob_id)\
            .filter(Mob.account == self).one()
        
class Mob(Base):
    __tablename__ = 'mobs'

    id = Column(GUID, primary_key=True, default=uuid4)
    account_id = Column(GUID, ForeignKey('accounts.id'))
    account = relationship(Account, backref=backref('mobs'))

    name = Column(Unicode)
    description = Column(Unicode)

    container_id = Column(GUID, ForeignKey('mobs.id'))

    # Exits
    source_id = Column(GUID, ForeignKey('mobs.id'))
    dest_id = Column(GUID, ForeignKey('mobs.id'))

    # Mobs
    god = Column(Boolean)
    ai = Column(String)
    ai_state = Column(String)

    # Items
    # Where the item is equipped, if it is equipped at all.
    equip_position = Column(String)

    # In which order the equipment was equipped. 0 was equipped first, 1
    # second, etc... When you remove equipment, you have to reverse the order.
    equip_order = Column(Integer)

    # mass is in kg
    mass = Column(Float)

    # Size is the diameter of the object, in meters. Cross section area is about
    # pi*size**2/4, while volume is pi*size**3/6
    size = Column(Float) 

    # interior_size is how big the item is on the inside. it works like size.
    interior_size = Column(Float)

    # x,y are the position of the object, in meters, inside the room it
    # belongs to
    x = Column(Float)
    y = Column(Float)

    _attrs = [
        'id',
        'name',
        'description',
        'container_id',
        'container',
        'contents',
        'source_id',
        'source',
        'dest_id',
        'dest',
        'exits',
        'god',
        'ai',
        'equip_position',
        'equip_order',
        'mass',
        'size',
        'interior_size',
        'x',
        'y',

    ]

    def __json__(self,
            show=frozenset(),
            skip=frozenset((
                'container',
                'exits',
                'contents',
                'source', 'dest'))):
        d = dict()
        for attr in self._attrs:
            if attr in skip and attr not in show:
                continue
            val = getattr(self, attr)
            d[attr] = val
        return d

    def __init__(self, **attrs):
        Base.__init__(self)
        self.update(**attrs)

    def update(self, **attrs):
        for attr, val in attrs.items():
            if attr not in self._attrs:
                raise ValueError("unexpected attr %r" % (attr,))
            if attr in ('id', 'container_id', 'source_id', 'dest_id'):
                if not val:
                    val = None
                else:
                    val = UUID(val)

            elif attr in ('x', 'y', 'size', 'interior_size'):
                if val == '':
                    val = None
                elif val is not None:
                    val = float(val)

            elif attr in ('god'):
                val = bool(val)

            setattr(self, attr, val)

    def clone(self):
        new_obj = Mob()
        for attr in self._attrs:
            if attr in ('id'):
                continue
            setattr(new_obj, attr, getattr(self, attr))
        return new_obj

    def go(self, exit_id):
        room = self.container
        for exit in room.exits:
            if exit.id == exit_id:
                self.container_id = exit.dest_id
                break
        else:
            raise ValueError("no such exit %s" % (exit_id,))

    def look(self):
        room = self.container
        return room.__json__(show=set(('contents', 'exits')))

    def examine(self, id):
        room = self.container
        for item in room.contents:
            if item.id == id:
                return item

        for exit in room.exits:
            if exit.id == id:
                return exit

        for item in self.contents:
            if item.id == id:
                return item

    def inventory(self):
        return self.__json__(show=set(('contents')))

    def pickup(self, id):
        room = self.container
        for item in room.contents:
            if item.id == id:
                item.container = self
                return item
        raise ValueError("%s is not in the room" % (id,))

    def __getstate__(self):
        return dict(
            id=self.id,
            _sa_instance_state=self._sa_instance_state)

Mob.container = relationship(Mob,
    primaryjoin=Mob.id==Mob.container_id,
    remote_side=Mob.id);

Mob.contents = relationship(Mob,
    primaryjoin=Mob.container_id==Mob.id,
    remote_side=Mob.container_id)

Mob.dest = relationship(Mob,
    primaryjoin=Mob.dest_id==Mob.id,
    remote_side=Mob.id)

Mob.source = relationship(Mob,
    primaryjoin=Mob.source_id==Mob.id,
    remote_side=Mob.id)

Mob.exits = relationship(Mob,
    primaryjoin=Mob.source_id==Mob.id,
    remote_side=Mob.source_id)
    

class Universe(Base):
    __tablename__ = 'universes'

    id = Column(String, primary_key=True)

    name = Column(Unicode)
    description = Column(Unicode)

    starting_world_id = Column(GUID, ForeignKey(Mob.id), nullable=False)
    starting_world = relationship(Mob)

    def __init__(self, id, starting_world):
        self.id = id
        self.starting_world = starting_world


