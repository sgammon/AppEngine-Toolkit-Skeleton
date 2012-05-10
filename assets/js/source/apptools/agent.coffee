# Agent/Capabilities API
class CoreAgentAPI extends CoreAPI

    @mount = 'agent'
    @events = ['UA_DISCOVER']

    constructor: (apptools, window) ->

        # Setup state
        @_data = {}

        # Expose platform & client results
        @platform = {}
        @capabilities = {}

        # Modernizr can do it better
        if apptools.lib.modernizr?
            @capabilities = apptools.lib.modernizr
        @capabilities.simple = {}

        # Setup lookup data for User-Agent
        @_data =

            browsers: [

                {
                    string: navigator.userAgent
                    subString: "Chrome"
                    identity: "Chrome"
                }

                {
                    string: navigator.userAgent
                    subString: "OmniWeb"
                    versionSearch: "OmniWeb/"
                    identity: "OmniWeb"
                }

                {
                    string: navigator.vendor
                    subString: "Apple"
                    identity: "Safari"
                    versionSearch: "Version"
                }

                {
                    prop: window.opera
                    identity: "Opera"
                }

                {
                    string: navigator.vendor
                    subString: "iCab"
                    identity: "iCab"
                }

                {
                    string: navigator.vendor
                    subString: "KDE"
                    identity: "Konqueror"
                }

                {
                    string: navigator.userAgent
                    subString: "Firefox"
                    identity: "Firefox"
                }

                {
                    string: navigator.vendor
                    subString: "Camino"
                    identity: "Camino"
                }

                {
                    string: navigator.userAgent
                    subString: "Netscape"
                    identity: "Netscape"
                }

                {
                    string: navigator.userAgent
                    subString: "MSIE"
                    identity: "Explorer"
                    versionSearch: "MSIE"
                }

                {
                    string: navigator.userAgent
                    subString: "Gecko"
                    identity: "Mozilla"
                    versionSearch: "rv"
                }

                {
                    string: navigator.userAgent
                    subString: "Mozilla"
                    identity: "Netscape"
                    versionSearch: "Mozilla"
                }
            ]

            os: [

                {
                    string: navigator.platform
                    subString: "Win"
                    identity: "Windows"
                }

                {
                    string: navigator.platform
                    subString: "Mac"
                    identity: "Mac"
                }

                {
                    string: navigator.userAgent
                    subString: "iPhone"
                    identity: "iPhone/iPod"
                }

                {
                    string: navigator.platform
                    subString: "Linux"
                    identity: "Linux"
                }

            ]

    _makeMatch: (data) ->
        for value in data
            string = value.string
            prop = value.prop
            @_data.versionSearchString = value.versionSearch || value.identity
            if string isnt null
                if value.string.indexOf(value.subString) isnt -1
                    return value.identity
            else if prop
                return value.identity

    _makeVersion: (dataString) ->
        index = dataString.indexOf(@_data.versionSearchString)
        if index is -1
            return
        else
            return parseFloat(dataString.substring(index+@_data.versionSearchString.length+1))

    # Discover info via User-Agent string
    discover: ->

        # Match browser
        browser = @_makeMatch(@_data.browsers) || "unknown"
        version = @_makeVersion(navigator.userAgent) || @_makeVersion(navigator.appVersion) || "unknown"

        # Match OS
        os = @_makeMatch(@_data.os) || "unknown"
        if browser is 'iPod/iPhone' || browser is 'Android'
            type = 'mobile'
            mobile = false

        @platform =
            os: os
            type: type
            vendor: navigator.vendor
            product: navigator.product
            browser: browser
            version: version
            flags:
                online: navigator.onLine || true
                mobile: mobile
                webkit: $.browser.webkit
                msie: $.browser.msie
                opera: $.browser.opera
                mozilla: $.browser.mozilla

        # Simple capabilities exported by navigator/jquery
        @capabilities.simple.cookies = navigator.cookieEnabled
        if window.jQuery?
            @capabilities.simple.ajax = $.support.ajax


@__apptools_preinit.abstract_base_classes.push CoreAgentAPI
