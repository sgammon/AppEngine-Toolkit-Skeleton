@.__apptools_preinit =
  lib: {}
  abstract_base_classes: []

class CoreAPI

if @.Backbone?
  @.__apptools_preinit.lib.backbone =
    enabled: true
    reference: @.Backbone
  class AppToolsView extends Backbone.View
  class AppToolsModel extends Backbone.Model
  class AppToolsRouter extends Backbone.Router
  class AppToolsCollection extends Backbone.Collection

else
  @.__apptools_preinit.lib.backbone =
    enabled: false
    reference: null

  class AppToolsView
  class AppToolsModel
  class AppToolsRouter
  class AppToolsCollection


if exports?
  exports[key] = Milk[key] for key of Milk
  exports['CoreAPI'] = CoreAPI
  exports['AppToolsView'] = AppToolsView
  exports['AppToolsModel'] = AppToolsModel
  exports['AppToolsRouter'] = AppToolsRouter
  exports['AppToolsCollection'] = AppToolsCollection

else
  @.Milk = Milk
  @.CoreAPI = CoreAPI

  @.__apptools_preinit.lib.milk =
    enabled: true
    reference: @.Milk

  @.__apptools_preinit.abstract_base_classes.push CoreAPI

  @.AppToolsView = AppToolsView
  @.AppToolsModel = AppToolsModel
  @.AppToolsRouter = AppToolsRouter
  @.AppToolsCollection = AppToolsCollection

  @.__AppToolsBaseClasses =
    AppToolsView: AppToolsView,
    AppToolsModel: AppToolsModel,
    AppToolsRouter: AppToolsRouter,
    AppToolsCollection: AppToolsCollection

  @.__apptools_preinit.abstract_base_classes.push AppToolsView
  @.__apptools_preinit.abstract_base_classes.push AppToolsModel
  @.__apptools_preinit.abstract_base_classes.push AppToolsRouter
  @.__apptools_preinit.abstract_base_classes.push AppToolsCollection