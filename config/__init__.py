# -*- coding: utf-8 -*-

'''

App Config

This directory holds all of your apps' configuration info. AppTools can stitch together multiple config
files, as long as they export a `config` dictionary (add config files below in `apptools.system.include`...).

AppTools ships with a few other config files in this folder.

-sam (<sam@momentum.io>)

'''

import os
import sys
import logging
import bootstrap

if 'lib' not in sys.path or 'lib/distlib' not in sys.path:
    bootstrap.AppBootstrapper.prepareImports()

_config = {}
_compiled_config = None

## Check if we're running the app server
debug = os.environ.get('SERVER_SOFTWARE', '').startswith('Dev')


"""

    ######################################## Webapp2 configuration. ########################################

    Config settings for Webapp2, which AppTools uses for WSGI internals (http://webapp-improved.appspot.com).

"""

_config['webapp2'] = {

    'apps_installed': [
        'project'  # Installed projects
    ],

}

_config['webapp2_extras.sessions'] = {

    'secret_key': 'ASDLKJOVIBBVC*@()#HD)(VH$(*GC@(E*C(CBDCS))))',
    'default_backend': 'securecookie',
    'cookie_name':     'appsession',
    'session_max_age': None,
    'cookie_args': {
        'max_age':     86400,
        #'domain':      '*',
        'path':        '/',
        'secure':      False,
        'httponly':    False,
    }

}

_config['webapp2_extras.jinja2'] = {

    'template_path': 'templates/source',  # Root directory for template storage
    'compiled_path': 'templates.compiled',  # Compiled templates directory
    'force_compiled': False,  # Force Jinja to use compiled templates, even on the Dev server

    'environment_args': {  # Jinja constructor arguments
        'optimized': True,   # enable jinja2's builtin optimizer (recommended)
        'autoescape': True,  # Global Autoescape. BE CAREFUL WITH THIS.
        'extensions': ['jinja2.ext.autoescape', 'jinja2.ext.with_', 'jinja2.ext.i18n'],
    }

}


"""

    ######################################## Core configuration. ########################################

    Core system configuration, including settings for the WSGI app, config files, and installed Platforms.

"""

## System Config
_config['apptools.system'] = {

    'debug': False,  # System-level debug messages

    'hooks': {  # System-level Developer's Hooks
        'appstats': {'enabled': False},  # AppStats RPC optimization + analysis tool
        'apptrace': {'enabled': False},  # AppTrace memory usage optimization + analysis tool
        'profiler': {'enabled': False}   # Python profiler for CPU cycle/efficiency optimization + analysis
    },

    'include': [  # Extended configuration files to include
        ('fatcatmap', 'config.project'),  # Project config
        ('services', 'config.services'),  # Global + site services (RPC/API) config
        ('assets', 'config.assets')       # Asset manangement layer config
    ]

}

## Platform Config
_config['apptools.system.platform'] = {

    'installed_platforms': [

        {'name': 'Generic WSGI', 'path': 'apptools.platform.generic.GenericWSGI'},
        {'name': 'Google App Engine', 'path': 'apptools.platform.appengine.GoogleAppEngine'}

    ]

}



"""
###    === Don't modify below this line... ===
"""


def systemLog(message, _type='debug'):

    ''' Logging shortcut. '''

    global debug
    global _config
    if _config['apptools.system']['debug'] is True or _type in ('error', 'critical'):
        prefix = '[CORE_SYSTEM]: '
        if _type == 'debug' or debug is True:
            logging.debug(prefix + message)
        elif _type == 'info':
            logging.info(prefix + message)
        elif _type == 'error':
            logging.error(prefix + message)
        elif _type == 'critical':
            logging.critical(prefix + message)


def readConfig(config=_config):

    ''' Parses extra config files and combines into one global config. '''

    global _compiled_config
    from webapp2 import import_string
    if _compiled_config is not None:
        return _compiled_config
    else:
        if config['apptools.system'].get('include', False) is not False and len(config['apptools.system']['include']) > 0:
            systemLog('Considering system config includes...')
            for name, configpath in config['apptools.system']['include']:
                systemLog('Checking include "' + str(name) + '" at path "' + str(configpath) + '".')
                try:
                    for key, cfg in import_string('.'.join(configpath.split('.') + ['config'])).items():
                        config[key] = cfg
                except Exception, e:
                    systemLog('Encountered exception of type "' + str(e.__class__) + '" when trying to parse config include "' + str(name) + '" at path "' + str(configpath))
                    if debug:
                        raise
                    else:
                        continue
        if len(config) > 0 and _compiled_config is None:
            _compiled_config = config

        return config

## Export compiled app config
config = readConfig(_config)
