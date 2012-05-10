## Page Management
class PageManagerAPI extends CoreAdminAPI

    @mount = 'page'
    @events = ['PAGE_EDIT', 'PAGE_SAVE', 'PAGE_META_SAVE']

    constructor: (apptools, admin, window) ->
        apptools.dev.verbose 'PageManager', 'AppToolsXMS PageManager is currently stubbed.'


@__apptools_preinit.abstract_base_classes.push PageManagerAPI
@__apptools_preinit.deferred_core_modules.push {module: PageManagerAPI, package: 'admin'}
