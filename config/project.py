# -*- coding: utf-8 -*-

"""

    ######################################## AppTools Project configuration. ########################################

    Main project configuration stuff, designed to be changed according to the app's desired environment and status.

"""

config = {}


## App settings
config['apptools.project'] = {

    'name': 'AppTools',        # Change this to your app's name

    'version': {               # Change this according to your app's version
        'major': 1,
        'minor': 0,
        'micro': 0,
        'build': 20120321,
        'release': 'BETA'
    }

}

## Development/debug settings
config['apptools.project.dev'] = {
  # Not yet in use
}

## Output layer settings
config['apptools.project.output'] = {

    # Output Configuration

    'minify': False,      # whether to minify page output or not
    'optimize': True,     # whether to use the async script loader or not
    'standalone': False,  # whether to render only the current template, or the whole context (ignores "extends")

    'analytics': {  # Analytics Settings
        'enable': True,              # whether to insert analytics code
        'account_id': 'UA-XXXXX-X'   # your google anlytics site ID
    },

    'appcache': {  # HTML5 appcaching
        'enable': False,                       # whether to enable
        'manifest': 'scaffolding-v1.appcache'  # manifest to link to
    },

    'assets': {  # Asset API
        'minified': False,        # whether to switch to minified assets or not
        'serving_mode': 'local',  # 'local' or 'cdn' (CDN prefixes all assets with an absolute URL)
        'cdn_prefix': []          # CDN prefix/prefixes - a string is used globally, a list of hostnames is selected from randomly for each asset
    },

    'headers': {  # Default Headers (only supported headers are shown)
        'Cache-Control': 'no-cache',  # default to not caching dynamic content
        'X-UA-Compatible': 'IE=edge,chrome=1'  # http://code.google.com/chrome/chromeframe/
    }

}

## Caching
config['apptools.project.cache'] = {

    # Caching Configuration

    'key_seperator': '::',
    'prefix': 'dev',
    'prefix_mode': 'explicit',
    'prefix_namespace': False,
    'namespace_seperator': '::',

    'adapters': {

        # Instance Memory
        'fastcache': {
            'default_ttl': 600
        },

        # Memcache API
        'memcache': {
            'default_ttl': 10800
        },

        # Backend Instance Memory
        'backend': {
            'default_ttl': 10800
        },

        # Datastore Caching
        'datastore': {
            'default_ttl': 86400
        }

    }

}

config['apptools.project.output.template_loader'] = {

    # Template Loader Config

    'force': True,              # Force enable template loader even on Dev server
    'debug': False,             # Enable dev logging
    'use_memory_cache': False,  # Use handler in-memory cache for template source
    'use_memcache': False,      # Use Memcache API for template source

}

# Pipelines Configuration
config['apptools.project.pipelines'] = {

    'debug': False,  # Enable basic serverlogs
    'logging': {

        'enable': False,       # Enable the pipeline logging subsystem
        'mode': 'serverlogs',  # 'serverlogs', 'xmpp' or 'channel'
        'channel': '',         # Default channel to send to (admin channels are their email addresses, this can be overridden on a per-pipeline basis in the dev console)
        'jid': '',             # Default XMPP JID to send to (this can be overridden on a per-pipeline basis in the dev console)

    }

}
