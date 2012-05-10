# -*- coding: utf-8 -*-
from project.handlers import WebHandler


class Landing(WebHandler):

    ''' Returns the age-old, enigmatic success response. '''

    def get(self):

        ''' Render the template at "app/templates/main/helloworld.html". '''

        self.render('main/helloworld.html')
        return
