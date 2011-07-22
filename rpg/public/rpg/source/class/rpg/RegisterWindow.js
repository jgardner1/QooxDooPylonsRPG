qx.Class.define("rpg.RegisterWindow", {
    extend: qx.ui.window.Window,
    events: {
        'done': 'qx.event.type.Data'
    },
    construct: function() {
        this.base(arguments, 'Register', 'rpg/t_small-c.png');

        this.setModal(true);

        var layout = new qx.ui.layout.Grid();
        this.setLayout(layout);

        var form = new qx.ui.form.Form();
        var email = new qx.ui.form.TextField();
        email.setRequired(true);
        form.add(email, 'Email', null, 'email');

        var password = new qx.ui.form.PasswordField();
        password.setRequired(true);
        form.add(password, 'Password', null, 'password');

        var controller = new qx.data.controller.Form(null, form);
        var model = controller.createModel();

        var doneButton = new qx.ui.form.Button('Register');
        form.addButton(doneButton);
        doneButton.addListener('execute', function() {
            if (form.validate()) {
                this.fireDataEvent('done', {
                    email: controller.getModel().getEmail(),
                    password: controller.getModel().getPassword()
                });
                this.close();
            }
        }, this);

        var cancelbutton = new qx.ui.form.Button('Cancel');
        form.addButton(cancelbutton);
        cancelbutton.addListener('execute', function() {
            this.close();
        }, this);

        var renderer = new qx.ui.form.renderer.Single(form);
        this.add(renderer, {flex:1});
        renderer.getLayout().setColumnFlex(1,1);
    }
});
