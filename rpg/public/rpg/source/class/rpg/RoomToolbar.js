qx.Class.define("rpg.RoomToolbar", {
    extend: qx.ui.toolbar.ToolBar,
    events: {
        look: 'qx.event.type.Event',
        teleport: 'qx.event.type.Event',
        remove: 'qx.event.type.Event'
    },

    properties: {
        room: {
            nullable: true,
            event: 'changeRoom'
        },

        actor: {
            nullable: true,
            event: 'changeActor',
            apply: '_applyActor'
        }
    },

    construct: function() {
        this.base(arguments);
        this.setEnabled(false);

        this.add(this._look = new qx.ui.toolbar.Button("Look"));
        this.add(this._godActions = new qx.ui.toolbar.MenuButton('God...'));

        var _godMenu = new qx.ui.menu.Menu();
        _godMenu.add(this._teleport = new qx.ui.menu.Button("Teleport"));
        _godMenu.add(this._create   = new qx.ui.menu.Button("Create"));
        _godMenu.add(this._edit     = new qx.ui.menu.Button("Edit"));
        _godMenu.add(this._remove   = new qx.ui.menu.Button("Remove"));
        this._godActions.setMenu(_godMenu);


        this._look.addListener('execute', function(event) {
            this.fireDataEvent('look');
        }, this);

        this._teleport.addListener('execute', function(event) {
            this.fireDataEvent('teleport');
        }, this);

        this._create.addListener('execute', this.__create, this);
        this._edit.addListener('execute', this.__edit, this);

        this._remove.addListener('execute', function(event) {
            this.fireDataEvent('remove');
        }, this);

        this.setActor(null);
        this.setRoom(null);
    },

    members: {
        _applyActor: function(actor, old, name) {
            this.setEnabled(actor?true:false);
            this._godActions.setVisibility(actor && actor.getGod() ? 'visible' : 'excluded');
        },

        _applyRoom: function(room, old, name) {
            this._look.setEnabled(true);
            this._teleport.setEnabled(true);
            this._create.setEnabled(true);

            var enabled = room ? true : false;
            this._edit.setEnabled(enabled);
            this._remove.setEnabled(enabled);
        },


        __create: function(event) {
            var popup = new rpg.CreateRoomWindow();
            this.bind('actor', popup, 'actor');
            popup.open();
            popup.moveTo(50,50);
        },

        __edit: function(event) {
            var popup = new rpg.CreateRoomWindow();
            this.bind('actor', popup, 'actor');
            this.bind('room', popup, 'room');
            popup.open();
            popup.moveTo(50,50);
        }
    }
});
