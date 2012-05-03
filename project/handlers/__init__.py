# -*- coding: utf-8 -*-

'''

Project Handlers

This module is where you put your project's RequestHandlers. WebHandler and MobileHandler
are designed to be extended by your app's handlers. This gives you a chance to inject custom
logic / request handling stuff across your entire app, by putting it here.

-sam (<sam@momentum.io>)

'''

## AppTools Imports
from apptools.core import BaseHandler


class WebHandler(BaseHandler):

    ''' Handler for desktop web requests. '''

    def head(self):

        ''' Run GET, if defined, and return the headers only. '''

        if hasattr(self, 'get'):
            self.get()
        return


class MobileHandler(BaseHandler):

    ''' Handler for mobile web requests. '''
