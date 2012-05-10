## Blog Management
class BlogManagerAPI extends CoreAdminAPI

    @mount = 'blog'
    @events = []

    constructor: (apptools, admin_api) ->
        apptools.dev.verbose 'BlogManager', 'AppToolsXMS BlogManager is currently stubbed.'


@__apptools_preinit.abstract_base_classes.push BlogManagerAPI
@__apptools_preinit.deferred_core_modules.push {module: BlogManagerAPI, package: 'admin'}
