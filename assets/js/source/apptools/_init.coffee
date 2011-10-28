
class AppTools
	
	constructor: (@config)  ->
		
		## Sys API
		@sys = new CoreSysAPI(@)

		## Agent API
		@agent = new CoreAgentAPI(@)
		@agent.discover()
		
		## Events API
		@events = new CoreEventsAPI(@)		
		
		## Model API
		@model = new CoreModelAPI(@)

		## Javascript API Methods
		@api = new CoreAPIBridge(@)
				
		## Users API
		@user = new CoreUserAPI(@)
		
		## RPC API
		@rpc = new CoreRPCAPI(@)
		
		## Live API
		@push = new CorePushAPI(@)
		
		return @


window.apptools = new AppTools()
if $?
	$.extend(apptools: window.apptools)