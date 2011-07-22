qx.Class.define("rpg.CreateRoomWindow", {
    extend: qx.ui.window.Window,
    events: { },
    properties: {
        room: {
            nullable: true,
            event: 'changeRoom',
            apply: '_applyRoom'
        },
        actor: {
            nullable: true,
            event: 'changeActor'
        }
    },
    construct: function(account) {
        var self = this;
        this.base(arguments, 'Create a New Room');
        this.setModal(true);
        this.setWidth(300);

        var form = new qx.ui.form.Form();

        this._name = new qx.ui.form.TextField();
        this._name.setRequired(true);
        form.add(this._name, 'Room Name', null, 'name');

        this._description = new qx.ui.form.TextArea();
        this._description.setRequired(false);
        form.add(this._description, 'Description', null, 'description');

        var meters = new qx.util.format.NumberFormat();
        meters.setPostfix(' m');

        this._size = new qx.ui.form.Spinner(0, 100, 1000);
        this._size.setNumberFormat(meters);
        this._size.setRequired(false);
        form.add(this._size, 'Size', null, 'size');

        this._x = new qx.ui.form.Spinner(-100000000, 0, 100000000);
        this._x.setNumberFormat(meters);
        this._x.setRequired(false);
        form.add(this._x, 'X', null, 'x');

        this._y = new qx.ui.form.Spinner(-100000000, 0, 100000000);
        this._y.setNumberFormat(meters);
        this._y.setRequired(false);
        form.add(this._y, 'Y', null, 'y');

        var controller = new qx.data.controller.Form(null, form);
        var model = controller.createModel();

        this._create = new qx.ui.form.Button('Create');
        form.addButton(this._create);
        this._create.addListener('execute', function() {
            if (form.validate()) {
                var model = controller.getModel();
                var service = rpg.Service.getInstance();

                service.createRoom({
                    name: model.getName(),
                    description: model.getDescription(),
                    size: model.getSize(),
                    interior_size: model.getSize(),
                    x: model.getX(),
                    y: model.getY()
                });

                this.close();
            }
        }, this);

        this._edit = new qx.ui.form.Button('Update');
        form.addButton(this._edit);
        this._edit.addListener('execute', function() {
            if (form.validate()) {
                var model = controller.getModel();
                var room = this.getRoom();
                var service = rpg.Service.getInstance();

                room.setName(model.getName());
                room.setDescription(model.getDescription());
                room.setInterior_size(model.getSize());
                room.setX(model.getX());
                room.setY(model.getY());

                service.update({
                    id: room.getId(),
                    name: model.getName(),
                    description: model.getDescription(),
                    interior_size: model.getSize(),
                    x: model.getX(),
                    y: model.getY()
                });

                this.close();
            }
        }, this);
        this._edit.setVisibility('excluded');

        var cancel = new qx.ui.form.Button('Cancel');
        form.addButton(cancel);
        cancel.addListener('execute', function() {
            this.close();
        }, this);

        var renderer = new qx.ui.form.renderer.Single(form);
        var rl = renderer.getLayout();
        rl.setColumnFlex(0,0);
        rl.setColumnFlex(1,1);
        rl.setRowFlex(1,1);

        var layout = new qx.ui.layout.VBox();
        this.setLayout(layout);
        this.add(renderer);
    },

    members: {
        _applyRoom: function(room, old, name) {
            if (room) {
                this._create.setVisibility('excluded');
                this._edit.setVisibility('visible');

                this._name.setValue(room.getName());
                this._description.setValue(room.getDescription());
                this._size.setValue(room.getInterior_size());
                this._x.setValue(room.getX());
                this._y.setValue(room.getY());
            } else {
                this._create.setVisibility('visible');
                this._edit.setVisibility('excluded');

                this._name.setValue('');
                this._description.setValue('');
                this._size.setValue(100);
                this._x.setValue(0);
                this._y.setValue(0);
            }
        },

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
