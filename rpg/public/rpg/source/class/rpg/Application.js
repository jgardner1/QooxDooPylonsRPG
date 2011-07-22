/* ************************************************************************

     Copyright:

     License:

     Authors:

************************************************************************ */

/* ************************************************************************

#asset(rpg/*)

************************************************************************ */

/**
 * This is the main application class of your custom application "rpg"
 */
qx.Class.define("rpg.Application",
{
    extend : qx.application.Standalone,



    /*
    *****************************************************************************
         MEMBERS
    *****************************************************************************
    */

    members :
    {
        /**
         * This method contains the initial application code and gets called 
         * during startup of the application
         * 
         * @lint ignoreDeprecated(alert)
         */
        main : function()
        {
            // Call super class
            this.base(arguments);

            // Enable logging in debug variant
            if (qx.core.Environment.get("qx.debug"))
            {
                // support native logging capabilities, e.g. Firebug for Firefox
                qx.log.appender.Native;
                // support additional cross-browser console. Press F7 to toggle visibility
                qx.log.appender.Console;
            }

            /*
            -------------------------------------------------------------------------
                Below is your actual application code...
            -------------------------------------------------------------------------
            */

            var main;

            var store = rpg.Service.getInstance().get_mob_account();
            store.addListener('loaded', function() {
                main = new rpg.MainWindow();
                main.open();
                main.maximize()
            ;});

        }
    }
});
