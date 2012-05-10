from __future__ import division
from jinja2.runtime import LoopContext, TemplateReference, Macro, Markup, TemplateRuntimeError, missing, concat, escape, markup_join, unicode_join, to_string, identity, TemplateNotFound
def run(environment):
    name = '/source\\macros\\page_analytics.js'

    def root(context, environment=environment):
        if 0: yield None
        def macro(l_config):
            t_1 = []
            pass
            if environment.getattr(l_config, 'enable'):
                pass
                t_1.extend((
                    u"var _gaq = _gaq || [];\n\t  _gaq.push(['_setAccount', '", 
                    to_string(environment.getattr(l_config, 'account_id')), 
                    u"']);\n\t  _gaq.push(['_trackPageview']);\n\n\t  (function() {\n\t    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;\n\t    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';\n\t    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);\n\t  })();", 
                ))
            return concat(t_1)
        context.exported_vars.add('google_analytics_async')
        context.vars['google_analytics_async'] = l_google_analytics_async = Macro(environment, macro, 'google_analytics_async', ('config',), (), False, False, False)

    blocks = {}
    debug_info = '1=8&3=11&5=15'
    return locals()