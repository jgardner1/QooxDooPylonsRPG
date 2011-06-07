"""The application's model objects"""
from rpg.model.meta import Session, Base

def init_model(engine):
    """Call me before using any of the tables or classes in the model"""
    Session.configure(bind=engine)

def populate_schema():
    if meta.Session.query(Universe).count() == 0:
        starting_world = MudObj()
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
from uuid import uuid4

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

class MudObj(Base):
    __tablename__ = 'mudobjs'

    id = Column(GUID, primary_key=True, default=uuid4)
    account_id = Column(GUID, ForeignKey('accounts.id'))
    account = relationship(Account,
        backref=backref('mobs',
            collection_class=mapped_collection(lambda o: str(o.id))))

    name = Column(Unicode)
    description = Column(Unicode)

    # Contents of rooms
    container_id = Column(GUID, ForeignKey('mudobjs.id'))

    # Exits
    direction = Column(Unicode)
    source_id = Column(GUID, ForeignKey('mudobjs.id'))
    dest_id = Column(GUID, ForeignKey('mudobjs.id'))

    # Mobs
    god = Column(Boolean)
    ai = Column(String)

    # Size is the radius of the object, in meters
    size = Column(Float) 
    interior_size = Column(Float)

    # x,y are the position of the object, in meters
    x = Column(Float)
    y = Column(Float)

    _attrs = [
        'id',
        'name',
        'description',
        'container_id',
        'container',
        'contents',
        'direction',
        'source_id',
        'source',
        'dest_id',
        'dest',
        'exits',
        'god',
        'ai',
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
            if val is not None:
                d[attr] = val
        return d

MudObj.container = relationship(MudObj,
    primaryjoin=MudObj.id==MudObj.container_id,
    remote_side=MudObj.id);

MudObj.contents = relationship(MudObj,
    primaryjoin=MudObj.container_id==MudObj.id,
    remote_side=MudObj.container_id)

MudObj.dest = relationship(MudObj,
    primaryjoin=MudObj.dest_id==MudObj.id,
    remote_side=MudObj.id)

MudObj.source = relationship(MudObj,
    primaryjoin=MudObj.source_id==MudObj.id,
    remote_side=MudObj.id)

MudObj.exits = relationship(MudObj,
    primaryjoin=MudObj.source_id==MudObj.id,
    remote_side=MudObj.source_id)
    

class Universe(Base):
    __tablename__ = 'universes'

    id = Column(String, primary_key=True)

    name = Column(Unicode)
    description = Column(Unicode)

    starting_world_id = Column(GUID, ForeignKey(MudObj.id), nullable=False)
    starting_world = relationship(MudObj)

    def __init__(self, id, starting_world):
        self.id = id
        self.starting_world = starting_world


