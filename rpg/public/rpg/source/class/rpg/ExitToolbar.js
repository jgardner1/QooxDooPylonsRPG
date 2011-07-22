qx.Class.define("rpg.ExitToolbar", {
    extend: qx.ui.toolbar.ToolBar,
    events: {
        examine:    'qx.event.type.Data',
        go:         'qx.event.type.Data',
        create:     'qx.event.type.Event',
        edit:       'qx.event.type.Data',
        remove:     'qx.event.type.Data'
    },

    properties: {
        actor: {
            nullable: true,
            event: 'changeActor',
            apply: '_applyActor'
        },
        exit: {
            nullable: true,
            event: 'changeExit',
            apply: '_applyExit'
        }
    },

    construct: function() {
        this.base(arguments);
        this.setEnabled(false);

        this.add(this._go = new qx.ui.toolbar.Button("Go"));
        this.add(this._examine = new qx.ui.toolbar.Button("Examine"));

        this.add(this._godActions = new qx.ui.toolbar.MenuButton('God...'));

        var _godMenu = new qx.ui.menu.Menu();
        _godMenu.add(this._create = new qx.ui.menu.Button("Create"));
        _godMenu.add(this._edit = new qx.ui.menu.Button("Edit"));
        _godMenu.add(this._remove = new qx.ui.menu.Button("Remove"));
        this._godActions.setMenu(_godMenu);


        this._go.addListener('execute', function(event) {
            this.fireDataEvent('go', this.getExit());
        }, this);

        this._examine.addListener('execute', function(event) {
            this.fireDataEvent('examine', this.getExit());
        }, this);

        this._create.addListener('execute', function(event) {
            this.fireEvent('create');
        }, this);

        this._edit.addListener('execute', function(event) {
            this.fireEvent('edit');
        }, this);

        this._remove.addListener('execute', function(event) {
            this.fireDataEvent('remove', this.getExit());
        }, this);

        this.setActor(null);
        this.setExit(null);
    },

    members: {
        _applyActor: function(actor, old, name) {
            this._godActions.setVisibility(actor && actor.getGod() ? 'visible' : 'excluded');
            this.setEnabled(actor?true:false);
        },
        _applyExit: function(exit, old, name) {
            var enabled = exit ? true : false;
            this.setEnabled(enabled);
            this._go.setEnabled(enabled);
            this._examine.setEnabled(enabled);
            this._create.setEnabled(true);
            this._edit.setEnabled(enabled);
            this._remove.setEnabled(enabled);
        }
    }
});
