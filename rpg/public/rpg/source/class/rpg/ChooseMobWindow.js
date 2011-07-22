qx.Class.define("rpg.ChooseMobWindow", {
    extend: qx.ui.window.Window,
    events: {
        'choose': 'qx.event.type.Data'
    },
    properties: {
        account: {
            nullable: true,
            event: 'changeAccount'
        }
    },
    construct: function(account) {
        var self = this;
        this.base(arguments, 'Choose Your Mob', 'rpg/t_small-c.png');

        this.setModal(true);
        this.setWidth(300);
        this.setHeight(200);

        var layout = new qx.ui.layout.Grid(4,4);
        this.setLayout(layout);

        layout.setColumnFlex(0,1);
        layout.setRowFlex(0,1);

        this._list = new qx.ui.form.List();
        this.add(this._list, {row:0, column:0, colSpan:3});

        this._controller = new qx.data.controller.List(null, this._list);
        this._controller.setLabelPath("name");
        this._controller.setDelegate({
            configureItem: function(item) {
                item.addListener('dblclick', function(event) {
                    self.__chooseMob(item.getModel());
                });
            }
        });
        this.bind("account.mobs", this._controller, "model");

        var choosebutton = new qx.ui.form.Button('Choose');
        this.add(choosebutton, {row:1, column:1});
        choosebutton.addListener('execute', this.__choose, this);

        var cancelbutton = new qx.ui.form.Button('Cancel');
        this.add(cancelbutton, {row:1, column:2});
        cancelbutton.addListener('execute', this.__cancel, this);
    },

    members: {
        __choose: function() {
            var selection = this._list.getSelection();
            if (selection.length != 1) {
                alert("Please choose one mob");
            }
            this.__chooseMob(selection[0].getModel());
        },

        __chooseMob: function(mob) {
            this.fireDataEvent('choose', mob);
            this.close();
        },

        __cancel: function() {
            this.close();
        }
    }
});
