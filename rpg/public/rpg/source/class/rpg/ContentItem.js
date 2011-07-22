qx.Class.define('rpg.ContentItem', {
    extend : qx.ui.core.Widget,
    implement : [qx.ui.form.IModel],
    include: [qx.ui.form.MModelProperty],

    properties: {
        appearance: {
            refine: true,
            init: 'listitem'
        },

        name: {
            apply: '_applyName',
            nullable: true
        },

        description: {
            apply: '_applyDescription',
            nullable: true
        }
    },

    construct: function () {
        this.base(arguments);

        // initialize the layout and allow wrap for "post"
        var layout = new qx.ui.layout.VBox(4);
        this._setLayout(layout);

        this._createChildControl('name');
        this._createChildControl('description');
    },

    members : {
        // overridden
        _createChildControlImpl : function(id) {
            var control;

            switch(id) {
                case "name":
                    control = new qx.ui.basic.Label(this.getName()).set({
                        font: 'bold'
                    });
                    control.setAnonymous(true);
                    this._add(control);
                    break;

                case "description":
                    control = new qx.ui.basic.Label(this.getDescription());
                    control.setAnonymous(true);
                    control.setRich(true);
                    this._add(control, {flex:1});
                    break;
            }

            return control || this.base(arguments, id);
        },

        // property apply
        _applyName : function(value, old) {
            var name = this.getChildControl("name");
            name.setValue(value);
        },

        // property apply
        _applyDescription : function(value, old) {
            var description = this.getChildControl("description");
            description.setValue(value);
        }
    }

});
