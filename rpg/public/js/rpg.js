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
            var DIV = mobs_div.append('<DIV>'+mob.name+'</DIV>');
            DIV.on('click', function() {
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
                exits_div.append(DIV(null, SPAN({
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
            exits_div.append('<HR/>');
            Y.each(['north', 'south', 'east', 'west', 'up', 'down'], function(dir) {
                if (!dirs[dir]) {
                    add_action(exits_div, dig, [dir], null);
                }
            });
            exits_div.append(DIV(null, SPAN({
                class:'action',
                title: 'Link a new exit to an existing room',
                on:{click: function(e) {
                    var popup = new CreateExitPopup();
                    popup.render();
                    popup.show();
                    var xy = [e.pageX, e.pageY];
                    popup.set('xy', xy);
                    popup.constrain(xy, true);
                    popup.on('submit', create_exit);
                    popup.after('submit', function() {
                        popup.destroy();
                    });
                    popup.after('cancel', function() {
                        popup.destroy();
                    });
                    popup.after('visibleChange', function() {
                        if (!popup.get('visible')) {
                            popup.destroy();
                        }
                    });
                }}},
                'create exit')));
        }
    };

    var show_contents = function(contents) {
        var contents_div = Y.one('#room-contents');
        var no_contents = Y.one('#room-no-contents');

        contents_div.empty();
        if (contents.length == 0) {
            no_contents.show();
        } else {
            Y.each(contents, function(item) {
                contents_div.append(DIV(null, SPAN({
                    class:'action',
                    title:item.description || '',
                    on:{click:function(e) {
                        show_options(item, [e.pageX, e.pageY], true);
                    }}
                }, item.name || 'unnamed object')));
            });
            no_contents.hide();
        }

        if (current_mob.god) {
            contents_div.append(HR());
            contents_div.append(DIV(null, SPAN({
                class:'action',
                title:'Create a new object in this room',
                on:{click:function(event) {
                    var popup = new EditPopup({});
                    popup.render();
                    popup.show();
                    var xy = [event.pageX, event.pageY];
                    popup.set('xy', xy);
                    popup.constrain(xy, true);
                    popup.on('submit', function(p) {
                        p = p.details[0];
                        p.container_id = current_mob.container_id;
                        var call = call_svc('create', p);
                        call.on('success', look.action);
                    });
                    popup.after('submit', function() {
                        popup.destroy();
                    });
                    popup.after('cancel', function() {
                        popup.destroy();
                    });
                    popup.after('visibleChange', function() {
                        if (!popup.get('visible')) {
                            popup.destroy();
                        }
                    });
                }}}, "add object")));
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

    var create_exit = function(p) {
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

        var link_room = function(dest_id) {
            var create_exit = call_svc('create', {
                name:p.name,
                source_id:current_room.id,
                dest_id:dest_id
            });
            create_exit.on('success', look.action);
            if (p.reverse) {
                call_svc('create', {
                    name: p.reverse,
                    source_id:dest_id,
                    dest_id:current_room.id
                })
            }
        };
    };


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
            var call = call_svc('clone', {id:o.id});
            call.on('success', look.action);
        });

    var edit = action(
        'edit',
        function(o) {
            return "Edit this";
        },
        is_admin,
        function(o) {
            var popup = new EditPopup({mudobj:o});
            popup.render();
            popup.show();
            var xy = [event.pageX, event.pageY];
            popup.set('xy', xy);
            popup.constrain(xy, true);
            popup.on('submit', edit_submit);
            popup.after('submit', function() {
                popup.destroy();
            });
            popup.after('cancel', function() {
                popup.destroy();
            });
            popup.after('visibleChange', function() {
                if (!popup.get('visible')) {
                    popup.destroy();
                }
            });
        });
    var edit_submit = function(p) {
        var call = call_svc('update', p.details[0]);
        call.on('success', look.action);
    };

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

            el.append(DIV({class:'option'},
                SPAN({
                    title:description,
                    class:'action',
                    on:{click:function(e) {
                        event = e;
                        action.action.apply(null, args);
                        on_exec && on_exec();
                    }}}, name)));
        }
    };

    var Popup = Y.Base.create('popup', Y.Widget,
        [Y.WidgetPosition, Y.WidgetPositionConstrain], {
            initializer: function(config) {
                this.after('visibleChange', this._afterVisibleChange);
            },

            _afterVisibleChange: function() {
                if (this.get('visible')) {
                    this.get('boundingBox').removeClass('yui3-popup-hidden');
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
                    this.get('boundingBox').addClass('yui3-popup-hidden');
                }
            },

            bindUI: function() {
                this._afterVisibleChange();
            },

            renderUI: function() {
                this.get('boundingBox').addClass('yui3-popup');
                this.get('contentBox').addClass('yui3-popup-content');
            },

        }, {
        });


    var OptionsPopup = Y.Base.create('options-popup', Popup,
        [], {
            actions: [ look, go, examine, clone, edit ],

            initializer: function(config) {
                Popup.prototype.initializer.call(this, config);
                this.after('mudobjChange', this.syncUI);
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

    var FormPopup = Y.Base.create('form-popup', Popup,
        [Y.EventTarget],
        {
            initializer: function(config) {
                Popup.prototype.initializer.call(this, config);
                this.publish('submit');
                this.publish('cancel');
            },
            renderUI: function() {
                Popup.prototype.renderUI.call(this);
                var self = this;
                var cb = this.get('contentBox');

                this._submit = BUTTON(null, 'submit');
                this._submit.on('click', function() {
                    self.fire('submit', self.get_values());
                });
                this._cancel = BUTTON(null, 'cancel');
                this._cancel.on('click', function() {
                    self.fire('cancel');
                });
            }
        }, {
        });

    var CreateExitPopup = Y.Base.create('link-exit-popup', FormPopup,
        [],
        {
            renderUI: function() {
                Popup.prototype.renderUI.call(this);
                FormPopup.prototype.renderUI.call(this);
                var self = this;
                var cb = this.get('contentBox');

                var _table = TABLE({
                    class:'no-border vertical',
                    style:'margin:0;'});
                cb.append(_table);

                var _tbody = TBODY();
                _table.append(_tbody);

                _tbody.append(TR(null, TD({colspan:2}, H2(null, "Add an Exit"))));

                this._name = INPUT({type:'text'});
                this._reverse = INPUT({type:'text'});
                this._dest_id = INPUT({type:'text'});

                _tbody.append(TR(null,
                    TH(null, 'Name:'),
                    TD(null, this._name)));

                _tbody.append(TR(null,
                    TH(null, 'Reverse:'),
                    TD(null, this._reverse)));

                _tbody.append(TR(null,
                    TH(null, 'Room ID:'),
                    TD(null, this._dest_id)));

                _tbody.append(TR(null,
                    TH(null, ''),
                    TD(null, this._submit, this._cancel)));
            },

            get_values: function() {
                return {
                    name:self._name.get('value'),
                    reverse:self._reverse.get('value'),
                    dest_id:self._dest_id.get('value')
                };
            }
        }, {
        });

    var EditPopup = Y.Base.create('edit-popup', FormPopup,
        [],
        {
            initializer: function(config) {
                FormPopup.prototype.initializer.call(this, config);
                this.after('mudobjChange', this.syncUI);
            },

            renderUI: function() {
                FormPopup.prototype.renderUI.call(this);
                var self = this;
                var cb = this.get('contentBox');

                var _table = TABLE({
                    class:'no-border vertical',
                    style:'margin:0;'});
                cb.append(_table);

                var _tbody = TBODY();
                _table.append(_tbody);

                this._id = SPAN();
                this._name = INPUT({type:'text'});
                this._description = TEXTAREA();
                this._container_id = INPUT({type:'text'});
                this._source_id = INPUT({type:'text'});
                this._dest_id = INPUT({type:'text'});
                this._god = INPUT({type:'checkbox'});
                this._ai = INPUT({type:'text'});
                this._size = INPUT({type:'text'});
                this._interior_size = INPUT({type:'text'});
                this._x = INPUT({type:'text'});
                this._y = INPUT({type:'text'});

                var ROW = function(name, content) {
                    return TR(null,
                        TH(null, name),
                        TD(null, content));
                }

                this._id_tr = _tbody.appendChild(ROW('ID:', this._id))
                _tbody.append(ROW('Name:', this._name));
                _tbody.append(ROW('Desc:', this._description));
                _tbody.append(ROW('Container:', this._container_id));
                _tbody.append(ROW('Exit Source:', this._source_id));
                _tbody.append(ROW('Exit Dest:', this._dest_id));
                _tbody.append(ROW('God?', this._god));
                _tbody.append(ROW('AI:', this._ai));
                _tbody.append(ROW('Size:', this._size));
                _tbody.append(ROW('Int. Size:', this._interior_size));
                _tbody.append(ROW('X:', this._x));
                _tbody.append(ROW('Y:', this._y));
                _tbody.append(ROW('', [this._submit, this._cancel]));
            },

            get_values: function() {
                var result = {};
                var o = this.get('mudobj');
                if (o) {
                    result.id = o.id;
                }
                result.name = this._name.get('value');
                result.description = this._description.get('value');
                result.container_id = this._container_id.get('value');
                result.source_id = this._source_id.get('value');
                result.dest_id = this._dest_id.get('value');
                result.god = this._god.get('checked');
                result.ai = this._ai.get('value');
                result.size = this._size.get('value');
                result.interior_size = this._interior_size.get('value');
                result.x = this._x.get('value');
                result.y = this._y.get('value');
                return result;
            },

            syncUI: function() {
                var self = this;
                var o = this.get('mudobj')
                if (o) {
                    this._id_tr.show();
                    this._id.setContent(o.id);
                    this._name.set('value', o.name || '');
                    this._description.set('value', o.description || '');
                    this._container_id.set('value', o.container_id || '');
                    this._source_id.set('value', o.source_id || '');
                    this._dest_id.set('value', o.dest_id || '');
                    this._god.set('checked', o.god);
                    this._ai.set('value', o.ai || '');
                    this._size.set('value', o.size || '');
                    this._interior_size.set('value', o.interior_size || '');
                    this._x.set('value', o.x || '');
                    this._y.set('value', o.y || '');
                } else {
                    this._id_tr.hide();
                }
            }
        }, {
            ATTRS: {
                mudobj: {}
            }
        });
});
