# Dev/Debug API
class CoreDevAPI extends CoreAPI

    @mount = 'dev'
    @events = []

    constructor: (apptools, window) ->

        # Setup internals
        @config = {}

        # Setup externals
        @environment = {}
        @performance = {}
        @debug =
            logging: true
            eventlog: true
            verbose: true
            serverside: false


        @setDebug = (@debug) =>
            # Set debug settings (usually triggered by the server)
            @_sendLog("[CoreDev] Debug has been set.", @debug)

        @_sendLog = (args...) =>
            console.log(args...)

        @log = (module, message, context...) =>
            # Log something to the console, even when verbose is off (but not when logging is off)
            if not context?
                context = '{no context}'
            if @debug.logging is true
                @_sendLog "["+module+"] INFO: "+message, context...
            return

        @warning = @warn = (module, message, context...) =>
            # Log a warning to the console, even when verbose is off (but not when logging is off)
            if not context?
                context = '{no context}'
            if @debug.logging is true
                @_sendLog "[" + module + "] WARNING: "+message, context...
            return

        @error = (module, message, context...) =>
            # Log an error to the console (always ignores verbose flag)
            if @debug.logging is true
                @_sendLog "["+module+"] ERROR: "+message, context...
            return

        @verbose = (module, message, context...) =>
            # Log something to the console, but only if verbose is on
            if @debug.verbose is true
                @_sendLog "["+module+"] DEBUG: "+message, context...
            return

        @exception = @critical = (module, message, exception=window.AppToolsException, context...) =>
            # Log an error and throw an exception
            @_sendLog "A critical error or unhandled exception occurred."
            @_sendLog "[" + module + "] CRITICAL: "+message, context...
            throw new exception(module, message, context)


@__apptools_preinit.abstract_base_classes.push CoreDevAPI
