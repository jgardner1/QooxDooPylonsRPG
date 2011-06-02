from rpg.tests import *

class TestSvcController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='svc', action='index'))
        # Test response...
