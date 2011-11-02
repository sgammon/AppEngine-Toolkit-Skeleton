from __future__ import division
from jinja2.runtime import LoopContext, TemplateReference, Macro, Markup, TemplateRuntimeError, missing, concat, escape, markup_join, unicode_join, to_string, identity, TemplateNotFound
def run(environment):
    name = '/source/core/__south.html'

    def root(context, environment=environment):
        l_asset = context.resolve('asset')
        l_page = context.resolve('page')
        if 0: yield None
        yield u'<script src="//ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>\n<script>window.jQuery || document.write(\'<script src="js/libs/jquery-1.6.2.min.js"><\\/script>\')</script>\n\n<!-- Base Scripts -->\n<script src="%s"></script>\n<script src="%s"></script>\n<script src="%s"></script>\n<script src="%s"></script>\n\n<!-- Project Scripts -->\n<script src="%s"></script>\n\n' % (
            context.call(environment.getattr(l_asset, 'script'), 'base', 'apptools'), 
            context.call(environment.getattr(l_asset, 'script'), 'modernizr', 'core'), 
            context.call(environment.getattr(l_asset, 'script'), 'storage', 'apptools'), 
            context.call(environment.getattr(l_asset, 'script'), 'rpc', 'apptools'), 
            context.call(environment.getattr(l_asset, 'script'), 'base', 'apptools'), 
        )
        if environment.getattr(l_page, 'analytics'):
            if 0: yield None
            yield u'\n<script>\n\t'
            template = environment.get_template('snippets/google_analytics.js', '/source/core/__south.html')
            for event in template.root_render_func(template.new_context(context.parent, True, locals())):
                yield event
            yield u'\n</script>\n'
        yield u'\n\n<!--[if lt IE 7 ]>\n\t<script src="//ajax.googleapis.com/ajax/libs/chrome-frame/1.0.2/CFInstall.min.js"></script>\n\t<script>window.attachEvent("onload",function(){CFInstall.check({mode:"overlay"})})</script>\n<![endif]-->'

    blocks = {}
    debug_info = '5=11&6=12&7=13&8=14&11=15&13=17&15=20'
    return locals()