## AppTools RPC Framework
class RPCAPI
	
	constructor: (@name, @base_uri, @methods, @config) ->

		if @methods.length > 0
			for method in @methods
				@[method] = @_buildRPCMethod(method, base_uri, config)
				
				
	_buildRPCMethod: (method, base_uri, config) ->
		api = @name
		rpcMethod = (params={}, callbacks=null, async=false, opts={}) =>
			do (params={}, callbacks=null, async=false, opts={}) =>
				request = $.apptools.api.rpc.createRPCRequest({
			
					method: method
					api: api
					params: params || {}
					opts: opts || {}
					async: async || false
					
				})
				
				if callbacks isnt null
					return request.fulfill(callbacks)
				else
					return request
		
		$.apptools.api.registerAPIMethod(api, method, base_uri, config)
		return rpcMethod


class RPCRequest

	constructor: (id, opts, agent) ->

		@params = {}
		@action = null
		@method = null
		@api = null
		@base_uri = null

		@envelope =
			id: null
			opts: {}
			agent: {}

		@ajax =
			accepts: 'application/json'
			async: false
			cache: true
			global: true
			http_method: 'POST'
			crossDomain: false
			processData: false
			ifModified: false
			dataType: 'json'
			contentType: 'application/json; charset=utf-8'

		if id?
			@envelope.id = id
		if opts?
			@envelope.opts = opts
		if agent?
			@envelope.agent = agent
		
	fulfill: (callbacks, config...) ->
	
		if not callbacks?.success
			defaultSuccessCallback = (context) =>
				$.apptools.dev.log('RPC', 'RPC succeeded but had no success callback.', @)
			callbacks.success = defaultSuccessCallback
		
		if not callbacks?.failure
			defaultFailureCallback = (context) =>
				$.apptools.dev.error('RPC', 'RPC failed but had no failure callback.', @)
			callbacks.failure = defaultFailureCallback
	
		return $.apptools.api.rpc.fulfillRPCRequest(config, @, callbacks)

	setAsync: (async) ->
		@ajax?.async ?= async
		return @

	setOpts: (opts) ->
		@envelope?.opts ?= opts
		return @
		
	setAgent: (agent) ->
		@envelope?.agent ?= agent
		return @
		
	setAction: (@action) ->
		return @
		
	setMethod: (@method) ->
		return @
		
	setAPI: (@api) ->
		return @
		
	setBaseURI: (@base_uri) ->
		return @
		
	setParams: (@params={}) ->
		return @
			
	payload: ->
		_payload =
			id: @envelope.id
			opts: @envelope.opts
			agent: @envelope.agent
			request:
				params: @params
				method: @method
				api: @api
				
		return _payload


## Core RPC API
class CoreRPCAPI extends CoreAPI
	
	constructor: (apptools) ->

		## Register FCM events
		apptools.events.registerEvent('RPC_CREATE')
		apptools.events.registerEvent('RPC_FULFILL')
		apptools.events.registerEvent('RPC_SUCCESS')
		apptools.events.registerEvent('RPC_ERROR')
		apptools.events.registerEvent('RPC_COMPLETE')
		apptools.events.registerEvent('RPC_PROGRESS')
		
		## Use amplify, if we can
		if window.amplify?
			apptools.dev.verbose('RPC', 'AmplifyJS detected. Registering.')
			if apptools?.sys?.drivers
				apptools.sys.drivers.register('transport', 'amplify', window.amplify, true, true)

		@base_rpc_uri = '/_api/rpc'
		
		
		## Set up request internals
		original_xhr = $.ajaxSettings.xhr
		
		@internals =
		
			transports:
				
				xhr:
					factory: () =>
						req = original_xhr()
						if req
							if typeof req.addEventListener == 'function'
								req.addEventListener("progress", (ev) =>
										apptools.events.triggerEvent('RPC_PROGRESS', {event: ev})
								, false)
						return req
						
		$.ajaxSetup(
			
			global: true			
			xhr: () =>
				return @internals.transports.xhr.factory()

		)
		
		@rpc =
			
			lastRequest: null
			lastFailure: null
			lastResponse: null
			action_prefix: null
			history: {}
			used_ids: []
			
			factory: (name, base_uri, methods, config) ->
				$.apptools.api[name] = new RPCAPI(name, base_uri, methods, config)
					
			_assembleRPCURL: (method, api=null, prefix=null, base_uri=null) ->
				if api is null and base_uri is null
					throw "[RPC] Error: Must specify either an API or base URI to generate an RPC endpoint."
				else
					if base_uri is null ## if we're working with an API, get the base URI
						base_uri = $.apptools.api.base_rpc_uri+'/'+api

					if prefix isnt null
						return [prefix+base_uri, method].join('.')
					else
						return [base_uri, method].join('.')
						
			provisionRequestID: ->
				if @used_ids.length > 0
					id = Math.max.apply(@, @used_ids)+1
					@used_ids.push(id)
					return id
				else
					@used_ids.push(1)
					return 1
											
			decodeRPCResponse: (data, status, xhr, success, error) ->
				success(data, status)
					
			createRPCRequest: (config) ->

				request = new RPCRequest(@provisionRequestID())

				if config.api?
					request.setAPI(config.api)

				if config.method?
					request.setMethod(config.method)

				if config.agent?
					request.setAgent(config.agent)

				if config.opts?
					request.setOpts(config.opts)

				if config.base_uri?
					request.setBaseURI(config.base_uri)

				if config.params?
					request.setParams(config.params)

				if config.async?
					request.setAsync(config.async)
				
				$.apptools.dev.log('RPC', 'New Request', request, config)
				request.setAction(@_assembleRPCURL(request.method, request.api, @action_prefix, @base_rpc_uri))
						
				return request
				
			fulfillRPCRequest: (config, request, callbacks) ->

				$.apptools.dev.log('RPC', 'Fulfill', config, request, callbacks)

				@lastRequest = request

				@history[request.envelope.id] =
					request: request
					config: config
					callbacks: callbacks

				if request.action is null
					if request.method is null
						throw "[RPC] Error: Request must specify at least an action or method."
					if request.base_uri is null
						if request.api is null
							throw "[RPC] Error: Request must have an API or explicity BASE_URI."
						else
							request.action = @_assembleRPCURL(request.method, request.api, @action_prefix)
					else
						request.action = @_assembleRPCURL(request.method, null, @action_prefix, request.base_uri)

				if request.action is null or request.action is undefined
					throw '[RPC] Error: Could not determine RPC action.'
					
				context =
					config: config
					request: request
					callbacks: callbacks
				$.apptools.events.triggerEvent('RPC_FULFILL', context)
				
				do (request, callbacks) ->
					apptools = window.apptools
					
					xhr_settings =
						resourceId: request.api+'.'+request.method
						url: request.action
						data: JSON.stringify request.payload()
						async: request.ajax.async
						global: request.ajax.global
						type: request.ajax.http_method
						accepts: request.ajax.accepts
						crossDomain: request.ajax.crossDomain
						dataType: request.ajax.dataType
						processData: false
						ifModified: request.ajax.ifModified
						contentType: request.ajax.contentType
			
						beforeSend: (xhr, settings) =>
						
							$.apptools.api.rpc.history[request.envelope.id].xhr = xhr;
							callbacks?.status?('beforeSend')
							return xhr
				
						error: (xhr, status, error) =>
							callbacks?.status?('error')
							$.apptools.dev.error('RPC', 'Error: ', {error: error, status: status, xhr: xhr})
							$.apptools.api.rpc.lastFailure = error
							$.apptools.api.rpc.history[request.envelope.id].xhr = xhr
							$.apptools.api.rpc.history[request.envelope.id].status = status
							$.apptools.api.rpc.history[request.envelope.id].failure = error
						
							context =
								xhr: xhr
								status: status
								error: error
								
							$.apptools.events.triggerEvent('RPC_ERROR', context)
							$.apptools.events.triggerEvent('RPC_COMPLETE', context)			
							callbacks?.failure?(error)
				
						success: (data, status, xhr) =>

							if data.status == 'ok'
								callbacks?.status?('success')
								$.apptools.dev.log('RPC', 'Success', data, status, xhr)
								$.apptools.api.rpc.lastResponse = data
								$.apptools.api.rpc.history[request.envelope.id].xhr = xhr
								$.apptools.api.rpc.history[request.envelope.id].status = status
								$.apptools.api.rpc.history[request.envelope.id].response = data

								context =
									xhr: xhr
									status: status
									data: data
								$.apptools.events.triggerEvent('RPC_SUCCESS', context)
								$.apptools.events.triggerEvent('RPC_COMPLETE', context)

								$.apptools.dev.verbose('RPC', 'Success callback', callbacks)
							
								callbacks?.success?(data.response.content, data.response.type, data)
							
							else if data.status == 'failure'
								callbacks?.status?('error')
								$.apptools.dev.error('RPC', 'Error: ', {error: error, status: status, xhr: xhr})
								$.apptools.api.rpc.lastFailure = error
								$.apptools.api.rpc.history[request.envelope.id].xhr = xhr
								$.apptools.api.rpc.history[request.envelope.id].status = status
								$.apptools.api.rpc.history[request.envelope.id].failure = error
						
								context =
									xhr: xhr
									status: status
									error: error
								
								$.apptools.events.triggerEvent('RPC_ERROR', context)
								$.apptools.events.triggerEvent('RPC_COMPLETE', context)			
								callbacks?.failure?(error)

				
						statusCode:
				
							404: ->
								$.apptools.dev.error('RPC', 'HTTP/404', 'Could not resolve RPC action URI.')
								$.apptools.events.triggerEvent('RPC_ERROR', message: 'RPC 404: Could not resolve RPC action URI.', code: 404)
					
							403: ->
								$.apptools.dev.error('RPC', 'HTTP/403', 'Not authorized to access the specified endpoint.')
								$.apptools.events.triggerEvent('RPC_ERROR', message: 'RPC 403: Not authorized to access the specified endpoint.', code: 403)
					
							500: ->
								$.apptools.dev.error('RPC', 'HTTP/500', 'Internal server error.')
								$.apptools.events.triggerEvent('RPC_ERROR', message: 'RPC 500: Woops! Something went wrong. Please try again.', code: 500)
				
					if $.apptools?.sys?.drivers
						amplify = $.apptools.sys.drivers.resolve('transport', 'amplify')
						if amplify? and amplify is not false
							$.apptools.dev.verbose('RPC', 'Fulfilling with AmplifyJS adapter.')
							xhr_action = amplify.request
							xhr = xhr_action(xhr_settings)
						else
							$.apptools.dev.verbose('RPC', 'Fulfilling with AJAX adapter.', xhr_settings)
							xhr = $.ajax(xhr_settings.url, xhr_settings)
					else
						$.apptools.dev.verbose('RPC', 'Fulfilling with AJAX adapter.', xhr_settings)
						xhr = $.ajax(xhr_settings.url, xhr_settings)
						
					$.apptools.dev.verbose('RPC', 'Resulting XHR: ', xhr)
					
				return {id: request.envelope.id, request: request}
						
		@ext = null
		
		
		@registerAPIMethod = (api, name, base_uri, config) ->
			if $.apptools?.sys?.drivers
				amplify = $.apptools.sys.drivers.resolve('transport', 'amplify')
				if amplify isnt false
					$.apptools.dev.log('RPCAPI', 'Registering request procedure "'+api+'.'+name+'" with AmplifyJS.')

					resourceId = api+'.'+name
					base_settings =
					    accepts: 'application/json'
						type: 'POST'
						dataType: 'json'
						contentType: 'application/json'
						url: @api._assembleRPCURL(name, api, null, base_uri)
						decoder: @api.decodeRPCResponse

					if config.caching?
						if config.caching == true
							base_settings.caching = 'persist'
						amplify.request.define(resourceId, "ajax", base_settings)
					else
						amplify.request.define(resourceId, "ajax", base_settings)

		
		
window.RPCAPI = RPCAPI
window.RPCRequest = RPCRequest