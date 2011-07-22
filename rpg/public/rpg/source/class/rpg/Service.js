qx.Class.define("rpg.Service", {
    extend: qx.core.Object,
    type: 'singleton',

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

    events: {
        message: 'qx.event.type.Data'
    },

    members: {
        _applyAccount: function(value, old, name) {
            this.setMob(null);
        },

        _applyMob: function(value, old, name) {
            this.setRoom(null);
        },

        _call: function(method, args) {
            var store = new qx.data.store.Json('/svc/'+method+'.json?'+
                qx.lang.Json.stringify(args), 'GET', 'application/json',
                {
                    configureRequest:function(request) {
                        request.setProhibitCaching(false);
                    }
                });
            return store;
        },

        register: function(email, password) {
            var store = this._call('register', {email:email, password:password});
            store.bind("model.account", this, "account");
            this.setMob(null);
            return store;
        },

        login: function(email, password) {
            var store = this._call('login', {email:email, password:password});
            store.bind("model.account", this, "account");
            this.setMob(null);
            return store;
        },

        logout: function() {
            var store = this._call('logout', {});
            this.setAccount(null);
            return store;
        },

        choose_mob: function(id) {
            var store = this._call('choose_mob', {id:id});
            store.bind("model.mob", this, "mob");
            return store;
        },

        create_mob: function(name) {
            var store = this._call('create_mob', {name:name});
            store.bind("model.mob", this, "mob");
            return store;
        },

        logout_mob: function() {
            var store = this._call('logout_mob', {});
            this.setMob(null);
            return store;
        },

        get_mob_account: function() {
            var store = this._call('get_mob_account', {});
            store.bind('model.account', this, 'account');
            store.bind('model.mob', this, 'mob');
            return store;
        },

        look:function() {
            var store = this._call('look', {});
            store.bind('model.room', this, 'room');
            return store;
        },

        examine:function(item_id) {
            return this._call('examine', {id:item_id});
        },

        pickup:function(item_id) {
            return this._call('pickup', {id:item_id});
        },

        go: function(exit_id) {
            var store = this._call('go', {exit_id:exit_id});
            store.bind('model.room', this, 'room');
            return store;
        },

        /** Creates a new mob. If you don't specify a location, it will be in
         * limbo. Note that neither the room nor the mob is updated.
         */
        create: function(params) {
            var store = this._call('create', params);
            return store;
        },

        /** Edits an existing mob. */
        update: function(params) {
            var store = this._call('update', params);
            return store;
        },

        /** The createRoom is a special craete that will teleport the creator
         * to the new room. As such, the room and mob are both updated.
         */
        createRoom: function(params) {
            var store = this._call('createRoom', params);
            store.bind('model.room', this, 'room');
            store.bind('model.mob',  this, 'mob');
            return store;
        }
    }
});
