qx.Class.define("rpg.CreateMobWindow", {
    extend: qx.ui.window.Window,
    events: {
        'create': 'qx.event.type.Data'
    },
    construct: function() {
        this.base(arguments, 'Login', 'rpg/t_small-c.png');

        this.setModal(true);
        this.setWidth(300);
        this.setHeight(200);

        var layout = new qx.ui.layout.Basic();
        this.setLayout(layout);

        var form = new qx.ui.form.Form();
        var name = new qx.ui.form.TextField();
        name.setRequired(true);
        form.add(name, 'Name', null, 'name');

        var controller = new qx.data.controller.Form(null, form);
        var model = controller.createModel();

        var loginbutton = new qx.ui.form.Button('Login');
        form.addButton(loginbutton);
        loginbutton.addListener('execute', function() {
            if (form.validate()) {
                var loginData = {
                    name: controller.getModel().getName()
                };
                this.fireDataEvent('create', loginData);
                this.close();
            }
        }, this);

        var cancelbutton = new qx.ui.form.Button('Cancel');
        form.addButton(cancelbutton);
        cancelbutton.addListener('execute', function() {
            this.close();
        }, this);

        var renderer = new qx.ui.form.renderer.Single(form);
        this.add(renderer);
    }
});
