# User API
class CoreUserAPI extends CoreAPI

    constructor: (apptools) ->

        @setUserInfo = (userinfo) =>

            $.apptools.dev.log('UserAPI', 'Setting server-injected userinfo: ', userinfo)
            @current_user = userinfo?.current_user