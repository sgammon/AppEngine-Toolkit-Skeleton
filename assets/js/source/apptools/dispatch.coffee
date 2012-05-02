# Dispatch API
class CoreDispatchAPI extends CoreAPI

    @mount = 'dispatch'
    @events = []

    constructor: (apptools, window) ->

        ## Setup State
        @state =

            opened: false # Whether we have a push socket open
            receiving: false # Whether we've started receiving things
            error: false # Flag for API error state

            history: # Runtime RPC history
                errors: [] # RPC errors encountered
                received: [] # RPC's received

            pending: {} # Pending (Waiting) RPC's
            complete: {} # Complete (Fulfilled) RPC's


        ## Export Methods
        @init = () =>
            # Init dispatch API
            @state.opened = true
            apptools.dev.verbose('Dispatch', 'Dispatch startup signal received.')

        ## EXPECT Signal
        @expect = (id, request, xhr) =>
            # We've been notified that we should expect a push response to an RPC soon...
            @state.pending[id] = {request: request, callbacks: callbacks, xhr: xhr}
            apptools.dev.verbose('Dispatch', 'Received EXPECT signal.', id, request, callbacks, xhr)

        ## RECEIVE Signal
        @receive = (raw_response) =>
            # Try to decode JSON
            try
                response = JSON.parse(raw_response.data)
            catch e
                response = raw_response.data

            # Log this and add to runtime history
            apptools.dev.verbose('Dispatch', 'Parsed async message.', response)
            @state.history.received.push(raw_response)

            # did we succeed and finish?
            if response.status == 'ok'
                apptools.dev.verbose('Dispatch', 'Triggering deferred success callback.')

                # Move the request to the `complete` list, and add the response
                @state.complete[response.id] = @state.pending[response.id]
                @state.complete[response.id].response = response
                delete @state.pending[response.id]

                # Set the global last response, and add to detailed runtime history
                apptools.dev.log('RPC', 'Success', raw_response.data, response.status, @state.complete[response.id].xhr)
                apptools.api.rpc.lastResponse = raw_response.data
                apptools.api.rpc.history[response.id].xhr = @state.complete[response.id].xhr
                apptools.api.rpc.history[response.id].status = response.status
                apptools.api.rpc.history[response.id].response = raw_response.data

                # Set callback context
                context =
                    xhr: @state.complete[response.id].xhr
                    status: response.status
                    data: raw_response.data

                # Trigger success event and call success callback
                apptools.events.trigger('RPC_SUCCESS', context)
                @state.complete[response.id].callbacks.success?(response.response.content)

            # did we succeed but not finish yet?
            else if response.status == 'notify'

                # Log this and trigger `notify` callback
                apptools.dev.verbose('Dispatch', 'Received NOTIFY signal.')
                @state.pending[response.id].callbacks.notify?(response.response.content)

            # did we err?
            else
                # Log this and trigger `error` callback
                apptools.dev.error('Dispatch', 'Userland deferred task error. Calling error callback.', response)
                @state.pending[response.id].callbacks.error?(response.content)

        # ERROR Signal
        @error = (error) =>
            @state.error = true
            @history.errors.push(error)
            apptools.dev.error('Dispatch', 'Dispatch error state triggered.', error)

        # SHUTDOWN Signal
        @close = () =>
            @state.opened = false
            @state.receiving = false
            apptools.dev.verbose('Dispatch', 'Dispatch shutdown signal received.')


@__apptools_preinit.abstract_base_classes.push CoreDispatchAPI
