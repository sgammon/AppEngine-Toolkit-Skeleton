# Events API
class CoreEventsAPI extends CoreAPI

    @mount = 'events'
    @events = []

    constructor: (apptools, window) ->

        ## Expose eventlists
        @registry = [] # Global registry of all named events
        @callchain = {} # Event callbacks attached to named events
        @history = [] # Runtime event history

        ## Trigger a named event, optionally with context
        @fire = @trigger = (event, args...) =>

            apptools.dev.verbose 'Events', 'Triggered event:', event, args, @callchain[event]

            # Have we seen this event before?
            if event in @registry

                # Keep track of hooks executed/erred
                hook_exec_count = 0
                hook_error_count = 0
                event_bridges = []
                touched_events = []

                touched_events.push(event)

                # Consider all callchain directives
                for callback_directive in @callchain[event].hooks
                    try
                        # If it's a run-once and it's already run, continue as fast as possible...
                        if callback_directive.once == true and callback_directive.has_run == true
                            continue

                        # If it's not an event bridge, execute the hook
                        else if callback_directive.bridge? == false

                            # Execute callback with context, add to history/exec count
                            result = callback_directive.fn(args...)
                            hook_exec_count++
                            @history.push event: event, callback: callback_directive, args: args, result: result

                            # Mark as run
                            callback_directive.has_run = true

                        # If we encounter a bridge, defer it (after all hooks are executed for this event)...
                        else if callback_directive.bridge == true
                            event_bridges.push(event: callback_directive.event, args: args)

                    catch error
                        ## Increment error count and add to runtime history
                        hook_error_count++
                        @history.push event: event, callback: callback_directive, args: args, error: error

                # Execute deferred event bridges
                for bridge in event_bridges
                    touched_events.push(bridge.event)
                    @trigger(bridge.event, bridge.args...)

                return events: touched_events, executed: hook_exec_count, errors: hook_error_count
            else
                # Silent failure if we don't recognize the event...
                return false

        ## Register a named, global event so it can be triggered later.
        @create = @register = (names) =>

            if names not instanceof Array
                names = [names]

            for name in names
                # Add to event registry, create a slot in the callchain...
                @registry.push.apply(@registry, names)
                @callchain[name] =
                    hooks: []

            apptools.dev.verbose 'Events', 'Registered events:', {count: names.length, events: names}

            return true

        ## Register a callback to be executed when an event is triggered
        @on = @upon = @when = @hook = (event, callback, once=false) =>

            if event not in @registry
                apptools.dev.warning 'Events', ''
                @register(event)
            @callchain[event].hooks.push(fn: callback, once: once, has_run: false, bridge: false)
            apptools.dev.verbose 'Events', 'Hook registered on event.', event
            return true

        ## Delegate one event to another, to be triggered after all hooks on the original event
        @delegate = @bridge = (from_events, to_events) =>

            if typeof(to_events) == 'string'
                to_events = [to_events]
            if typeof(from_events) == 'string'
                from_events = [from_events]

            for source_ev in from_events
                for target_ev in to_events
                    apptools.dev.verbose('Events', 'Bridging events:', source_ev, '->', target_ev)
                    if not @callchain[source_ev]?
                        apptools.dev.warn('Events', 'Bridging from undefined source event:', source_ev)
                        @register(source_ev)
                    @callchain[source_ev].hooks.push(
                        event: target_ev,
                        bridge: true
                    )


@__apptools_preinit.abstract_base_classes.push CoreEventsAPI
