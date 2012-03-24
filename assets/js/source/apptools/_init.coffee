# Package Init
class AppTools

	constructor: (window)  ->

		## Basic system properties
		@sys =
			version:
				major: 0
				minor: 1
				micro: 3
				build: 02062011 # m/d/y
				release: "ALPHA"
			platform: {}

		## Library Bridge
		@lib = {}

		## Find and register libraries
		if window?.Modernizr?
			@lib.modernizr = window.Modernizr
			@load = (fragment) =>
				return @lib.modernizr.load(fragment)

		if window?.Backbone?
			@lib.backbone = window.Backbone

		if window?.Lawnchair?
			@lib.lawnchair = window.Lawnchair

		if window?.amplify?
			@lib.amplify = window.amplify

		if window?.jQuery?
			@lib.jquery = window.jQuery

		if window?.Milk?
			@lib.milk = window.Milk

		if window?.Mustache?
			@lib.mustache = window.Mustache

		## Dev API (for logging/debugging)
		@dev = new CoreDevAPI(@)

		## Model API
		@model = new CoreModelAPI(@)

		## Events API
		@events = new CoreEventsAPI(@)

		## Agent API
		@agent = new CoreAgentAPI(@)
		@agent.discover()

		## Dispatch API
		@dispatch = new CoreDispatchAPI(@)

		## JSONRPC (service layer) API
		@api = new CoreRPCAPI(@)

		## Users API
		@user = new CoreUserAPI(@)

		## Live API
		@push = new CorePushAPI(@)

		return @

window.AppTools = AppTools
window.apptools = new AppTools(window)
if $?
	$.extend(apptools: window.apptools)