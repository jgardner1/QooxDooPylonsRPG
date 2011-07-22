qx.Class.define("rpg.Message", {
    statics: {
        _createWindow : function(caption, msg, smallIcon, bigIcon, controls) {
            // window
            var w = new qx.ui.window.Window(caption, smallIcon);
            w.setModal(true);
            w.setShowMaximize(false);
            w.setShowMinimize(false);
            w.setShowClose(false);

            /*
            w.addEventListener("appear", function() {
                this.centerToBrowser();
            }, w);
            */


            // layout
            var l = new qx.ui.layout.VBox(10);
            w.setLayout(l);

            // icon and message
            var icon_label = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
            var icon = new qx.ui.basic.Image(bigIcon);
            var a = new qx.ui.basic.Label(msg);
            icon_label.add(icon);
            icon_label.add(a, {flex:1});
            w.add(icon_label, {flex:1});

            // controls array
            controls.forEach(function(control) {
                w.add(control);
            });

            w.open();
            w.center();
            return w;
        },

        inform : function(msg, callback, context) {
          // "OK" button
          var b = new qx.ui.form.Button("OK", "icon/16/actions/dialog-ok.png");
          var controls = [ b ];
     
          // window
          var w = this._createWindow(
            "Information",
            msg,
            "icon/16/status/dialog-information.png",
            "icon/32/status/dialog-information.png",
            controls);
     
          b.addListener("execute", function()
          {
            w.close()
     
            if (typeof (callback) == "function") {
              callback.call(context);
            }
          });
        },

        loading: function(msg, store) {
            var ok, w, done_fn;
            // "OK" button
            ok = new qx.ui.form.Button("OK", "icon/16/actions/dialog-ok.png");
            ok.addListener('execute', function() {
                w.close();
                w.dispose();
            });
            ok.setVisibility('excluded');

            done_fn = function() {
                ok.setVisibility('visible');
            };


            store.addListener('error', done_fn);
            store.addListener('loaded', done_fn);
     
            w = this._createWindow(
                "Information",
                msg,
                "icon/16/status/dialog-information.png",
                "icon/32/status/dialog-information.png",
                [ ok ]);
        }
    }
});
