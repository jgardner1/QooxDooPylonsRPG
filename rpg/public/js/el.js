var el, tr, td, span, div, img, br, a, ul, ol, li, button, input, input_text,
    input_password, checkbox, radio, textarea;
YUI().use('node', 'event', function(Y) {
    var _init_attrs = function(el, attrs) {
        for (var attr in attrs) {
            if (attr == 'on') {
                events = attrs[attr];
                for (var event in events) {
                    el.on(event, events[event]);
                }
            } else if (attr == 'after') {
                events = attrs[attr];
                for (var event in events) {
                    el.after(event, events[event]);
                }
            } else if (attr == 'before') {
                events = attrs[attr];
                for (var event in events) {
                    el.before(event, events[event]);
                }
            } else {
                el.setAttribute(attr, attrs[attr]);
            }
        }
    };

    el = function(type, attrs) {
        var el = Y.Node.create('<'+type+'>');
        _init_attr(el, attrs);

        for (var i=2; i<arguments.length; i++) {
            el.append(arguments[i]);
        }
       
        return el;
    };

    var _named_el = function(type) {
        return function(attrs) {
            var el = Y.Node.create('<'+type+'>');
                
            _init_attrs(el, attrs);
            
            for (var i=1; i<arguments.length; i++) {
                el.append(arguments[i]);
            }
            
            return el;
        };
    };      
            
    hr = _named_el('hr');
    table = _named_el('table');
    thead = _named_el('thead');
    tbody = _named_el('tbody');
    tfoot = _named_el('tfoot');
    tr = _named_el('tr');
    th = _named_el('th');
    td = _named_el('td');
    span = _named_el('span');
    div = _named_el('div');
    img = _named_el('img');
    br = _named_el('br');
    a = _named_el('a');
    ol = _named_el('ol');
    ul = _named_el('ul');
    li = _named_el('li');

    h1 = _named_el('h1');
    h2 = _named_el('h2');
    h3 = _named_el('h3');
    h4 = _named_el('h4');
    h5 = _named_el('h5');
    h6 = _named_el('h6');

    button = _named_el('button');
    input = _named_el('input');
    textarea = _named_el('textarea');
});
