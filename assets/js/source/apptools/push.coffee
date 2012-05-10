# Events API
class CorePushAPI extends CoreAPI

    @mount = 'push'
    @events = [
                'PUSH_INIT',
                'PUSH_READY',
                'PUSH_STATE_CHANGE',
                'PUSH_SOCKET_OPEN',
                'PUSH_SOCKET_ESTABLISH',
                'PUSH_SOCKET_ACTIVITY',
                'PUSH_SOCKET_ACTIVITY_FINISH',
                'PUSH_SOCKET_ERROR',
                'PUSH_SOCKET_CLOSE'
            ]

    constructor: (apptools, window) ->

        ## Setup PushAPI state
        @state =
            ready: false
            status: 'init'

            transport:
                sockets: []
                channel: null

            callbacks:
                open: null
                expect: null
                activity: null
                error: null
                close: null

            config:
                token: null


        ## Bridge events to PUSH_STATE_CHANGE
        apptools.events.bridge ['PUSH_READY', 'PUSH_SOCKET_ESTABLISH', 'PUSH_SOCKET_ERROR', 'PUSH_SOCKET_OPEN', 'PUSH_SOCKET_CLOSE'], 'PUSH_STATE_CHANGE'

        ## Special handlers for OPEN and CLOSE, to enable integration with the CoreRPC API
        apptools.events.hook 'PUSH_SOCKET_OPEN', (args...) =>
            apptools.api.rpc.alt_push_response = true

        apptools.events.hook 'PUSH_SOCKET_CLOSE', (args...) =>
            apptools.api.rpc.alt_push_response = false


        ## Push events
        @events =

            ## On socket/channel open
            on_open: (socket) =>

                # Set state, trigger CHANNEL_OPEN, log this
                if @state.transport.sockets.length = 0
                    @state.status = 'ready'

                apptools.events.trigger 'PUSH_SOCKET_OPEN', @state
                apptools.dev.verbose 'PushSocket', 'Message transport opened.'


            ## On socket/channel message
            on_message: (socket, payload) =>

                # Set state, log this
                @state.status = 'receiving'
                apptools.dev.verbose 'PushSocket', 'Message received.', payload

                # Trigger ACTIVITY, then callback, then ACTIVITY_FINISH
                apptools.events.trigger 'PUSH_SOCKET_ACTIVITY', @state
                @state.callbacks.activity?(payload)
                apptools.events.trigger 'PUSH_SOCKET_ACTIVITY_FINISH', @state

            ## On socket/channel error
            on_error: (socket, error) =>

                # Set state, log this, trigger SOCKET_ERROR
                @state.status = 'error'
                apptools.dev.error 'PushSocket', 'Message transport error.', error
                apptools.events.trigger 'PUSH_SOCKET_ERROR', @state

            ## On socket/channel close
            on_close: (socket) =>

                # Set state, log this, trigger CHANNEL_CLOSE
                @state.ready = false
                @state.status = 'close'
                apptools.dev.verbose 'PushSocket', 'Message transport closed.'
                apptools.events.trigger 'PUSH_SOCKET_CLOSE', @state


        ## Push internals
        @internal =

            ## Open a GAE channel connection
            open_channel: (token) =>

                # Trigger push_init
                apptools.events.trigger 'PUSH_INIT', token: token, type: 'channel'

                # copy over token
                @state.config.token = token

                # establish transport handles
                @state.transport.channel = new goog.appengine.Channel @state.config.token
                return @internal._add_socket @state.transport.channel

            ## Open an HTML5 WebSocket
            open_websocket: (token, server) =>

                # Trigger push_init
                apptools.events.trigger 'PUSH_INIT', token: token, server: server, type: 'websocket'

                apptools.dev.log 'Push', "WARNING: WebSockets support is currently experimental."
                return @internal._add_socket @state.transport.socket

            ## Open a socket, optionally through a GAE channel
            _add_socket: (transport, callbacks) =>

                # Open socket
                socket = transport.open()
                @state.transport.sockets.push socket
                apptools.events.trigger 'PUSH_SOCKET_ESTABLISH', socket

                # Set event handlers OR global event handlers
                socket.onopen = (args...) => @events.on_open(socket, args...)
                socket.onmessage = (args...) => @events.on_message(socket, args...)
                socket.onerror = (args...) => @events.on_error(socket, args...)
                socket.onclose = (args...) => @events.on_close(socket, args...)

                return @internal

            ## Expect a push response
            expect: (id, request, xhr) =>

                # Pass off to expect callback
                @state?.callbacks?.expect?(id, request, xhr)
                return @internal

        ## GAE Channel Stuff
        @channel =
            establish: (token) =>
                return @internal.open_channel token

        ## Websocket Stuff
        @socket =
            establish: (token, host=null) =>
                return @internal.open_websocket(token, host || apptools.config.sockets.host)

        ## Enable the API
        @listen = (callbacks) =>

            # Set global callbacks and set state
            @state.callbacks = _.defaults callbacks, @state.callbacks
            @state.ready = true
            return @.internal


class PushDriver extends CoreInterface

    @methods = []
    @export = "private"

    constructor: () ->
        return


@__apptools_preinit.abstract_base_classes.push PushDriver
@__apptools_preinit.abstract_base_classes.push CorePushAPI
@__apptools_preinit.abstract_feature_interfaces.push {adapter: PushDriver, name: "transport"}
