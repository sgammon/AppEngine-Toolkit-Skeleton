# AppTools Init
class AppTools

    @version =
        major: 0
        minor: 1
        micro: 4
        build: 4282012 # m/d/y
        release: "BETA"
        get: () -> [[[@major.toString(), @minor.toString(), @micro.toString()].join('.'), @build.toString()].join('-'), @release].join(' ')

    constructor: (window)  ->

        ##### ===== 1: Core Setup ===== #####

        ## System config
        @config =
            rpc:
                base_uri: '/_api/rpc'
                host: null
                enabled: true

            sockets:
                host: null
                enabled: false

        ## Library shortcuts
        @lib = {}

        ## System API
        @sys =

            platform: {}       # Platform info
            version: @version  # Version info

            ## Core events to be registered immediately
            core_events: ['SYS_MODULE_LOADED', 'SYS_LIB_LOADED', 'SYS_DRIVER_LOADED']

            ## System state
            state:
                status: 'NOT_READY' # System status
                flags: ['base']     # System flags
                modules: {}         # Installed system modules
                classes: {}         # Installed AppTools-related classes
                interfaces: {}      # Installed feature interfaces
                integrations: []    # Installed library integrations

                add_flag: (flagname) ->
                    @sys.flags.push flagname

                consider_preinit: (preinit) =>

                    ## Preinit: Consider classes
                    if preinit.abstract_base_classes?
                        for cls in preinit.abstract_base_classes
                            @sys.state.classes[cls.name] = cls
                            if cls.package? and @sys.state.modules[cls.package]?
                                @sys.state.modules[cls.package].classes[cls.name] = cls
                            if cls.export? and cls.export == 'private'
                                continue
                            else
                                window[cls.name] = cls

                    ## Preinit: consider library integrations
                    if preinit.deferred_library_integrations?
                        for lib in preinit.deferred_library_integrations
                            @sys.libraries.install(lib.name, lib.library)

                    ## Preinit: consider feature interfaces
                    if preinit.abstract_feature_interfaces?
                        for interface in preinit.abstract_feature_interfaces
                            @sys.interfaces.install(interface.name, interface.adapter)

                    return preinit

            ## Module management
            modules:
                install: (module, mountpoint_or_callback=null, callback=null) =>

                    ## Figure out whether our second arg is a mountpoint or a callback
                    if mountpoint_or_callback?
                        if typeof mountpoint_or_callback == 'function'
                            callback = mountpoint_or_callback
                            mountpoint = null
                        else
                            mountpoint = mountpoint_or_callback

                    ## Resolve module mount point
                    if mountpoint?
                        if not @[mountpoint]?
                            @[mountpoint] = {}
                        mountpoint = @[mountpoint]
                        pass_parent = true
                    else
                        mountpoint = @
                        pass_parent = false

                    ## Resolve module name
                    if module.mount?
                        module_name = module.mount
                    else
                        module_name = module.name.toLowerCase()

                    ## Register any module events
                    if module.events? and @events?
                        @events.register(module.events)

                    ## Mount module
                    if not mountpoint[module_name]?
                        if pass_parent
                            target_mod = mountpoint[module_name] = new module(@, mountpoint, window)
                            @sys.state.modules[module_name] = {module: target_mod, classes: {}}
                        else
                            target_mod = mountpoint[module_name] = new module(@, window)
                            @sys.state.modules[module_name] = {module: target_mod, classes: {}}

                    ## Call module init callback, if there is one
                    if module._init?
                        module._init(@)

                    ## If dev is available, log this
                    if @dev? and @dev.verbose?
                        @dev.verbose 'ModuleLoader', 'Installed module:', target_mod, ' at mountpoint: ', mountpoint, ' under the name: ', module_name

                    ## If events are available, trigger SYS_MODULE_LOADED
                    if @events?
                        @events.trigger('SYS_MODULE_LOADED', module: target_mod, mountpoint: mountpoint)

                    ## Call our install callback, if we have one
                    if callback?
                        callback(target_mod)

                    return target_mod ## done!

            ## Library management
            libraries:
                install: (name, library, callback=null) =>

                    ## Install library shortcut
                    @lib[name.toLowerCase()] = library
                    @sys.state.integrations.push name.toLowerCase()

                    ## Log + trigger event
                    @dev.verbose('LibLoader', name + ' detected.')
                    @events.trigger('SYS_LIB_LOADED', name: name, library: library)

                    ## Trigger install callback
                    if callback?
                        callback(library, name)

                    return @lib[name.toLowerCase()] ## done!

                resolve: (name) =>

                    name = name.toLowerCase()
                    ## Check to see if it's in the runtime integrations list
                    for lib in @sys.state.integrations
                        if lib != name
                            continue
                        else
                            return @lib[name.toLowerCase()]

            ## Interface management
            interfaces:
                install: (name, adapter) =>

                    ## Log + trigger event
                    @dev.verbose('InterfaceLoader', 'Installed "' + name + '" interface.')
                    @events.trigger('SYS_INTERFACE_LOADED', name: name, adapter: adapter)

                    ## Install into state
                    @sys.state.interfaces[name] = {adapter: adapter, methods: adapter.methods}
                    return @sys.state.interfaces[name]

                resolve: (name) =>

                    ## Look for it
                    if @sys.state.interfaces[name]?
                        return @sys.state.interfaces[name]
                    else
                        return false


            ## Driver management
            drivers:
                query: {}     ## drivers that can query the dom
                loader: {}    ## drivers that can load files/modules
                transport: {} ## drivers that can fulfill RPCs
                storage: {}   ## drivers that can store data
                render: {}    ## drivers that can render data into the DOM

                ## Register a driver with AppToolsJS
                install: (type, name, adapter, mountpoint, enabled, priority, callback=null) =>

                    # Add the driver to its type namespace
                    @sys.drivers[type][name] = {name: name, driver: mountpoint, enabled: enabled, priority: priority, interface: adapter}

                    # Trigger install callback + loaded event
                    if callback?
                        callback(@sys.drivers[type][name].driver)
                    @events.trigger('SYS_DRIVER_LOADED', @sys.drivers[type][name])

                    return @sys.drivers[type][name] ## done!

                ## Resolve a driver by type, or type + name
                resolve: (type, name=null, strict=false) =>

                    if not @sys.drivers[type]?
                        apptools.dev.critical 'CORE', 'Unkown driver type "' + type + '".'
                        return
                    else
                        if name?
                            if @sys.drivers[type][name]?
                                return @sys.drivers[type][name].driver
                            else
                                if strict
                                    apptools.dev.critical 'CORE', 'Could not resolve driver ', name, ' of type ', type, '.'
                            return false

                    priority_state = -1
                    selected_driver = false
                    for driver of @sys.drivers[type]

                        driver = @sys.drivers[type][driver]
                        if driver.priority > priority_state
                            selected_driver = driver
                            break
                    return selected_driver

            ## All systems go!
            go: () =>
                @dev.log('Core', 'All systems go.')
                @sys.state.status = 'READY'
                return @

        ## Dev/Events API (for logging/debugging - only two modules instantiated manually, so we can log stuff + trigger events during init)
        @sys.modules.install(CoreDevAPI, (dev) -> dev.verbose('CORE', 'CoreDevAPI is up and running.'))
        @sys.modules.install(CoreEventsAPI, (events) => events.register(@sys.core_events))

        ## Consider preinit: export/catalog preinit classes & libraries
        if window.__apptools_preinit?
            @sys.state.consider_preinit(window.__apptools_preinit)


        ##### ===== 2: Library Detection ===== #####
        # Modernizr
        if window?.Modernizr?
            @sys.libraries.install 'Modernizr', window.Modernizr, (lib, name) =>
                @load = (fragments...) =>
                    return @lib.modernizr.load fragments...

        # jQuery
        if window?.jQuery?
            @sys.libraries.install 'jQuery', window.jQuery, (lib, name) =>
                @sys.drivers.install 'query', 'jquery', @sys.state.classes.QueryDriver, @lib.jquery, true, 100, null
                @sys.drivers.install 'transport', 'jquery', @sys.state.classes.RPCDriver, @lib.jquery, true, 100, null

        # Zepto
        if window?.Zepto?
            @sys.libraries.install 'Zepto', window.Zepto, (lib, name) =>
                @sys.drivers.install 'query', 'zepto', @sys.state.classes.QueryDriver, @lib.zepto, true, 500, null
                @sys.drivers.install 'transport', 'zepto', @sys.state.classes.RPCDriver, @lib.zepto, true, 500, null

        # UnderscoreJS
        if window?._?
            @sys.libraries.install 'Underscore', window._, (lib, name) =>
                @sys.drivers.install 'query', 'underscore', @sys.state.classes.QueryDriver, @lib.underscore, true, 50, null
                @sys.drivers.install 'render', 'underscore', @sys.state.classes.RenderDriver, @lib.underscore, true, 50, null

        # BackboneJS
        if window?.Backbone?
            @sys.libraries.install 'Backbone', window.Backbone, (library) =>
                window.AppToolsView::apptools = @
                window.AppToolsModel::apptools = @
                window.AppToolsRouter::apptools = @
                window.AppToolsCollection::apptools = @

        # Lawnchair
        if window?.Lawnchair?
            @sys.libraries.install 'Lawnchair', window.Lawnchair, (library) =>
                @sys.drivers.install 'storage', 'lawnchair', @sys.state.classes.StorageDriver, @lib.lawnchair, true, 500, (lawnchair) =>
                    @dev.verbose 'Lawnchair', 'Storage is currently stubbed. Come back later.'

        # AmplifyJS
        if window?.amplify?
            @sys.libraries.install 'Amplify', window.amplify, (library) =>
                @sys.drivers.register 'transport', 'amplify', @sys.state.classes.RPCDriver, @lib.amplify, true, 500, null
                @sys.drivers.register 'storage', 'amplify', @sys.state.classes.StorageDriver, @lib.amplify, true, 100, null

        # Milk (mustache for coffeescript)
        if window?.Milk?
            @sys.libraries.install 'Milk', window.Milk, (library) =>
                @sys.drivers.install 'render', 'milk', @sys.state.classes.RenderDriver, @lib.milk, true, 100, (milk) =>
                    @dev.verbose 'Milk', 'Render support is currently stubbed. Come back later.'

        # Mustache
        if window?.Mustache?
            @sys.libraries.install 'Mustache', window.Mustache, (library) =>
                @sys.drivers.register 'render', 'mustache', @sys.state.classes.RenderDriver, @lib.mustache, true, 500, (mustache) =>
                    @dev.verbose 'Mustache', 'Render support is currently stubbed. Come back later.'


        ##### ===== 3: Install Core Modules ===== #####
        @sys.modules.install(CoreModelAPI)     # Model API
        @sys.modules.install(CoreAgentAPI)     # Agent API
        @sys.modules.install(CoreDispatchAPI)  # Dispatch API
        @sys.modules.install(CoreRPCAPI)       # RPC API
        @sys.modules.install(CorePushAPI)      # Push API
        @sys.modules.install(CoreUserAPI)      # User API
        @sys.modules.install(CoreStorageAPI)   # Storage API
        @sys.modules.install(CoreRenderAPI)    # Render API


        ##### ===== 4: Install Deferred Modules ===== #####
        if window.__apptools_preinit?.deferred_core_modules?
            for module in window.__apptools_preinit.deferred_core_modules
                if module.package?
                    @sys.modules.install(module.module, module.package)
                else
                    @sys.modules.install(module.module)

        ## 5: We're done!
        return @.sys.go()

# Export to window
window.AppTools = AppTools
window.apptools = new AppTools(window)

# Is jQuery around?
if window.jQuery?
    # Attach jQuery shortcut
    $.extend(apptools: window.apptools)

# No? I'll just let myself in.
else
    # Attach jQuery shim
    window.$ = (id) -> document.getElementById(id)
    window.$.apptools = window.apptools
