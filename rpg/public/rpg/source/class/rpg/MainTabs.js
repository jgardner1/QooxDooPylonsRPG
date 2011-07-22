qx.Class.define("rpg.MainTabs", {
    extend: qx.ui.tabview.TabView,
    events: {
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

        this.base(arguments, "top");

        this.add(this._roomPage = new rpg.MainTabs.RoomPage());
        this.bind('actor', this._roomPage, 'actor');
        this.bind('room', this._roomPage, 'room');

        this.add(status_status_page = new qx.ui.tabview.Page("Status"));
        status_status_page.setLayout(new qx.ui.layout.VBox(4));
        status_status_page.add(effects = new qx.ui.form.List(), {flex:1});

        this.add(skills_page = new qx.ui.tabview.Page("Skills"));
        skills_page.setLayout(new qx.ui.layout.VBox(4));
        skills_page.add(skills = new qx.ui.form.List(), {flex:1});

        this.add(inventory_page = new qx.ui.tabview.Page("Inventory"));
        inventory_page.setLayout(new qx.ui.layout.VBox(4));
        
        inventory_page.add(new qx.ui.basic.Label("Carrying:").set({font:'bold'}));
        inventory_page.add(carrying = new qx.ui.form.List());
        inventory_page.add(new qx.ui.basic.Label("Wearing:").set({font:'bold'}));
        inventory_page.add(wearing = new qx.ui.form.List(), {flex:1});

        /*
        var carrying_controller = new qx.data.controller.List(null, carrying);
        carrying_controller.setLabelPath("name");
        carrying_controller.setDelegate({
            filter: function(data) {
                return data.getEquipPositon() ? true : false;
            }
        });
        this.bind('mob.contents', carrying_controller, 'model');

        var wearing_controller = new qx.data.controller.List(null, wearing);
        wearing_controller.setLabelPath("name");
        wearing_controller.setDelegate({
            filter: function(data) {
                return data.getEquipPositon() ? false : true;
            }
        });
        this.bind('mob.contents', wearing_controller, 'model');
        */
    },

    members: {
        _applyActor: function(value, old, name) {
        },

        _applyRoom: function(value, old, name) {
        },

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
