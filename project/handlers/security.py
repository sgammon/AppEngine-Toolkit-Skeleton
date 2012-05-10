# -*- coding: utf-8 -*-
from project.handlers import WebHandler


class Login(WebHandler):

    ''' Default login handler - redirect using App Engine's users API, if available. '''

    def get(self):

        try:
            login_url = self.api.users.create_login_url(self.request.environ.get('HTTP_REFERRER', '/'))
            if login_url is not None:
                return self.redirect(login_url)

        except:
            self.error(404)
            return


class Logout(WebHandler):

    ''' Default logout handler - redirect using App Engine's users API, if available. '''

    def get(self):

        try:
            logout_url = self.api.users.create_logout_url(self.request.environ.get('HTTP_REFERRER', '/'))
            if logout_url is not None:
                return self.redirect(logout_url)

        except:
            self.error(404)
            return


class Signup(WebHandler):

    ''' Default signup handler - return 404 by default. '''

    def get(self):
        pass
