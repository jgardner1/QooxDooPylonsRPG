"""Setup the rpg application"""
import logging

import pylons.test

from rpg.config.environment import load_environment
from rpg.model import Universe, MudObj, meta

log = logging.getLogger(__name__)

def setup_app(command, conf, vars):
    """Place any commands to setup rpg here"""
    # Don't reload the app if it was loaded under the testing environment
    if not pylons.test.pylonsapp:
        load_environment(conf.global_conf, conf.local_conf)

    # Create the tables if they don't already exist
    meta.Base.metadata.create_all(bind=meta.Session.bind)

    if meta.Session.query(Universe).count() == 0:
        starting_room = MudObj()
        starting_room.name = 'Starting Room'
        starting_room.description = "This is the starting room"
        universe = Universe('main', starting_room)
        meta.Session.add(universe)

    meta.Session.commit()
