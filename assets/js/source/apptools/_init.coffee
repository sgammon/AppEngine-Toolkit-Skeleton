
class AppTools
	
	constructor: (window)  ->
		
		## Library Bridge
		@lib = {}

		## Async Loader
		if window.Modernizr?
			@lib.modernizr = window.Modernizr
		
			if window.Modernizr?.load?
				@load = () =>
					return @lib.modernizr.load(arguments)
			
			else if window.yepnope?
				@lib.yepnope = window.yepnope
				@load = () =>
					return @lib.yepnope.load(arguments)

		## Backbone
		if window.Backbone?
			@lib.backbone = window.Backbone

		## Lawnchair
		if window.Lawnchair?
			@lib.lawnchair = window.Lawnchair

		## jQuery
		if window.jQuery?
			@lib.jquery = window.jQuery

		## Amplify
		if window.amplify?
			@lib.amplify = amplify

		## Dev Tools
		@dev = new CoreDevAPI(@)
		
		## Agent API
		@agent = new CoreAgentAPI(@)
		@agent.discover()
		
		## Events API
		@events = new CoreEventsAPI(@)
		
		## Users API
		@user = new CoreUserAPI(@)
		
		## RPC API
		@api = new CoreRPCAPI(@)
		
		## Live API
		@push = new CorePushAPI(@)

		return @


window.apptools = new AppTools(window)
if $?
	$.extend(apptools: window.apptools)