## Site Management
class SiteManagerAPI extends CoreAdminAPI

    @mount = 'site'
    @events = ['SITE_EDIT', 'SITE_SAVE', 'SITE_META_SAVE']

    constructor: (apptools, admin, window) ->
        apptools.dev.verbose 'SiteManager', 'AppToolsXMS SiteManager is currently stubbed.'


@__apptools_preinit.abstract_base_classes.push SiteManagerAPI
@__apptools_preinit.deferred_core_modules.push {module: SiteManagerAPI, package: 'admin'}
