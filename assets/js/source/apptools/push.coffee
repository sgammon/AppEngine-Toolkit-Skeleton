# Events API
class CorePushAPI extends CoreAPI

    constructor: (apptools) ->

        ## Register events
        apptools.events.register('PUSH_INIT')
        apptools.events.register('PUSH_READY')
        apptools.events.register('PUSH_STATE_CHANGE')
        apptools.events.register('PUSH_CHANNEL_OPEN')
        apptools.events.register('PUSH_SOCKET_ESTABLISH')
        apptools.events.register('PUSH_SOCKET_ACTIVITY')
        apptools.events.register('PUSH_SOCKET_ACTIVITY_FINISH')
        apptools.events.register('PUSH_SOCKET_ERROR')
        apptools.events.register('PUSH_CHANNEL_CLOSE')

        @state =
            ready: false
            status: null

            transport:
                socket: null
                channel: null

            callbacks:
                open: null
                expect: null
                activity: null
                error: null
                close: null

            config:
                token: null


        ## Migrate events to PUSH_STATE_CHANGE
        apptools.events.hook('PUSH_READY', (args...) -> $.apptools.events.trigger('PUSH_STATE_CHANGE', args...))
        apptools.events.hook('PUSH_SOCKET_ESTABLISH', (args...) -> $.apptools.events.trigger('PUSH_STATE_CHANGE', args...))
        apptools.events.hook('PUSH_SOCKET_ERROR', (args...) -> $.apptools.events.trigger('PUSH_STATE_CHANGE', args...))

        ## Special handlers for OPEN and CLOSE, to enable integration with the CoreRPC API
        apptools.events.hook('PUSH_CHANNEL_OPEN', (args...) ->
            $.apptools.events.trigger('PUSH_STATE_CHANGE', args...)
            $.apptools.api.rpc.alt_push_response = true
        )

        apptools.events.hook('PUSH_CHANNEL_CLOSE', (args...) ->
            $.apptools.events.trigger('PUSH_STATE_CHANGE', args...)
            $.apptools.api.rpc.alt_push_response = false
        )


        @events =

            on_open: () =>

                $.apptools.dev.verbose('PushSocket', 'Message transport opened.')
                @state.status = 'ready'
                apptools.events.trigger('PUSH_CHANNEL_OPEN', @state)


            on_message: (payload) =>

                $.apptools.dev.verbose('PushSocket', 'Message received.', payload)
                @state.status = 'receiving'
                apptools.events.trigger('PUSH_SOCKET_ACTIVITY', @state)
                @state.callbacks.activity?(payload)
                apptools.events.trigger('PUSH_SOCKET_ACTIVITY_FINISH', @state)

            on_error: (error) =>

                $.apptools.dev.error('PushSocket', 'Message transport error.', error)
                @state.status = 'error'
                apptools.events.trigger('PUSH_SOCKET_ERROR', @state)

            on_close: () =>

                $.apptools.dev.verbose('PushSocket', 'Message transport closed.')

                @state.status = 'close'
                @state.ready = false
                apptools.events.trigger('PUSH_CHANNEL_CLOSE', @state)


        @internal =

            open_channel: (token) =>

                apptools.events.trigger('PUSH_INIT', token)

                # copy over token
                @state.config.token = token

                # establish transport handles
                @state.transport.channel = new goog.appengine.Channel @state.config.token
                return @.internal


            open_socket: () =>

                # open socket
                @state.transport.socket = @state.transport.channel.open()

                apptools.events.trigger('PUSH_SOCKET_ESTABLISH', @state.transport.socket)

                # set event handlers
                @state.transport.socket.onopen = @events.on_open
                @state.transport.socket.onmessage = @events.on_message
                @state.transport.socket.onerror = @events.on_error
                @state.transport.socket.onclose = @events.on_close

                return @.internal

            listen: (callbacks) =>
                @state.callbacks = _.defaults(callbacks, @state.callbacks)
                @state.ready = true
                return @.internal

            expect: (id, request, xhr) =>
                @state?.callbacks?.expect?(id, request, xhr)
                return @.internal


        @establish = (token, callbacks) =>
            @state.status = 'init'
            @internal.open_channel(token).open_socket().listen(callbacks)
            return @
