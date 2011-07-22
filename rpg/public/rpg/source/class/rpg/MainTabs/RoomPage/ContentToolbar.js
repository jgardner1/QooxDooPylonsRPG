qx.Class.define("rpg.MainTabs.RoomPage.ContentToolbar", {
    extend: qx.ui.toolbar.ToolBar,
    events: {
    },

    properties: {
        actor: {
            nullable: true,
            event: 'changeActor',
            apply: '_applyActor'
        },
        item: {
            nullable: true,
            event: 'changeItem',
            apply: '_applyItem'
        }
    },

    construct: function() {
        this.base(arguments);
        this.setEnabled(false);

        this.add(this._examineButton = new qx.ui.toolbar.Button("Examine"));
        this.add(this._pickupButton = new qx.ui.toolbar.Button("Pick up"));
        this.add(this._attackButton = new qx.ui.toolbar.Button("Attack"));
        this.add(this._actions = new qx.ui.toolbar.MenuButton('Actions...'));
        this.add(this._godActions = new qx.ui.toolbar.MenuButton('God...'));

        var _actionsMenu = new qx.ui.menu.Menu();
         _actionsMenu.add(this._pickpocketButton = new qx.ui.menu.Button("Pickpocket"));
        this._actions.setMenu(_actionsMenu);

        var _godMenu = new qx.ui.menu.Menu();
        _godMenu.add(this._createButton = new qx.ui.menu.Button("Create"));
        _godMenu.add(this._cloneButton = new qx.ui.menu.Button("Clone"));
        _godMenu.add(this._editButton = new qx.ui.menu.Button("Edit"));
        _godMenu.add(this._removeButton = new qx.ui.menu.Button("Remove"));
        this._godActions.setMenu(_godMenu);

        this._examineButton.addListener('execute', this._examine, this);
        this._pickupButton.addListener('execute', this._pickup, this);
        this._attackButton.addListener('execute', this._attack, this);
        this._pickpocketButton.addListener('execute', this._pickpocket, this);
        this._createButton.addListener('execute', this._create, this);
        this._cloneButton.addListener('execute', this._clone, this);
        this._editButton.addListener('execute', this._edit, this);
        this._removeButton.addListener('execute', this._remove, this);

        this.setActor(null);
        this.setItem(null);
    },

    members: {
        _applyActor: function(actor, old, name) {
            var enabled = actor ? true : false;
            var god = actor && actor.getGod() ? true : false;
            this.setEnabled(enabled);
            this._godActions.setVisibility(god?'visible':'excluded');
            this._godActions.setEnabled(god);
        },

        _applyItem: function(item, old, name) {
            var enabled = item ? true : false;
            this._examineButton.setEnabled(enabled);
            this._pickupButton.setEnabled(enabled);
            this._attackButton.setEnabled(enabled);
            this._actions.setEnabled(enabled);
            this._pickpocketButton.setEnabled(enabled);
            this._cloneButton.setEnabled(enabled);
            this._removeButton.setEnabled(enabled);
        },

        _examine: function() {
            var item = this.getItem();

            rpg.Message.inform("Examining");
        },

        _pickup: function() {
            var item = this.getItem();
        },

        _attack: function() {
            var item = this.getItem();
        },

        _pickpocket: function() {
            var item = this.getItem();
        },

        _create: function() {
        },

        _clone: function() {
            var item = this.getItem();
        },

        _edit: function() {
            var item = this.getItem();
        },

        _remove: function() {
            var item = this.getItem();
        }
    }
});
