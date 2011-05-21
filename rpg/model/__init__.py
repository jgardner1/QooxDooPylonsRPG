"""The application's model objects"""
from rpg.model.meta import Session, Base


def init_model(engine):
    """Call me before using any of the tables or classes in the model"""
    Session.configure(bind=engine)

from rpg.model.guid import GUID
from sqlalchemy import Column, ForeignKey
from sqlalchemy.types import String, Unicode, Integer, Float, Binary, DateTime, Boolean

from os import urandom
from hashlib import sha256

def gen_password_sha256(salt, password):
    """Returns the password_sha256 given salt and password"""
    return sha256(self.salt+password).digest()

class Account(Base):
    __tablename__ = 'accounts'

    id = Column(GUID, primary_key=True)
    name = Column(Unicode)
    email = Column(Unicode)
    salt = Column(Binary(20))
    password_sha256 = Column(Binary(256/8))

    def _set_password(self, password):
        self.salt = urandom(20)
        self.password_sha256 = gen_password_sha256(self.salt, password)

    password = property(None, _set_password, None)

class Room(Base):
    __tablename__ = 'rooms'

    id = Column(GUID, primary_key=True)
    name = Column(Unicode)
    description = Column(Unicode) # Limited HTML

class Exit(Base):
    __tablename__ = 'exits'

    direction = Column(Unicode, primary_key=True, nullable=False)
    description = Column(Unicode)
    from_room_id = Column(GUID, ForeignKey('rooms.id'), primary_key=True, nullable=False)
    to_room_id = Column(GUID, ForeignKey('rooms.id'), nullable=False)

class Mob(Base):
    __tablename__ = 'mobs'

    id = Column(GUID, primary_key=True)
    name = Column(Unicode)
    account_id = Column(GUID, ForeignKey(Account.id))

class Item(Base):
    __tablename__ = 'items'

    id = Column(GUID, primary_key=True)
    name = Column(Unicode)
    description = Column(Unicode)
    containing_item = Column(GUID, ForeignKey('items.id'))
    containing_room = Column(GUID, ForeignKey(Room.id))
    containing_mob = Column(GUID, ForeignKey(Mob.id))
