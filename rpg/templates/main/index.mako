<%inherit file="/layout/page.mako"/>
<%def name="head()">
</%def>
<%def name="body()">
    <h1>RPG</h1>
    <p>This is implemented with Pylons and YUI 3. Enjoy!</p>
  <div id="main">
    <div class="yui3-g">
      <div class="yui3-u-2-3">
        <div style="margin-right: 10px;"></div>
        <div id="room"></div>
      </div>
      <div class="yui3-u-1-3">
        <div style="margin-left: 10px;">
          <div id="sidebar">
            <ul>
              <li><a href="#status">Status</a></li>
              <li><a href="#Inventory">Inventory</a></li>
            </ul>
            <div>
              <div id="status">
                <table class="no-border vertical">
                  <tr>
                    <th>Name:</th><td id="status-name"></td>
                  </tr><tr>
                    <th>Health:</td><td id="status-health"></td>
                  </tr><tr>
                    <th>Effects:</td><td id="status-effects"></td>
                  </tr>
                </table>
              </div>
              <div id="inventory">
                <table class="no-border vertical">
                  <tr>
                    <th>Carrying:</th><td id="inv-carrying"></td>
                  </tr><tr>
                    <th>Wearing:</td><td id="inv-wearing"></td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div style="padding-top: 10px;">
      <div id="console"></div>
    </div>
  </div>

  <script type="text/javascript" src="http://yui.yahooapis.com/3.3.0/build/yui/yui-min.js"></script>
  <script type="text/javascript"><!--
    YUI().use('node', 'event', 'tabview', function(Y) {
      var init = function() {
        var tabview = new Y.TabView({srcNode:'#sidebar'}).render();
      };
      Y.on("domready", init);
    });
  //--></script>
</%def>
