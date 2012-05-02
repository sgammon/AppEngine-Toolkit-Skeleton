# Render API API
class CoreRenderAPI extends CoreAPI

    @mount = 'render'
    @events = ['ADD_TEMPLATE', 'RENDER_TEMPLATE']
    @export = 'private'

    constructor: (apptools, window) ->
        return

    _init: () ->
        return

class RenderDriver extends CoreInterface

    @export = 'private'
    @methods = ['render', 'register_template']

    constructor: () ->
        return

class QueryDriver extends CoreInterface

    @export = 'private'
    @methods = ['element_by_id', 'elements_by_class']

    constructor: () ->
        return


@__apptools_preinit.abstract_base_classes.push QueryDriver
@__apptools_preinit.abstract_base_classes.push RenderDriver
@__apptools_preinit.abstract_base_classes.push CoreRenderAPI
@__apptools_preinit.abstract_feature_interfaces.push {adapter: RenderDriver, name: "render"}
