# -*- coding: utf-8 -*-
"""

    ###################################### Asset configuration. ######################################

    ~~~  Description:  ~~~

    In this config file, you can specify registered assets for use in the AppTools Assets API.
    This all corresponds to the directory structure under app/assets. Place your static files in
    app/assets/< js | style | ext >/static, and then register them in the proper section below.

    If you register your scripts, stylesheets, and other stuff here, you can generate URLs to your
    static content directly in the template, handler, service, model or pipeline!


    ~~~ Generating Asset URLs ~~~

    In a template:
        {{ asset.script('jquery', 'core') }}   ## library first, package second (see below for definitions)

    In a handler/pipeline/service/model:
        self.get_script_url('jquery', 'core')  ## generated asset URLs honor output settings (e.g. CDN)


    ~~~ Package Config Structure ~~~

    '<type>': {

        ('<package name>', '<type/subdirectory/path>'): {

            'config': {
                'min': True | False,                    # whether it's possible to serve a minified version of this asset (converts filename to <name>.min.<type>. turn on minified assets in output config to activate)
                'version_mode': '<getvar | filename>',  # whether to add the package's version to the URL as a getvar or as part of the filename
                'bundle': '<your.bundle.js>'            # a name for your bundle, so you can combine assets and serve the optimized version if you want
            },

            'assets': {
                '<asset name>': {'min': True | False, 'version': '<version>'},  # override package `min` value, and specify the package version for cachebusting, when versioning is activated
            }

        }

"""
config = {}


# Installed Assets
config['apptools.project.assets'] = {

    'debug': False,    # Output log messages about what's going on.
    'verbose': False,  # Raise debug-level messages to 'info'.

    # JavaScript Libraries & Includes
    'js': {


        ### Core Dependencies ###
        ('core', 'core'): {

            'config': {
                'version_mode': 'getvar',
                'bundle': 'core.bundle.min.js'
            },

            'assets': {
                'backbone': {'min': True, 'version': '0.9.1'},    # Backbone.JS - site MVC core
                'amplify': {'min': True, 'version': '1.1.0'},     # AmplifyJS - for request, local storage + pubsub management
                'modernizr': {'min': False, 'version': '2.0.6'},  # Modernizr - browser polyfill + compatibility testing
                'lawnchair': {'min': False, 'version': '0.6.3'},  # Lawnchair: Client-side persistent storage
                'jquery': {'min': True, 'version': '1.7.1'},      # jQuery: Write Less, Do More!
                'underscore': {'min': True, 'version': '1.3.1'}   # Underscore: JavaScript's utility belt
            }

        },

        ### AppToolsJS ###
        ('apptools', 'apptools'): {

            'config': {
                'version_mode': 'getvar',
                'bundle': 'apptools.bundle.min.js'
            },

            'assets': {
                'base': {'min': True, 'version': 1.0},  # RPC, events, dev, storage, user, etc (see $.apptools)
                'admin': {'min': True, 'version': 1.0}  # RPC, events, dev, storage, user, etc (see $.apptools)
            }

        },

        ### jQuery Plugins ###
        ('jquery', 'core/jquery'): {

            'config': {
                'version_mode': 'getvar',
                'bundle': 'jquery.bundle.min.js'
            },

            'assets': {
                ## jquery core is included in "core" (see above)
                'easing': {'path': 'interaction/easing.min.js'},          # Easing transitions for smoother animations
                'mousewheel': {'path': 'interaction/mousewheel.min.js'},  # jQuery plugin for mousewheel events + interactions
                'scrollsuite': {'path': 'interaction/scroller.min.js'},   # ScrollTo, LocalScroll & SerialScroll
                'fancybox': {'path': 'interaction/fancybox2.min.js'}      # Clean + responsive CSS3 modals (note: needs a license for commercial apps)
            }

        },

    },


    # Cascading Style Sheets
    'style': {

        # Compiled (SASS) FCM Stylesheets
        ('compiled', 'compiled'): {

            'config': {
                'min': True,
                'version_mode': 'getvar'
            },

            'assets': {
                'main': {'version': 0.1},  # reset, main, layout, forms
                'ie': {'version': 0.1},    # fixes for internet explorer (grrr...)
                'print': {'version': 0.1}  # proper format for printing
            }

        },

        # Content-section specific stylesheets
        ('site', 'compiled/site'): {

            'config': {
                'min': True,
                'version_mode': 'getvar'
            },

            'assets': {
            }

        },

    },


    # Other Assets
    'ext': {
     },

}
