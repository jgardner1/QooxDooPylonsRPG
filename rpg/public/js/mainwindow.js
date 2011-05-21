var MainWindow;
YUI().use('widget', 'widget-parent', 'widget-child', function(Y) {
    var YLang = Y.Lang,
        YisValue = YLang.isValue,
        Ysubstitute = Y.Lang.substitute,
        YNode = Y.Node,
        Ycreate = YNode.create,
        YgetClassName = Y.ClassNameManager.getClassName,
        TEMPLATE_DIV = "<div></div>";


    MainWindow = Y.Base.create('mainwindow', Y.Widget, [Y.WidgetParent], {
    }, {
        ATTRS: {
        }
    });

    DockWindow = Y.Base.create('dockwindow', Y.Widget, [Y.WidgetChild], {
    }, {
        ATTRS: {
            label: {
                setter: '_defLabelSetter',
                validator: YLang.isString
            }
        }
    });
});
