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

class Object(Base):
    __tablename__ = 'objects'

    id = Column(GUID, primary_key=True)
    type = Column(String)
    name = Column(Unicode)

    __mapper_args__ = dict(polymorphic_on=type)


class Account(Base):
    __tablename__ = 'accounts'
    __mapper_args__ = dict(polymorphic_identity='room')

    id = Column(GUID, primary_key=True)
    email = Column(Unicode)
    salt = Column(Binary(20))
    password_sha256 = Column(Binary(256/8))

    def _set_password(self, password):
        self.salt = urandom(20)
        self.password_sha256 = gen_password_sha256(self.salt, password)

    password = property(None, _set_password, None)


class Room(Object):
    __tablename__ = 'rooms'
    __mapper_args__ = dict(polymorphic_identity='room')

    id = Column(GUID, ForeignKey('objects.id'), primary_key=True)
    description = Column(Unicode) # Limited HTML

class Exit(Base):
    __tablename__ = 'exits'
    __mapper_args__ = dict(polymorphic_identity='exit')

    id = Column(GUID, ForeignKey('objects.id'), primary_key=True)
    direction = Column(Unicode)
    description = Column(Unicode)
    from_room_id = Column(GUID, ForeignKey('rooms.id'), nullable=False)
    to_room_id = Column(GUID, ForeignKey('rooms.id'), nullable=False)

class Item(Object):
    __tablename__ = 'items'
    __mapper_args__ = dict(polymorphic_identity='item')

    id = Column(GUID, ForeignKey('objects.id'), primary_key=True)
    description = Column(Unicode)

class Mob(Object):
    __tablename__ = 'mobs'
    __mapper_args__ = dict(polymorphic_identity='mob')

    id = Column(GUID, ForeignKey('objects.id'), primary_key=True)

class Player(Object):
    __tablename__ = 'players'
    __mapper_args__ = dict(polymorphic_identity='player')

    id = Column(GUID, ForeignKey(Object.id), primary_key=True)

class Player_Mob(Base):
    __tablename__ = 'player_mobs'

    player_id = Column(GUID, ForeignKey(Player.id), primary_key=True)
    mob_id = Column(GUID, ForeignKey(Mob.id), nullable=False)

class Account_Players(Base):
    __tablename__ = 'account_players'

    player_id = Column(GUID, ForeignKey(Player.id), primary_key=True)
    account_id = Column(GUID, ForeignKey(Account.id), nullable=False)

class Item_Items(Base):
    __tablename__ = 'item_items'

    contained_id = Column(GUID, ForeignKey(Item.id), primary_key=True, nullable=False)
    container_id = Column(GUID, ForeignKey(Item.id), primary_key=True, nullable=False)

class Mob_Item(Base):
    __tablename__ = 'mob_items'
    
    mob_id = Column(GUID, ForeignKey(Mob.id), primary_key=True, nullable=False)
    item_id = Column(GUID, ForeignKey(Item.id), primary_key=True, nullable=False)

class Room_Item(Base):
    __tablename__ = 'room_items'
    
    room_id = Column(GUID, ForeignKey(Room.id), primary_key=True, nullable=False)
    item_id = Column(GUID, ForeignKey(Item.id), primary_key=True, nullable=False)

class Room_Mobs(Base):
    __tablename__ = 'room_mobs'
    
    room_id = Column(GUID, ForeignKey(Room.id), primary_key=True, nullable=False)
    mob_id = Column(GUID, ForeignKey(Mob.id), primary_key=True, nullable=False)
