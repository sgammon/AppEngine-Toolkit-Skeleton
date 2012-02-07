# Storage API
class CoreStorageAPI extends CoreAPI

    constructor: (apptools) ->

        ## 1: Register storage events
        apptools.events.register('STORAGE_INIT')
        apptools.events.register('STORAGE_READY')
        apptools.events.register('STORAGE_ERROR')
        apptools.events.register('STORAGE_ACTIVITY')

        # Collection Events
        apptools.events.register('COLLECTION_SCAN')
        apptools.events.register('COLLECTION_CREATE')
        apptools.events.register('COLLECTION_DESTROY')
        apptools.events.register('COLLECTION_UPDATE')
        apptools.events.register('COLLECTION_SYNC')

        # Read/Write/Delete
        apptools.events.register('STORAGE_READ')
        apptools.events.register('STORAGE_WRITE')
        apptools.events.register('STORAGE_DELETE')


        ## 2: Create internal state
        @_state =

            # Runtime/opt data
            runtime:

                # Data and stat indexes
                index:
                    key_read_tally: {}
                    key_write_tally: {}
                    local_by_key: {}
                    local_by_kind: {}

                # Key/collection/kind counts
                count:
                    total_keys: 0
                    by_collection: []
                    by_kind: []

                # Local entity JSON data
                data: {}

            # Runtime configuration
            config:

                autoload: false     # trigger bootstrap (and potentially sync) on pageload
                autosync:           # automatic sync functionality (backbone integration)
                    enabled: false  # enable/disable flag (bool)
                    interval: 120   # sync interval, in seconds (int)

                adapters: {}        # storage engine adapters
                obfuscate: false    # base64 keys before they go into storage
                local_only: false   # only store things locally in the storage API memory space

                callbacks:          # app-level hookin points
                    ready: null
                    sync: null

            # Optimization supervisor and inject bridge
            supervisor: {}
            cachebridge: {}

            # Class/model kind map
            model_kind_map: {}
            collection_kind_map: {}


        ## 3: Internal Methods
        @internal =

            check_support: (modernizr) ->
            bootstrap: (lawnchair) ->
            provision_collection: (name, adapter, callback) ->


        ## 4: Public Methods
        @get = () =>
        @list = () =>
        @count = () =>
        @put = () =>
        @query = () =>
        @delete = () =>
        @sync = () =>


        ## 5: Runtime setup
        @enable = () =>
            apptools.events.trigger('STORAGE_INIT')
            apptools.events.trigger('STORAGE_READY')

        ## 6: Bind/bridge events
        apptools.events.bridge(['STORAGE_READ', 'STORAGE_WRITE', 'STORAGE_DELETE'], 'STORAGE_ACTIVITY')
        apptools.events.bridge(['COLLECTION_CREATE', 'COLLECTION_UPDATE', 'COLLECTION_DESTROY', 'COLLECTION_SYNC', 'COLLECTION_SCAN'], 'STORAGE_ACTIVITY')