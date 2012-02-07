# Dev/Debug API
class CoreDevAPI extends CoreAPI

    constructor: (apptools) ->

        @config = {}
        @environment = {}

        @performance = {}
        @debug =
            logging: true
            eventlog: true
            verbose: true


    setDebug: (@debug) =>
        console.log("[CoreDev] Debug has been set.", @debug)

    log: (module, message, context...) =>
        if not context?
            context = '{no context}'
        if @debug.logging is true
            console.log "["+module+"] INFO: "+message, context...
        return

    eventlog: (sublabel, context...) =>
        if not context?
            context = '{no context}'
        if @debug.eventlog is true
            console.log "[EventLog] "+sublabel, context...
        return

    error: (module, message, context...) =>
        if @debug.logging is true
            console.log "["+module+"] ERROR: "+message, context...
        return

    verbose: (module, message, context...) =>
        if @debug.verbose is true
            @log(module, message, context...)
        return