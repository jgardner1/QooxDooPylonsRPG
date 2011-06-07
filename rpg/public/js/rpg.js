YUI().use(
    'anim', 'transition', 'oop', 'event-key', 'base', 'node', 'event',
    'event-custom', 'io', 'json',
    'widget-position', 'widget-position-constrain',
function(Y) {

    var Ycreate = Y.Node.create;

    var ServiceRequest = function(method, args) {
        var self = this;
        var success = this.publish('success', {
            broadcast: 2,
            fireOnce: true,
            async: false
        });

        var exception = this.publish('exception', {
            broadcast: 2,
            fireOnce: true,
            async: false
        });

        this._request = Y.io('/svc/'+method+'.json?'+Y.JSON.stringify(args || {}), {
            on:{
                success: function(id, response) {
                    var response = Y.JSON.parse(response.responseText);
                    if (response.exception) {
                        exception.fire(response.exception, method, args);
                    } else {
                        success.fire(response.response, method, args);
                    }
                },
                failure: function(id, response) {
                    var msg = 'failed to call "'+method+ '": '+
                        response.status+' '+response.statusText;
                    exception.fire({
                        name:'HTTP error',
                        message:msg,
                        status:response.status,
                        statusText:response.statusText,
                        responseText:response.responseText
                    }, method, args);
                }
            }
        });
    };
    Y.augment(ServiceRequest, Y.EventTarget);

    var call_svc = function(method, args) {
        return new ServiceRequest(method, args);
    };

    var room, status, current_mob, current_account, current_room;
    var init = function() {
        room = Y.one('#room');
        account = Y.one('#account');
        status = Y.one('#status');
        inventory = Y.one('#inventory');

        Y.one('#register-button').on('click', register_clicked);
        Y.one('#login-button').on('click', login_clicked);
        Y.one('#forgot-button').on('click', forgot_clicked);
        Y.one('#create-button').on('click', create_clicked);
        Y.one('#mob-name').on('change', mob_name_change);
        Y.one('#mob-description').on('change', mob_description_change);

        var get_mob_account = call_svc('get_mob_account', {});
        get_mob_account.on('success', function(response) {
            if (response.account) {
                current_account = response.account
                if (response.mob) {
                    current_mob = response.mob;
                    show_main();
                } else {
                    show_account();
                }
            } else {
                show_login();
            }
        });
    };
    Y.on("domready", init);

    var register_clicked = function() {
        var error   = Y.one('#register-error');
        var loading = Y.one('#register-loading');
        var button  = Y.one('#register-button');

        var email = Y.one('#register-email').get('value');
        var password = Y.one('#register-password').get('value');

        if (!email || !password) {
            error.setContent('You must specify an email and password.').show();
            return;
        } 

        loading.show();
        error.hide();
        button.hide();

        var call = call_svc('register', {
            email:email,
            password:password
        });
        
        call.on('success', function(account) {
            current_account = account;
            show_account();
        });
        
        call.on('exception', function(exception) {
            error.setContent(exception.message).show();
            loading.hide();
            button.show();
        });
    };

    var login_clicked = function() {
        var error   = Y.one('#login-error');
        var loading = Y.one('#login-loading');
        var button  = Y.one('#login-button');

        var email = Y.one('#login-email').get('value');
        var password = Y.one('#login-password').get('value');

        if (!email || !password) {
            error.setContent('You must specify an email and password.').show();
            return;
        } 

        loading.show();
        error.hide();
        button.hide();

        var call = call_svc('login', {
            email:email,
            password:password
        });
        
        call.on('success', function(account) {
            current_account = account;
            show_account();
        });
        
        call.on('exception', function(exception) {
            error.setContent(exception.message).show();
            loading.hide();
            button.show();
        });
    };

    var forgot_clicked = function() {
        alert('not implemented');
    };

    var create_clicked = function() {
        var error   = Y.one('#create-error');
        var loading = Y.one('#create-loading');
        var button  = Y.one('#create-button');

        var name = Y.one('#create-name').get('value');

        if (!name) {
            error.setContent("Must specify a name").show();
            return;
        }

        loading.show();
        error.hide();
        button.hide();
        var call = call_svc('create_mob', {name:name});

        call.on('success', function(mob) {
            current_mob = mob;
            show_main();
        });
        
        call.on('exception', function(exception) {
            error.setContent(exception.message).show();
            loading.hide();
            button.show();
        });
    };

    var mob_name_change = function() {
        call_svc('edit', {
            id:current_mob.id,
            name:Y.one('#mob-name').get('value')});
    };

    var mob_description_change = function() {
        call_svc('edit', {
            id: current_mob.id,
            description:Y.one('#mob-description').get('value')});
    };

    var show_login = function() {
        Y.one('#login-popup').show();

        Y.one('#register-email').set('value', '');
        Y.one('#register-password').set('value', '');
        Y.one('#login-email').set('value', '');
        Y.one('#login-password').set('value', '');
        Y.one('#forgot-email').set('value', '');

        Y.one('#mob-popup').hide();
        Y.one('#main').hide();
    };

    var show_account = function() {
        Y.one('#login-popup').hide();
        Y.one('#mob-popup').show();
        Y.one('#account-email').setContent(current_account.email);

        var mobs_div = Y.one('#account-mobs');
        mobs_div.empty();
        Y.each(current_account.mobs, function(mob) {
            var div = mobs_div.append('<div>'+mob.name+'</div>');
            div.on('click', function() {
                call_svc('choose_mob', {mob_id:mob.id});
                current_mob = mob;
                show_main();
            });
        });
        Y.one('#create-name').set('value', '');

        Y.one('#main').hide();
    };

    var show_main = function() {
        Y.one('#login-popup').hide();
        Y.one('#mob-popup').hide();
        Y.one('#main').show();

        Y.one('#mob-name').set('value', current_mob.name);
        Y.one('#mob-description').set('value', current_mob.description);

        Y.one('#room-name').on('click', function(e) {
            show_options(current_room, [e.pageX, e.pageY], true);
        });

        var a = Y.one('#global-actions');
        a.empty();
        add_action(a, switch_character, [], null);
        add_action(a, logout, [], null);

        look.action();
    };

    var show_room = function() {
        Y.one('#room-name').setContent(current_room.name);
        if (current_mob.god) {
            Y.one('#room-id').show().setContent(current_room.id);
        } else {
            Y.one('#room-id').hide();
        }
        Y.one('#room-description').setContent(current_room.description);

        show_exits(current_room.exits);
        show_contents(current_room.contents);
    };

    var show_exits = function(exits) {
        var exits_div = Y.one('#room-exits');
        var no_exits = Y.one('#room-no-exits');
        var dirs = {
            'north':false,
            'south':false,
            'east':false,
            'west':false,
            'up':false,
            'down':false,
        };

        exits_div.empty();
        if (exits.length == 0) {
            no_exits.show();
        } else {
            Y.each(exits, function(exit) {
                dirs[exit.name] = true;
                exits_div.append(div(null, span({
                    class:'action',
                    title:exit.description || '',
                    on:{click:function(e){
                        show_options(exit, [e.pageX, e.pageY], true);
                    }},
                }, exit.name || 'unnamed exit')));
            });
            no_exits.hide();
        }
        if (current_mob.god) {
            exits_div.append('<hr/>');
            Y.each(['north', 'south', 'east', 'west', 'up', 'down'], function(dir) {
                if (!dirs[dir]) {
                    add_action(exits_div, dig, [dir], null);
                }
            });
            exits_div.append(div(null, span({
                class:'action',
                title: 'Link a new exit to an existing room',
                on:{click: function(e) {
                    // TODO: Collect direction and room id, and whether to link back.
                    var popup = new LinkExitPopup();
                    popup.render();
                    popup.show();
                    var xy = [e.pageX, e.pageY];
                    popup.set('xy', xy);
                    popup.constrain(xy, true);
                    popup.on('submit', function(p) {
                        var link_room = function(dest_id) {
                            var create_exit = call_svc('create', {
                                name:p.name,
                                source_id:current_room.id,
                                dest_id:dest_id
                            });
                            create_exit.on('success', look.action);
                            if (p.reverse && opposite_direction[p.name]) {
                                call_svc('create', {
                                    name: opposite_direction[p.name],
                                    source_id:dest_id,
                                    dest_id:current_room.id
                                })
                            }
                        };
                        if (!p.dest_id) {
                            var create_room = call_svc('create', {
                                name:'Empty Room',
                                description:"This is a brand new, empty room."
                            });
                            create_room.on('success', function(room) {
                                link_room(room.id);
                            });
                        } else {
                            link_room(p.dest_id);
                        }
                        popup.destroy();
                    });
                    popup.on('cancel', function() {
                        popup.destroy();
                    });
                    popup.after('visibleChange', function() {
                        if (!popup.get('visible')) {
                            popup.destroy();
                        }
                    });
                }}},
                'new exit')));
        }
    };

    var show_contents = function(contents) {
        var contents_div = Y.one('#room-contents');
        var no_contents = Y.one('#room-no-contents');

        if (contents.length == 0) {
            contents_div.hide();
            no_contents.show();
        } else {
            contents_div.empty();
            Y.each(contents, function(item) {
                contents_div.append(div(null, span({
                    class:'action',
                    title:item.description || '',
                    on:{click:function(e) {
                        show_options(item, [e.pageX, e.pageY], true);
                    }}
                }, item.name || 'unnamed object')));
            });
            no_contents.hide();
            contents_div.show();
        }
    };

    var options_popup;
    var show_options = function(mudobj, xy, constraint) {
        if (!options_popup) {
            options_popup = new OptionsPopup({});
            options_popup.render();
        }
        options_popup.set('mudobj', mudobj);
        options_popup.show();
        options_popup.set('xy', xy);
        options_popup.constrain(xy, true, constraint)
    };

    var repeat = function(val) {
        return function() {
            return val;
        }
    };
    var repeat_true = repeat(true);

    var is_exit = function(o) {
        return o.dest_id && o.source_id;
    };

    var is_admin = function() {
        return current_mob.god;
    };

    var action = function(name, description, test, action) {
        return {
            name: name,
            description: description,
            test: test,
            action: action
        };
    };

    var switch_character = action(
        'switch character',
        function() {
            return 'Logout as '+current_mob.name+' and login as someone else';
        },
        repeat_true,
        function() {
            current_mob = null;
            call_svc('logout_mob');
            show_account();
        });

    var logout = action(
        'logout',
        function () {
            return 'Logout from your account';
        },
        repeat_true,
        function() {
            current_mob = null;
            current_account = null;
            call_svc('logout');
            show_login();
        });

    var opposite_directions = {
        'north':'south',
        'south':'north',
        'east':'west',
        'west':'east',
        'up':'down',
        'down':'up',
    };
    var dig = action(
        function(dir) {
            return "dig "+dir;
        },
        function(dir) {
            return "dig "+dir;
        },
        repeat_true,
        function(dir) {
            // Create a new room
            var create_room = call_svc('create', {
                name: 'Empty Room',
                description: 'This is a brand new, empty room.'
            });
            create_room.on('success', function(room) {
                var create_exit = call_svc('create', {
                    name:dir,
                    source_id:current_room.id,
                    dest_id:room.id
                });
                create_exit.on('success', look.action);

                call_svc('create', {
                    name:opposite_directions[dir],
                    source_id: room.id,
                    dest_id: current_room.id
                });
            });
        });


    var go = action(
        'go',
        function(o) {
            return "go "+o.name;
        },
        is_exit,
        function(o) {
            var call = call_svc('go', {exit_id:o.id});
            call.on('success', look.action);
        });

    var look = action(
        'look',
        function(o) {
            return 'Look at the room more closely.';
        },
        function(o) {
            return o.id == current_room.id;
        },
        function(o) {
            var call = call_svc('look');
            call.on('success', function(room) {
                current_room = room;
                show_room();
            });
        });

    var examine = action(
        'examine',
        function(o) {
            return "Examine "+o.name+" more closely";
        },
        function(o) {
            return o.id != current_room.id;
        },
        function(o) {
            alert("examine");
        });

    var clone = action(
        'clone',
        function(o) {
            return "Create a clone of "+o.name;
        },
        function(o){
            return is_admin() && o.id != current_room.id;
        },
        function(o) {
            alert('clone');
        });

    var edit = action(
        'edit',
        function(o) {
            return "Edit this";
        },
        is_admin,
        function(o) {
            alert('edit');
        });

    var add_action = function(el, action, args, on_exec) {
        var test = action.test || false;
        if (test.apply) {
            test = test.apply(null, args);
        }

        if (test) {
            var name = action.name || '';
            if (action.name.apply) {
                 name = action.name.apply(null, args);
            }

            var description = action.description || '';
            if (description.apply) {
                description = description.apply(null, args);
            }

            el.append(div({class:'option'},
                span({
                    title:description,
                    class:'action',
                    on:{click:function() {
                        action.action.apply(null, args);
                        on_exec && on_exec();
                    }}}, name)));
        }
    };

    var OptionsPopup = Y.Base.create('options-popup', Y.Widget,
        [Y.WidgetPosition, Y.WidgetPositionConstrain], {
            actions: [ look, go, examine, clone, edit ],

            initializer: function(config) {
                this.after('mudobjChange', this.syncUI);
                this.after('visibleChange', this._afterVisibleChange);
            },

            _afterVisibleChange: function() {
                if (this.get('visible')) {
                    var self = this;
                    var cb = this.get('contentBox');
                    this._outside_click = cb.get('ownerDocument').on('mousedown',
                        function(e) {
                            var t = e.target;
                            if (!t.compareTo(cb) && !cb.contains(t)) {
                                self.hide();
                            }       
                        });
                } else {
                    this._outside_click.detach();
                }
            },

            renderUI: function() {
                var self = this;
            },

            bindUI: function() {
                this._afterVisibleChange();
            },

            syncUI: function() {
                var self = this;
                var o = this.get('mudobj')
                var cb = this.get('contentBox');
                cb.empty();
                if (o) {
                    Y.each(this.actions, function(action) {
                        add_action(cb, action, [o], function() {
                            self.hide();
                        });
                    });
                }
            }
        }, {
            ATTRS: {
                mudobj: {}
            }
        });

    var LinkExitPopup = Y.Base.create('link-exit-popup', Y.Widget,
        [Y.WidgetPosition, Y.WidgetPositionConstrain, Y.EventTarget],
        {
            initializer: function() {
                this.publish('submit');
                this.publish('cancel');
                this.after('visibleChange', this._afterVisibleChange);
                this._afterVisibleChange();
            },
            renderUI: function() {
                var self = this;
                var cb = this.get('contentBox');

                var _table = table({class:'no-border vertical'});
                cb.append(_table);

                var _tbody = tbody();
                _table.append(_tbody);

                _tbody.append(tr(null, td({colspan:2}, h2(null, "Add an Exit"))));

                this._name = input({type:'text'});
                this._reverse = input({type:'checkbox', checked:'checked'});
                this._dest_id = input({type:'text'});
                this._submit = button(null, 'submit');
                this._submit.on('click', function() {
                    self.fire('submit', {
                        name:self._name.get('value'),
                        reverse:self._reverse.get('checked'),
                        dest_id:self._dest_id.get('value'),
                    });
                });
                this._cancel = button(null, 'cancel');
                this._cancel.on('click', function() {
                    self.fire('cancel');
                });

                _tbody.append(tr(null,
                    th(null, 'Name:'),
                    td(null, this._name)));

                _tbody.append(tr(null,
                    th(null, 'Reverse:'),
                    td(null, this._reverse)));

                _tbody.append(tr(null,
                    th(null, 'Room ID:'),
                    td(null, this._dest_id)));

                _tbody.append(tr(null,
                    th(null, ''),
                    td(null, this._submit, this._cancel)));
            },

            _afterVisibleChange: function() {
                if (this.get('visible')) {
                    var self = this;
                    var cb = this.get('contentBox');
                    this._outside_click = cb.get('ownerDocument').on('mousedown',
                        function(e) {
                            var t = e.target;
                            if (!t.compareTo(cb) && !cb.contains(t)) {
                                self.hide();
                            }       
                        });
                } else {
                    this._outside_click.detach();
                }
            },

            
        }, {
        });
});
