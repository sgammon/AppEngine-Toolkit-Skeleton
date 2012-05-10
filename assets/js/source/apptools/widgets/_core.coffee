## AppTools Widget Core
class CoreWidgetAPI extends CoreAPI

    @mount = 'widget'
    @events = []

    _init: (apptools) ->
        apptools.sys.state.add_flag 'widgets'
        apptools.dev.verbose 'CoreWidget', 'Widget functionality is currently stubbed.'
        return


class CoreWidget extends CoreObject


if @__apptools_preinit?
	if not @__apptools_preinit.abstract_base_classes?
		@__apptools_preinit.abstract_base_classes = []
	if not @__apptools_preinit.deferred_core_modules?
		@__apptools_preinit.deferred_core_modules = []
else
	@__apptools_preinit =
		abstract_base_classes: []
		deferred_core_modules: []

@__apptools_preinit.abstract_base_classes.push CoreWidget
@__apptools_preinit.abstract_base_classes.push CoreWidgetAPI
@__apptools_preinit.deferred_core_modules.push {module: CoreWidgetAPI}
