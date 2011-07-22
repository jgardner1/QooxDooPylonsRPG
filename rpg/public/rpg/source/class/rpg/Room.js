qx.Class.define("rpg.Room",
{
    extend : qx.ui.splitpane.Pane,

    events: {
            reload: 'qx.event.type.Event',
            post: 'qx.event.type.Data'
    },

    construct : function() {
        this.base(arguments, 'vertical')

        // this.setShowClose(false);
        // this.setShowMaximize(false);
        // this.setShowMinimize(false);
        this.setWidth(250);
        this.setHeight(300);

        //this.setContentPadding(0);

        var room = new qx.ui.basic.Label("Description of the room here");
        var exits = new qx.ui.form.List();
        var items = new qx.ui.form.List();
        var exit_items = new qx.ui.splitpane.Pane('horizontal');
        exit_items.add(exits, 0);
        exit_items.add(items, 1);

        this.add(room, 0);
        this.add(exit_items, 1);
    

    },

    members: {
    }
});

