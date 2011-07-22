qx.Class.define("rpg.ItemDetails", {
    extend: qx.ui.container.Composite,
    events: {
        'choose': 'qx.event.type.Data'
    },
    properties: {
        item: {
            nullable: true,
            event: 'changeItem',
            apply: '_applyItem'
        }
    },
    construct: function() {
        this.base(arguments);
        this.setPadding(4);
        this.setEnabled(false);

        var layout = new qx.ui.layout.Grid(4,4);
        this.setLayout(layout);

        layout.setColumnFlex(1,1);

        this.add(new qx.ui.basic.Label("Name:"), {row:0, column:0});
        this.add(
            this._name = new qx.ui.basic.Label(),
            {row:0, column:1});
        this.bind("item.name", this._name, "value");

        this.add(new qx.ui.basic.Label("Description:"), {row:1, column:0});
        this.add(
            this._description = new qx.ui.basic.Label(),
            {row:1, column:1});
        this.bind("item.description", this._description, "value");
    },

    members: {
        _applyItem: function(item, old, name) {
            this.setEnabled(item?true:false);
        }
    }
});
