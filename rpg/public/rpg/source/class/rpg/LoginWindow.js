qx.Class.define("rpg.LoginWindow", {
    extend: qx.ui.window.Window,
    events: { },
    construct: function() {
        this.base(arguments, 'Login', 'rpg/t_small-c.png');

        this.setModal(true);
        this.setWidth(300);

        var form = new qx.ui.form.Form();
        var email = new qx.ui.form.TextField();
        email.setRequired(true);
        form.add(email, 'Email', null, 'email');

        var password = new qx.ui.form.PasswordField();
        password.setRequired(true);
        form.add(password, 'Password', null, 'password');

        var controller = new qx.data.controller.Form(null, form);
        var model = controller.createModel();

        var loginbutton = new qx.ui.form.Button('Login');
        form.addButton(loginbutton);
        loginbutton.addListener('execute', function() {
            if (form.validate()) {
                var store = rpg.Service.getInstance().login(
                    controller.getModel().getEmail(),
                    controller.getModel().getPassword());
                this.close();
            }
        }, this);

        var cancelbutton = new qx.ui.form.Button('Cancel');
        form.addButton(cancelbutton);
        cancelbutton.addListener('execute', function() {
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
    }
});
