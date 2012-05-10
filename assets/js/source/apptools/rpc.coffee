# AppTools RPC - CoreRPCAPI, RPCAPI, RPCRequest

# Represents a server-side API, so requests can be sent from JavaScript
class RPCAPI extends CoreObject

    # RPCAPI Constructor
    constructor: (@name, @base_uri, @methods, @config) ->

        ## Build little shims for each method...
        if @methods.length > 0
            for method in @methods
                @[method] = @_buildRPCMethod(method, base_uri, config)


    # Build a remote method shim
    _buildRPCMethod: (method, base_uri, config) ->
        api = @name
        rpcMethod = (params={}, callbacks=null, async=false, push=false, opts={}, config={}) =>
            do (params, callbacks, async, push, opts) =>
                request = $.apptools.api.rpc.createRPCRequest({

                    method: method
                    api: api
                    params: params || {}
                    opts: opts || {}
                    async: async || false
                    push: push || false

                })

                if callbacks isnt null
                    return request.fulfill(callbacks, config)
                else
                    return request

        # Register API method capability
        $.apptools.api.registerAPIMethod(api, method, base_uri, config)
        return rpcMethod


# Represents a single RPC request, complete with config, params, callbacks, etc
class RPCRequest extends CoreObject

    # RPCRequest Constructor
    constructor: (id, opts, agent) ->

        ## Expose params
        @params = {}
        @action = null
        @method = null
        @api = null
        @base_uri = null

        ## RPC Envelope
        @envelope =
            id: null
            opts: {}
            agent: {}

        ## AJAX Settings
        @ajax =
            accepts: 'application/json'
            async: true
            cache: true
            global: true
            http_method: 'POST'
            crossDomain: false
            processData: false
            ifModified: false
            dataType: 'json'
            push: false
            contentType: 'application/json; charset=utf-8'

        if id?
            @envelope.id = id
        if opts?
            @envelope.opts = opts
        if agent?
            @envelope.agent = agent

    # Fulfill an RPC method server-side
    fulfill: (callbacks={}, config) ->

        ## Put in a default success callback if we're not passed one (useful for development/debug)...
        if not callbacks?.success?
            defaultSuccessCallback = (context, type, data) =>
                $.apptools.dev.log('RPC', 'RPC succeeded but had no success callback.', @, context, type, data)
            callbacks.success = defaultSuccessCallback

        ## Put in a default failure callback if we're not passed one (useful for development/debug)...
        if not callbacks?.failure?
            defaultFailureCallback = (context) =>
                $.apptools.dev.error('RPC', 'RPC failed but had no failure callback.', @, context)
            callbacks.failure = defaultFailureCallback

        ## Pass it off to CoreRPCAPI to fulfill
        return $.apptools.api.rpc.fulfillRPCRequest(config, @, callbacks)

    # Set async true/false for this request
    setAsync: (async) ->
        @ajax?.async ?= async
        return @

    # Set whether push headers should be applied
    setPush: (push) ->
        if push == true
            @ajax.push = true
            @envelope.opts['alt'] = 'socket'
            @envelope.opts['token'] = $.apptools.push.state.config.token

        return @

    # Set arbitrary RPC envelope options
    setOpts: (opts) ->
        @envelope?.opts = _.defaults(opts, @envelope?.opts)
        return @

    # Set the RPC envelope agent clause
    setAgent: (agent) ->
        @envelope?.agent ?= agent
        return @

    # Set the RPC action
    setAction: (@action) ->
        return @

    # Set the RPC method
    setMethod: (@method) ->
        return @

    # Set the RPC API
    setAPI: (@api) ->
        return @

    # Set the Base URI
    setBaseURI: (@base_uri) ->
        return @

    # Set the RPC params
    setParams: (@params={}) ->
        return @

    # Format the RPC for communication and return the encoded payload
    payload: ->
        _payload =
            id: @envelope.id
            opts: @envelope.opts
            agent: @envelope.agent
            request:
                params: @params
                method: @method
                api: @api

        return _payload


# Represents a single RPC response
class RPCResponse extends CoreObject

    constructor: (args...) ->
        $.apptools.dev.verbose('RPC', 'RPCResponse is not yet implemented and is currently stubbed.')
        return


## CoreRPCAPI - kicks off RPC's and mediates with dispatch
class CoreRPCAPI extends CoreAPI

    @mount = 'api'
    @events = [
                'RPC_CREATE',
                'RPC_FULFILL',
                'RPC_SUCCESS',
                'RPC_ERROR',
                'RPC_COMPLETE',
                'RPC_PROGRESS'
            ]

    # CoreRPCAPI Constructor
    constructor: (apptools, window) ->

        ## Init state and config
        @state =
            sockets:
                token: '__NULL__'
                enabled: false
                status: 'DISCONNECTED'
                default: null
                default_host: apptools.config?.rpc?.socket_host? || null

        ## Set default base URI
        @base_rpc_uri = apptools.config.rpc.base_uri || '/_api/rpc'
        @socket_host = apptools.config.rpc.socket_host || null

        ## Set up request internals
        if apptools.sys.libraries.resolve('jQuery') != false
            original_xhr = $.ajaxSettings.xhr

        else
            original_xhr = new XMLHTTPRequest()

        @internals =

            # RPC Transports
            transports:

                xhr:
                    factory: () =>
                        ## Create event listener
                        req = original_xhr()
                        if req
                            if typeof req.addEventListener == 'function'
                                req.addEventListener("progress", (ev) =>
                                        apptools.events.trigger('RPC_PROGRESS', {event: ev})
                                , false)
                        return req
                websocket:
                    factory: () =>
                        if apptools.agent.capabilities.websockets?
                            if @state.sockets?.enabled? == true
                                if @state.sockets?.default? == null && @state.sockets?.open?.length == 0

                                    ## Lazy-load first socket
                                    socket = new apptools.push.socket.establish()

                                    ## Register with state
                                    @state.sockets.enabled = true
                                    @state.sockets.default = socket
                                    @state.sockets.status = 'CONNECTED'
                                req = {}
                                return req
                        else
                            apptools.dev.error 'RPC', 'Socket factory can\'t produce a socket because the client platform does not support WebSockets.'
                            throw "SocketsNotSupported: The client platform does not have support for websockets."

            # Default HTTP headers
            config:
                headers:
                    "X-ServiceClient": ["AppToolsJS/", [
                                                AppTools.version.major.toString(),
                                                AppTools.version.minor.toString(),
                                                AppTools.version.micro.toString(),
                                                AppTools.version.build.toString()].join('.'),
                                         "-", AppTools.version.release.toString()].join('')

                    "X-ServiceTransport": "AppTools/JSONRPC"

        if apptools.sys.libraries.resolve('jQuery') != false
            # Splice in our custom factory
            $.ajaxSetup(

                global: true
                xhr: () =>
                    return @internals.transports.xhr.factory()
                headers: @internals.config.headers

            )

        # Build internal API
        @rpc =

            # Runtime RPC History
            lastRequest: null
            lastFailure: null
            lastResponse: null
            history: {}

            # Config
            action_prefix: null
            alt_push_response: false
            used_ids: []

            # Creates RPCAPIs
            factory: (name, base_uri, methods, config) =>
                apptools.api[name] = new RPCAPI(name, base_uri, methods, config)

            # Assembles an RPC endpoint URL
            _assembleRPCURL: (method, api, prefix, base_uri) =>
                if not api? and not base_uri?
                    throw "[RPC] Error: Must specify either an API or base URI to generate an RPC endpoint."
                else
                    if api? ## if we're working with an API, get the base URI
                        if base_uri?
                            base_uri = base_uri + '/' + api
                        else
                            base_uri = @base_rpc_uri+'/'+api
                    else
                        if not base_uri?
                            base_uri = @base_rpc_uri

                    if prefix isnt null
                        return [prefix+base_uri, method].join('.')
                    else
                        return [base_uri, method].join('.')

            # Provisions a locally-scoped RPC ID
            provisionRequestID: =>
                if @rpc.used_ids.length > 0
                    id = Math.max.apply(@, @rpc.used_ids)+1
                    @rpc.used_ids.push(id)
                    return id
                else
                    @rpc.used_ids.push(1)
                    return 1

            # Decode an RPC response
            decodeRPCResponse: (data, status, xhr, success, error) =>
                success(data, status)

            # Create an RPC request
            createRPCRequest: (config) =>

                request = new RPCRequest(@rpc.provisionRequestID())

                if config.api?
                    request.setAPI(config.api)

                if config.method?
                    request.setMethod(config.method)

                if config.agent?
                    request.setAgent(config.agent)

                if config.opts?
                    request.setOpts(config.opts)

                if config.base_uri?
                    request.setBaseURI(config.base_uri)

                if config.params?
                    request.setParams(config.params)

                if config.async?
                    request.setAsync(config.async)

                if config.push?
                    request.setPush(config.push)
                else
                    request.setPush(@rpc.alt_push_response)

                apptools.dev.verbose('RPC', 'New Request', request, config)
                request.setAction(@rpc._assembleRPCURL(request.method, request.api, @rpc.action_prefix, @base_rpc_uri))

                return request

            # Fulfill a request server-side
            fulfillRPCRequest: (config, request, callbacks, transport='xhr') =>

                apptools.dev.verbose('RPC', 'Fulfill', config, request, callbacks)

                @rpc.lastRequest = request

                @rpc.history[request.envelope.id] =
                    request: request
                    config: config
                    callbacks: callbacks

                if request.action is null
                    if request.method is null
                        throw "[RPC] Error: Request must specify at least an action or method."
                    if request.base_uri is null
                        if request.api is null
                            throw "[RPC] Error: Request must have an API or explicity defined BASE_URI."
                        else
                            request.action = @rpc._assembleRPCURL(request.method, request.api, @rpc.action_prefix)
                    else
                        request.action = @rpc._assembleRPCURL(request.method, null, @rpc.action_prefix, request.base_uri)

                if request.action is null or request.action is undefined
                    throw '[RPC] Error: Could not determine RPC action.'

                context =
                    config: config
                    request: request
                    callbacks: callbacks
                apptools.events.trigger('RPC_FULFILL', context)

                do (apptools, request, callbacks) ->

                    xhr_settings =
                        resourceId: request.api+'.'+request.method
                        url: request.action
                        data: JSON.stringify request.payload()
                        async: request.ajax.async
                        global: request.ajax.global
                        type: request.ajax.http_method or 'POST'
                        accepts: request.ajax.accepts or 'application/json'
                        crossDomain: request.ajax.crossDomain
                        dataType: request.ajax.dataType
                        processData: false
                        ifModified: request.ajax.ifModified
                        contentType: request.ajax.contentType

                        beforeSend: (xhr, settings) =>

                            apptools.api.rpc.history[request.envelope.id].xhr = xhr;
                            callbacks?.status?('beforeSend')
                            return xhr

                        error: (xhr, status, error) =>
                            callbacks?.status?('error')
                            apptools.dev.error('RPC', 'Error: ', {error: error, status: status, xhr: xhr})
                            apptools.api.rpc.lastFailure = error
                            apptools.api.rpc.history[request.envelope.id].xhr = xhr
                            apptools.api.rpc.history[request.envelope.id].status = status
                            apptools.api.rpc.history[request.envelope.id].failure = error

                            context =
                                xhr: xhr
                                status: status
                                error: error

                            apptools.events.trigger('RPC_ERROR', context)
                            apptools.events.trigger('RPC_COMPLETE', context)
                            callbacks?.failure?(error)

                        success: (data, status, xhr) =>

                            if data.status == 'ok'
                                callbacks?.status?('success')
                                apptools.dev.log('RPC', 'Success', data, status, xhr)
                                apptools.api.rpc.lastResponse = data
                                apptools.api.rpc.history[request.envelope.id].xhr = xhr
                                apptools.api.rpc.history[request.envelope.id].status = status
                                apptools.api.rpc.history[request.envelope.id].response = data

                                context =
                                    xhr: xhr
                                    status: status
                                    data: data
                                apptools.events.trigger('RPC_SUCCESS', context)
                                apptools.events.trigger('RPC_COMPLETE', context)

                                callbacks?.success?(data.response.content, data.response.type, data)

                            else if data.status == 'wait'
                                callbacks?.status?('wait')
                                apptools.dev.log('RPC', 'PushWait', data, status, xhr)
                                context =
                                    xhr: xhr
                                    status: status
                                    data: data

                                callbacks?.wait?(data, status, xhr)
                                apptools.push.internal.expect(request.envelope.id, request, xhr)

                            else if data.status == 'fail'
                                callbacks?.status?('error')
                                apptools.dev.error('RPC', 'Error: ', {error: data, status: status, xhr: xhr})
                                apptools.api.rpc.lastFailure = data
                                apptools.api.rpc.history[request.envelope.id].xhr = xhr
                                apptools.api.rpc.history[request.envelope.id].status = status
                                apptools.api.rpc.history[request.envelope.id].failure = data

                                context =
                                    xhr: xhr
                                    status: status
                                    error: data

                                apptools.events.trigger('RPC_ERROR', context)
                                apptools.events.trigger('RPC_COMPLETE', context)
                                callbacks?.failure?(data)

                            else
                                callbacks?.success?(data.response.content, data.response.type, data)


                        statusCode:

                            404: =>
                                apptools.dev.error('RPC', 'HTTP/404', 'Could not resolve RPC action URI.')
                                apptools.events.trigger('RPC_ERROR', message: 'RPC 404: Could not resolve RPC action URI.', code: 404)

                            403: ->
                                apptools.dev.error('RPC', 'HTTP/403', 'Not authorized to access the specified endpoint.')
                                apptools.events.trigger('RPC_ERROR', message: 'RPC 403: Not authorized to access the specified endpoint.', code: 403)

                            500: ->
                                apptools.dev.error('RPC', 'HTTP/500', 'Internal server error.')
                                apptools.events.trigger('RPC_ERROR', message: 'RPC 500: Woops! Something went wrong. Please try again.', code: 500)


                    driver = apptools.sys.drivers.resolve('transport')

                    if driver.name == 'amplify'
                        apptools.dev.verbose('RPC', 'Fulfilling with AmplifyJS transport adapter.')
                        xhr_action = driver.driver.request
                        xhr = xhr_action(xhr_settings)

                    else if driver.name == 'jquery'
                        apptools.dev.verbose('RPC', 'Fulfilling with jQuery AJAX transport adapter.', xhr_settings)
                        xhr = jQuery.ajax(xhr_settings.url, xhr_settings)

                    else
                        apptools.dev.error 'RPC', 'Native RPC adapter is currently stubbed.'
                        throw "[RPC]: No valid AJAX transport adapter found."

                    apptools.dev.verbose('RPC', 'Resulting XHR: ', xhr)

                return {id: request.envelope.id, request: request}

        @ext = null

        @registerAPIMethod = (api, name, base_uri, config) =>
            if apptools?.sys?.drivers
                amplify = apptools.sys.drivers.resolve('transport', 'amplify')
                if amplify isnt false
                    apptools.dev.log('RPCAPI', 'Registering request procedure "'+api+'.'+name+'" with AmplifyJS.')

                    resourceId = api+'.'+name
                    base_settings =
                        accepts: 'application/json'
                        type: 'POST'
                        dataType: 'json'
                        contentType: 'application/json'
                        url: @rpc._assembleRPCURL(name, api, null, base_uri)
                        decoder: @rpc.decodeRPCResponse

                    if config.caching?
                        if config.caching == true
                            base_settings.caching = 'persist'
                        amplify.request.define(resourceId, "ajax", base_settings)
                    else
                        amplify.request.define(resourceId, "ajax", base_settings)


class RPCDriver extends CoreInterface

    @methods = []
    @export = "private"

    constructor: () ->
        return


# Export classes
@__apptools_preinit.abstract_base_classes.push RPCAPI
@__apptools_preinit.abstract_base_classes.push RPCDriver
@__apptools_preinit.abstract_base_classes.push CoreRPCAPI
@__apptools_preinit.abstract_base_classes.push RPCRequest
@__apptools_preinit.abstract_base_classes.push RPCResponse
@__apptools_preinit.abstract_feature_interfaces.push {adapter: RPCDriver, name: "transport"}
