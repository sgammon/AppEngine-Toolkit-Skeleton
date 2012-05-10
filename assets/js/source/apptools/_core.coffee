## Setup preinit container (picked up in _init.coffee on AppTools init)
if @__apptools_preinit?
  @__apptools_preinit.abstract_base_classes = []
  @__apptools_preinit.deferred_core_modules = []
  @__apptools_preinit.abstract_feature_interfaces = []
  @__apptools_preinit.deferred_library_integrations = []
else
  @__apptools_preinit =
    abstract_base_classes: [] # Holds base classes that are setup before init
    deferred_core_modules: [] # Holds core modules that are setup during init
    abstract_feature_interfaces: [] # Holds interfaces that wrap drivers and libraries
    deferred_library_integrations: [] # Holds libraries detected before init.

## CoreAPI: Holds a piece of AppTools core functionality.
class CoreAPI
@__apptools_preinit.abstract_base_classes.push CoreAPI

## CoreObject: Holds an interactive object that is usually attached to a CoreAPI in some way.
class CoreObject
@__apptools_preinit.abstract_base_classes.push CoreObject

## CoreInterface: Specifies an interface, usually used to adapt multiple libraries/modules to one task.
class CoreInterface
@__apptools_preinit.abstract_base_classes.push CoreInterface

## CoreException: Abstract exception class
class CoreException extends Error

  constructor: (@module, @message, @context) ->
  toString: () ->
    return '[' + @module + '] CoreException: ' + @message

@__apptools_preinit.abstract_base_classes.push CoreException

# AppTools/App errors
class AppException extends CoreException
  toString: () ->
    return '[' + @module + '] AppException: ' + @message

class AppToolsException extends CoreException
  toString: () ->
    return '[' + @module + '] AppToolsException: ' + @message

@__apptools_preinit.abstract_base_classes.push AppException
@__apptools_preinit.abstract_base_classes.push AppToolsException

## Check for Backbone.JS
if @Backbone?
  # Create Backbone.JS base classes
  class AppToolsView extends Backbone.View
  class AppToolsModel extends Backbone.Model
  class AppToolsRouter extends Backbone.Router
  class AppToolsCollection extends Backbone.Collection

else
  # Still export the classes...
  class AppToolsView
  class AppToolsModel
  class AppToolsRouter
  class AppToolsCollection

# Export to base classes
@__apptools_preinit.abstract_base_classes.push AppToolsView
@__apptools_preinit.abstract_base_classes.push AppToolsModel
@__apptools_preinit.abstract_base_classes.push AppToolsRouter
@__apptools_preinit.abstract_base_classes.push AppToolsCollection
