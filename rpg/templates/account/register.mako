<%inherit file="/layout/page.mako"/>
<%def name="body()">
  <h1>Register your Account</h1>

  <form action="${url(controller='account', action='register_submit')}">
    <strong>Your Email:</strong><br/>
    <input type="email"/><br/>
    <input type="submit" value="Register"/>
  </form>
</%def>
