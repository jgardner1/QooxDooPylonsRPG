qx.Class.define("rpg.MainTabs.RoomPage", {
    extend: qx.ui.tabview.Page,
    events: {
        look:        'qx.event.type.Event',
        examineExit: 'qx.event.type.Data',

        teleport:   'qx.event.type.Event',
        go:         'qx.event.type.Data',

        createExit: 'qx.event.type.Event',
        editExit:   'qx.event.type.Data',
        removeExit: 'qx.event.type.Data'
    },

    properties: {
        actor: {
            nullable: true,
            event: 'changeActor'
        },
        room: {
            nullable: true,
            event: 'changeRoom'
        }
    },

    construct: function() {
        var self = this,
            room_page,
            layout,
            status_status_page,
            effects,
            skills_page,
            skills,
            inventory_page,
            carrying,
            wearing;

        this.base(arguments, "Room");

        this._roomToolbar = new rpg.RoomToolbar();
        this.bind('actor', this._roomToolbar, 'actor');
        this.bind('room',  this._roomToolbar, 'room');

        this._room_name = new qx.ui.basic.Label().set({font:'bold'});
        this._room_description = new qx.ui.basic.Label().set({
                rich:true,
                wrap:true});
        this._exitToolbar = new rpg.ExitToolbar();
        this._exits = new qx.ui.form.List();

        this.bind('actor', this._exitToolbar, 'actor');

        this._exits.addListener('changeSelection', function(event) {
            var data = event.getData();
            this._exitToolbar.setExit(data.length == 1 ? data[0].getModel() : null);
        }, this);

        this._exitToolbar.addListener('go', this.__transferDataEvent('go'), this);
        this._exitToolbar.addListener('examine', this.__transferDataEvent('examineExit'), this);
        this._exitToolbar.addListener('create', this.__transferEvent('createExit'), this);
        this._exitToolbar.addListener('edit', this.__transferDataEvent('editExit'), this);
        this._exitToolbar.addListener('remove', this.__transferDataEvent('removeExit'), this);

        this._contentToolbar = new rpg.MainTabs.RoomPage.ContentToolbar();
        this._items = new qx.ui.form.List();

        this.bind('actor', this._contentToolbar, 'actor');

        this._items.addListener('changeSelection', function(event) {
            var data = event.getData();
            this._contentToolbar.setItem(data.length == 1 ? data[0].getModel() : null);
        }, this);

        this.bind('room.name', this._room_name, 'value');
        this.bind('room.description', this._room_description, 'value');

        var exit_controller = new qx.data.controller.List(null, this._exits);
        exit_controller.setLabelPath("name");
        exit_controller.setDelegate({
            createItem: function() {
                return new rpg.ContentItem();
            },

            bindItem: function(controller, item, id) {
                controller.bindProperty('', 'model', null, item, id);
                controller.bindProperty('name', 'name', null, item, id);
                controller.bindProperty('description', 'description', null, item, id);
            },
    
            configureItem: function(item) {
                item.addListener('dblclick', function(event) {
                    self.fireDataEvent('go', item.getModel());
                });
            }
        });
        this.bind("room.exits", exit_controller, "model");

        var content_controller = new qx.data.controller.List(null, this._items);
        content_controller.setLabelPath("name");
        content_controller.setDelegate({
            createItem: function() {
                return new rpg.ContentItem();
            },

            bindItem: function(controller, item, id) {
                controller.bindProperty('', 'model', null, item, id);
                controller.bindProperty('name', 'name', null, item, id);
                controller.bindProperty('description', 'description', null, item, id);
            },
    
            configureItem: function(item) {
                item.addListener('dblclick', function(event) {
                    self.fireDataEvent('pickup', item.getModel());
                });
            }
        });
        this.bind("room.contents", content_controller, "model");

        this.setLayout(layout = new qx.ui.layout.Grid(4,4));
        layout.setColumnFlex(0,1);
        layout.setColumnFlex(1,1);
        layout.setRowFlex(2,1);
        layout.setRowFlex(4,1);
        this.add(this._roomToolbar,        {row:0, column:0, colSpan:2});
        this.add(this._room_name,          {row:1, column:0, colSpan:2});
        this.add(this._room_description,   {row:2, column:0, colSpan:2});
        this.add(this._exitToolbar,        {row:3, column:0});
        this.add(this._exits,              {row:4, column:0});
        this.add(this._contentToolbar,     {row:3, column:1});
        this.add(this._items,              {row:4, column:1});
    },

    members: {
        __transferEvent: function(name) {
            return function(event) {
                this.fireEvent(name);
            }
        },

        __transferDataEvent: function(name) {
            return function(event) {
                this.fireDataEvent(name, event.getData());
            }
        }
    }
});
