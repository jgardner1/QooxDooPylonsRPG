qx.Class.define("rpg.MainWindow",
{
    extend : qx.ui.window.Window,

    events: {
            register: 'qx.event.type.Data',
            login: 'qx.event.type.Data',
            logout: 'qx.event.type.Event',
            createMob: 'qx.event.type.Data',
            chooseMob: 'qx.event.type.Data'
    },

    properties: {
        account: {
            nullable: true,
            event: 'changeAccount',
            apply: '_applyAccount'
        },

        mob: {
            nullable: true,
            event: 'changeMob',
            apply: '_applyMob'
        },

        room: {
            nullable: true,
            event: 'changeRoom'
        }
    },

    construct : function() {
        var self=this,
            layout,
            menubar,
            account_menu_button,
            account_menu,
            tabs;

        this.base(arguments, "twitter", 'rpg/t_small-c.png')

        this.setShowClose(false);
        this.setShowMaximize(false);
        this.setShowMinimize(false);

        this.setContentPadding(4);

        var register_command = new qx.ui.core.Command();
        register_command.addListener('execute', function() {
            this.__register();
        }, this);

        var login_command = new qx.ui.core.Command();
        login_command.addListener('execute', function() {
            this.__login();
        }, this);

        var logout_command = new qx.ui.core.Command();
        logout_command.addListener('execute', function() {
            this.__logout();
        }, this);

        var create_mob_command = new qx.ui.core.Command();
        create_mob_command.addListener('execute', function() {
            this.__createMob();
        }, this);

        var choose_mob_command = new qx.ui.core.Command();
        choose_mob_command.addListener('execute', function() {
            this.__chooseMob();
        }, this);

        menubar = new qx.ui.menubar.MenuBar();
        account_menu = new qx.ui.menu.Menu();
        account_menu.add(
            this._registerButton = new qx.ui.menu.Button(
                'Register', null, register_command, null));
        account_menu.add(
            this._loginButton = new qx.ui.menu.Button(
                'Login', null, login_command, null));
        account_menu.add(
            this._logoutButton = new qx.ui.menu.Button(
                'Logout', null, logout_command, null
            ).set({enabled: false}));
        account_menu.add(
            this._createMobButton = new qx.ui.menu.Button(
                'Create Mob', null, create_mob_command, null
            ).set({enabled: false}));
        account_menu.add(
            this._chooseMobButton = new qx.ui.menu.Button(
                'Choose Mob', null, choose_mob_command, null
            ).set({enabled: false}));

        menubar.add(account_menu_button = new qx.ui.menubar.Button("Account"));

        account_menu_button.setMenu(account_menu);

        tabs = new rpg.MainTabs();
        this.bind('room', tabs, 'room');
        this.bind('mob', tabs, 'actor');

        this._itemDetails = new rpg.ItemDetails();

        // Messages from the server, reporting user's actions and local events
        this._messages = new qx.ui.form.List()

        // Free-text command entry
        var command_comp = new qx.ui.container.Composite();
        command_comp.setLayout(new qx.ui.layout.HBox(4));
        command_comp.add(new qx.ui.basic.Label("Command:").set({font:'bold'}));
        command_comp.add(this._command = new qx.ui.form.TextField());

        // Setup the layout, and drop all the elements in.
        layout = new qx.ui.layout.Grid(4,4);
        layout.setColumnFlex(0,1);
        layout.setColumnFlex(1,1);
        layout.setRowFlex(1,2);
        layout.setRowFlex(2,1);
        this.setLayout(layout);

        this.add(menubar, {row:0, column:0, colSpan: 2});
        this.add(tabs, {row:1, column:0});
        this.add(this._itemDetails, {row:1, column:1});
        this.add(this._messages, {row:2, column:0, colSpan: 2});
        this.add(this._command, {row:3, column:0, colSpan: 2});

        this._bindService();
    },

    members: {

        _applyAccount: function(account, old, name) {
            this._chooseMobButton.setEnabled(account && account.getMobs().length > 0 ? true:false);
            this._createMobButton.setEnabled(account?true:false);
            this._logoutButton.setEnabled(account?true:false);
        },

        _applyMob: function(mob, old, name) {
            if (mob) {
                this.__look();
            }

            if (mob) {
                this.__addMessage("Hail, "+mob.getName());
            } else if (old) {
                this.__addMessage("Goodbye, "+mob.getName());
            }
        },

        _bindService: function() {
            var service = rpg.Service.getInstance();
            service.bind('account', this, 'account');
            service.bind('mob', this, 'mob');
            service.bind('room', this, 'room');
            service.addListener('message', function(data) {
                this.__addMessage(data.getData());
            }, this);

            if (!this.getAccount()) {
                this.__login();
            } else if (!this.getMob()) {
                if (this.getAccount().getMobs().length) {
                    this.__chooseMob();
                } else {
                    this.__createMob();
                }
            }
        },

        __addMessage: function(message) {
            this._messages.add(new qx.ui.form.ListItem(message));
        },

        __register: function() {
            var popup = new rpg.RegisterWindow();
            popup.open();
            popup.moveTo(50,50);
            popup.addListener('done', function(e) {
                var data = e.getData();
                rpg.Service.getInstance().register(data.email, data.password);
            }, this);
        },

        __login: function() {
            var login = new rpg.LoginWindow();
            login.open();
            login.moveTo(50,50);
        },

        __logout: function() {
            rpg.Service.getInstance().logout();
        },

        __createMob: function() {
            var popup = new rpg.CreateMobWindow(this.getAccount());
            popup.open();
            popup.moveTo(50,50);
            popup.addListener('create', function(e) {
                var data = e.getData();
                rpg.Service.getInstance().create_mob(data.name);
            }, this);
        },

        __chooseMob: function() {
            var popup = new rpg.ChooseMobWindow(this.getAccount());
            this.bind('account', popup, 'account');
            popup.open();
            popup.moveTo(50,50);
            popup.addListener('choose', function(data) {
                var data = data.getData();
                rpg.Service.getInstance().choose_mob(data.getId());
            }, this);
        },

        __handle_look:          function(event) { this.__look(); },
        __handle_teleport:      function(event) { this.__teleport(); },
        __handle_createRoom:    function(event) { this.__createRoom(); },
        __handle_editRoom:      function(event) { this.__editRoom(); },
        __handle_removeRoom:    function(event) { this.__removeRoom(); },
        __handle_createItem:    function(event) { this.__createItem(); },
        __handle_createExit:    function(event) { this.__createExit(); },
        __handle_go:            function(event) { this.__go(event.getData()); },
        __handle_pickup:        function(event) { this.__pickup(event.getData()); },
        __handle_attack:        function(event) { this.__attack(event.getData()); },
        __handle_pickpocket:    function(event) { this.__pickpocket(event.getData()); },
        __handle_examineExit:   function(event) { this.__examineExit(event.getData()); },
        __handle_examineItem:   function(event) { this.__examineItem(event.getData()); },
        __handle_editExit:      function(event) { this.__editExit(event.getData()); },
        __handle_removeExit:    function(event) { this.__removeExit(event.getData()); },
        __handle_cloneItem:     function(event) { this.__cloneItem(event.getData()); },
        __handle_editItem:      function(event) { this.__editItem(event.getData()); },
        __handle_removeItem:    function(event) { this.__removeItem(event.getData()); },

        __look: function() {
            this.__addMessage("You look around the room.");
            rpg.Service.getInstance().look();
        },

        __go: function(exit) {
            this._itemDetails.setItem(null);
            this.__addMessage("You leave "+exit.getName());
            rpg.Service.getInstance().go(exit.getId());
        },

        /** Examine an item in greater detail. */
        __examine: function(item) {
            this._itemDetails.setItem(item);
        },

        __examine_closely: function(item) {
            this.__addMessage("You look at "+item.getName()+" more carefully.");
            var store = rpg.Service.getInstance().examine(item.getId());
            store.addListener('loaded', function(event) {
                var data = event.getData();
                this._itemDetails.setItem(data);
            }, this);
        },

        __pickup: function(item) {
            this.__addMessage("You pick up "+item.getName());
            var store = rpg.Service.getInstance().pickup(item.getId());
            store.addListener('loaded', function(event) {
                var data = event.getData();
                this._itemDetails.setItem(data);
            }, this);
        },

        __attack: function(item) {
            this.__addMessage("You attack "+item.getName());
            rpg.Service.getInstance().attack(item.getId());
        },

        __pickpocket: function(item) {
            this.__addMessage("You pickpocket "+item.getName());
            rpg.Service.getInstance().pickpocket(item.getId());
        },

        __teleport: function() {
        },

        __remove_room: function() {
        },

        __create: function() {
            // Show the create item window
        },

        __edit: function(item) {
        },

        __clone: function(item) {
        }
    }
});
