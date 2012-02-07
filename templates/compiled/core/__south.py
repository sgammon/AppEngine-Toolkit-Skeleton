from __future__ import division
from jinja2.runtime import LoopContext, TemplateReference, Macro, Markup, TemplateRuntimeError, missing, concat, escape, markup_join, unicode_join, to_string, identity, TemplateNotFound
def run(environment):
    name = '/source\\core\\__south.html'

    def root(context, environment=environment):
        l_asset = context.resolve('asset')
        l_page = context.resolve('page')
        if 0: yield None
        yield u'<script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>\n<script>window.jQuery || document.write(\'<script src="%s"><\\/script>\')</script>\n\n<!-- Base Scripts -->\n<script src="%s"></script>\n<script src="%s"></script>\n<script src="%s"></script>\n<script src="%s"></script>\n\n<!-- Project Scripts -->\n<script src="%s"></script>\n\n' % (
            context.call(environment.getattr(l_asset, 'script'), 'jquery', 'core'), 
            context.call(environment.getattr(l_asset, 'script'), 'base', 'apptools'), 
            context.call(environment.getattr(l_asset, 'script'), 'modernizr', 'core'), 
            context.call(environment.getattr(l_asset, 'script'), 'storage', 'apptools'), 
            context.call(environment.getattr(l_asset, 'script'), 'rpc', 'apptools'), 
            context.call(environment.getattr(l_asset, 'script'), 'base', 'apptools'), 
        )
        if environment.getattr(l_page, 'analytics'):
            if 0: yield None
            yield u'\n<script>\n\t'
            template = environment.get_template('snippets/google_analytics.js', '/source\\core\\__south.html')
            for event in template.root_render_func(template.new_context(context.parent, True, locals())):
                yield event
            yield u'\n</script>\n'

    blocks = {}
    debug_info = '2=11&5=12&6=13&7=14&8=15&11=16&13=18&15=21'
    return locals()