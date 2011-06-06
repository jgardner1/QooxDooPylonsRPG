var switch_character,
    logout;
YUI().use('anim', 'transition', 'oop', 'event-key', 'base', 'node', 'event', 'event-custom', 'io', 'json', function(Y) {

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

    var room, status, input, go,
        current_mob, current_account;
    var init = function() {
        room = Y.one('#room');
        account = Y.one('#account');
        status = Y.one('#status');
        inventory = Y.one('#inventory');

        Y.one('#register-button').on('click', register_clicked);
        Y.one('#login-button').on('click', login_clicked);
        Y.one('#forgot-button').on('click', forgot_clicked);
        Y.one('#create-button').on('click', create_clicked);
        Y.one('#switch_character').on('click', switch_character);
        Y.one('#logout').on('click', logout);
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

    var switch_character = function() {
        current_mob = null;
        call_svc('logout_mob');
        show_account();
    };

    var logout = function() {
        current_mob = null;
        current_account = null;
        call_svc('logout');
        show_login();
    };

    var mob_name_change = function() {
        call_svc('update', {name:Y.one('#mob-name').get('value')});
    };

    var mob_description_change = function() {
        call_svc('update', {description:Y.one('#mob-description').get('value')});
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

        var call = call_svc('look');
        call.on('success', show_room);
    };

    var show_room = function(room) {
        Y.one('#room-name').setContent(room.name);
        Y.one('#room-description').setContent(room.description);

        show_exits(room.exits);
        show_contents(room.contents);
    };

    var show_exits = function(exits) {
        var exits_ul = Y.one('#room-exits');
        var no_exits = Y.one('#room-no-exits');

        if (exits.length == 0) {
            exits_ul.hide();
            no_exits.show();
        } else {
            exits_ul.empty();
            Y.each(exits, function(exit) {
                exits_ul.append(Y.Node.create('<li>'+exit.name+'</li>'));
            });
            no_exits.hide();
            exits_ul.show();
        }
    };

    var show_contents = function(contents) {
        var contents_ul = Y.one('#room-contents');
        var no_contents = Y.one('#room-no-contents');

        if (contents.length == 0) {
            contents_ul.hide();
            no_contents.show();
        } else {
            contents_ul.empty();
            Y.each(contents, function(item) {
                contents_ul.append(li({
                    on:{click:function(e) {
                        e.halt();
                        show_options(item, e.pageX, e.pageY);
                    }}
                }, item.name));
            });
            no_contents.hide();
            contents_ul.show();
        }
    };

    var show_options = function(mudobj, x, y) {
        var options_div = div({class:'popup options'});
        Y.one('body').append(options_div);
        options_div.setContent('<h4>Options:</h4>');
        options = [
            ['examin', 'Inspect the target more fully',
            function() {
                call_svc('examine', {target:mudobj.id});
                close();
            }],
            ['attack', 'Engage the target in combat to the death',
            function() {
                call_svc('attack', {target:mudobj.id});
                close();
            }],
            ['capture', 'Attempt to subdue the target',
            function() {
                call_svc('subdue', {target:mudobj.id});
                close();
            }],
            ['pickpocket', 'See what you can take from the target without being noticed',
            function() {
                call_svc('pickpocket', {target:mudobj.id});
                close();
            }],
            
        ];
        var option_lis = [];
        options_div.append(ul(null,
            li({
                title:'Engage the target in combat to the death',
                on:{click:function() {
                    call_svc('attack', {target:mudobj.id});
                    close();
                }}
            }, 'attack'),
            li({
                title:'Examine the target more fully',
                on:{click:function() {
                    call_svc('examine', {target:mudobj.id});
                    close();
                }}
            }, 'examine'),
            li({title:'See what you can sneak from the target\'s pockets'}, 'pickpocket'),
            li({title:'Attempt to subdue the target non-lethally'}, 'capture')));

        options_div.show(true);
        options_div.setX(x);
        options_div.setY(y);

        var close = function() {
            outside_click.detach();
            options_div.remove(true);
        };

        var outside_click = Y.on('click', function(e) {
            var clickTarget = e.target;
            if (clickTarget!==options_div && !clickTarget.ancestor(function(parentNode) {
                return parentNode._yuid === options_div._yuid;
            })) {
                close();
            }       
        }, document);
    };



});
