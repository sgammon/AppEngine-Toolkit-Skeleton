# Dispatch API
class CoreDispatchAPI extends CoreAPI

    constructor: (bsdbot) ->

        @state =

            opened: false
            receiving: false
            error: false

            history:
                errors: []
                received: []

            pending: {}
            complete: {}

        @init = () =>
            @state.opened = true
            $.apptools.dev.verbose('Dispatch', 'Dispatch startup signal received.')

        @expect = (id, request, xhr) =>
            @state.pending[id] = {request: request, callbacks: callbacks, xhr: xhr}
            $.apptools.dev.verbose('Dispatch', 'Received EXPECT signal.', id, request, callbacks, xhr)

        @receive = (raw_response) =>
            response = JSON.parse(raw_response.data)
            $.apptools.dev.verbose('Dispatch', 'Parsed async message.', response)
            @state.history.received.push(raw_response)

            if response.status == 'ok'
                $.apptools.dev.verbose('Dispatch', 'Triggering deferred success callback.')
                @state.complete[response.id] = @state.pending[response.id]
                @state.complete[response.id].response = response

                $.apptools.dev.log('RPC', 'Success', raw_response.data, response.status, @state.complete[response.id].xhr)
                $.apptools.api.rpc.lastResponse = raw_response.data
                $.apptools.api.rpc.history[response.id].xhr = @state.complete[response.id].xhr
                $.apptools.api.rpc.history[response.id].status = response.status
                $.apptools.api.rpc.history[response.id].response = raw_response.data

                context =
                    xhr: @state.complete[response.id].xhr
                    status: response.status
                    data: raw_response.data
                $.apptools.events.trigger('RPC_SUCCESS', context)
                $.apptools.events.trigger('RPC_COMPLETE', context)

                @state.complete[response.id].callbacks.success?(response.response.content)

            else if response.status == 'notify'
                $.apptools.dev.verbose('Dispatch', 'Received NOTIFY signal.')

                @state.pending[response.id].callbacks.notify?(response.response.content)

            else
                $.apptools.dev.error('Dispatch', 'Userland deferred task error. Calling error callback.', response)
                @state.pending[response.id].callbacks.error?(response.content)


        @error = (error) =>
            @state.error = true
            @history.errors.push(error)
            $.apptools.dev.error('Dispatch', 'Dispatch error state triggered.', error)

        @close = () =>
            @state.opened = false
            @state.receiving = false
            $.apptools.dev.verbose('Dispatch', 'Dispatch shutdown signal received.')
