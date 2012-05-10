# User API
class CoreUserAPI extends CoreAPI

    @mount = 'user'
    @events = ['SET_USER_INFO']

    constructor: (apptools, window) ->
        @current_user = null

    ## Set user info. Usually run by the server during JS injection.
    setUserInfo: (userinfo) ->

        # Set user, log this, and trigger SET_USER_INFO
        @current_user = userinfo.current_user || null
        $.apptools.dev.log('UserAPI', 'Set server-injected userinfo: ', @current_user)
        $.apptools.events.trigger('SET_USER_INFO', @current_user)

@__apptools_preinit.abstract_base_classes.push CoreUserAPI
