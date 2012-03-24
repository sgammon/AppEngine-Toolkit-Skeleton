# -*- coding: utf-8 -*-

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
