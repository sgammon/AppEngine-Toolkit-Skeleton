from __future__ import division
from jinja2.runtime import LoopContext, TemplateReference, Macro, Markup, TemplateRuntimeError, missing, concat, escape, markup_join, unicode_join, to_string, identity, TemplateNotFound
def run(environment):
    name = '/source\\snippets\\google_analytics.js'

    def root(context, environment=environment):
        if 0: yield None
        yield u"var _gaq=[['_setAccount','UA-XXXXX-X'],['_trackPageview']];\n(function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];\ng.src=('https:'==location.protocol?'//ssl':'//www')+'.google-analytics.com/ga.js';\ns.parentNode.insertBefore(g,s)}(document,'script'));"

    blocks = {}
    debug_info = ''
    return locals()