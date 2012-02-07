class CoreAPI

if @.Backbone?
  @.__apptools_preinit.backbone = true
  class AppToolsView extends Backbone.View
  class AppToolsModel extends Backbone.Model
  class AppToolsRouter extends Backbone.Router

  @.AppToolsView = AppToolsView
  @.AppToolsModel = AppToolsModel
  @.AppToolsRouter = AppToolsRouter

  if exports?
    exports['AppToolsView'] = AppToolsView
    exports['AppToolsModel'] = AppToolsModel
    exports['AppToolsRouter'] = AppToolsRouter

if exports?
  exports[key] = Milk[key] for key of Milk
  exports['CoreAPI'] = CoreAPI
else
  @.Milk = Milk
  @.CoreAPI = CoreAPI