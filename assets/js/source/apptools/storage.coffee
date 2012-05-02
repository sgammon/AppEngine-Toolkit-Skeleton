# Storage API
class CoreStorageAPI extends CoreAPI

    @mount = 'storage'
    @events = [
                # Storage events
                'STORAGE_INIT',
                'STORAGE_READY',
                'STORAGE_ERROR',
                'STORAGE_ACTIVITY',
                'STORAGE_READ',
                'STORAGE_WRITE',
                'STORAGE_DELETE'


                # Collection events
                'COLLECTION_SCAN',
                'COLLECTION_CREATE',
                'COLLECTION_DESTROY',
                'COLLECTION_UPDATE',
                'COLLECTION_SYNC'
            ]

    constructor: (apptools, window) ->

        ## 1: Create internal state
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


        ## 2: Internal Methods
        @internal =

            check_support: (modernizr) ->
            bootstrap: (lawnchair) ->
            provision_collection: (name, adapter, callback) ->


        ## 3: Public Methods
        @get = () =>
        @list = () =>
        @count = () =>
        @put = () =>
        @query = () =>
        @delete = () =>
        @sync = () =>


        ## 4: Runtime setup
        @_init = () =>
            apptools.dev.verbose 'Storage', 'Storage support is currently stubbed.'
            apptools.events.trigger 'STORAGE_INIT'
            apptools.events.trigger 'STORAGE_READY'

        ## 5: Bind/bridge events
        apptools.events.bridge ['STORAGE_READ', 'STORAGE_WRITE', 'STORAGE_DELETE'], 'STORAGE_ACTIVITY'
        apptools.events.bridge ['COLLECTION_CREATE', 'COLLECTION_UPDATE', 'COLLECTION_DESTROY', 'COLLECTION_SYNC', 'COLLECTION_SCAN'], 'STORAGE_ACTIVITY'


class StorageDriver extends CoreInterface

    @methods = []
    @export = "private"

    constructor: () ->
        return


@__apptools_preinit.abstract_base_classes.push StorageDriver
@__apptools_preinit.abstract_base_classes.push CoreStorageAPI
@__apptools_preinit.abstract_feature_interfaces.push {adapter: StorageDriver, name: "storage"}
