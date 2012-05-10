# -*- coding: utf-8 -*-

'''

App URLs

Gathers all URLs for installed userland + apptools apps.

'''

import webapp2

from config import config
from apptools import dispatch
from webapp2 import import_string


def get_rules():

    ''' Get installed apps, get each one's rules. Also include URL mappings for builtin AppTools apps. '''

    rules = []

    for app_module in config.get('webapp2')['apps_installed'] + dispatch.get_builtin_apps():
        if not isinstance(app_module, webapp2.WSGIApplication):
            try:
                # Load the urls module from the app and extend our rules.
                app_rules = import_string('%s.routing' % app_module)
                rules.extend(app_rules.get_rules())
            except ImportError:
                continue
        else:
            try:
                # Load the urls from the app itself.
                app_rules = app_module.router.match_routes
                rules.extend(app_rules)
            except (AttributeError, TypeError):
                continue

    return rules
