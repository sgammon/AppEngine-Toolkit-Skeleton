from __future__ import division
from jinja2.runtime import LoopContext, TemplateReference, Macro, Markup, TemplateRuntimeError, missing, concat, escape, markup_join, unicode_join, to_string, identity, TemplateNotFound
def run(environment):
    name = '/source\\core\\__north.html'

    def root(context, environment=environment):
        if 0: yield None
        for event in context.blocks['north_head'][0](context):
            yield event

    def block_north_head(context, environment=environment):
        l_asset = context.resolve('asset')
        l_page = context.resolve('page')
        if 0: yield None
        yield u'\n<title>'
        for event in context.blocks['title'][0](context):
            yield event
        yield u'</title>\n\n<!-- Stylesheets -->\n<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Satisfy">\n<link rel="stylesheet" href="%s">\n\n' % (
            context.call(environment.getattr(l_asset, 'style'), 'main', 'compiled'), 
        )
        if environment.getattr(l_page, 'ie'):
            if 0: yield None
            yield u'\n<!-- IE Fixes -->\n<link rel="stylesheet" href="%s">\n' % (
                context.call(environment.getattr(l_asset, 'style'), 'ie', 'compiled'), 
            )
        yield u'\n\n'
        if environment.getattr(l_page, 'mobile'):
            if 0: yield None
            yield u'\n<!-- Mobile -->\n<link rel=\'stylesheet\' href="%s">\n' % (
                context.call(environment.getattr(l_asset, 'style'), 'mobile', 'compiled'), 
            )
        yield u'\n'

    def block_title(context, environment=environment):
        l_page = context.resolve('page')
        l_title = context.resolve('title')
        if 0: yield None
        if environment.getattr(l_page, 'title'):
            if 0: yield None
            yield to_string(environment.getattr(l_page, 'title'))
        else:
            if 0: yield None
            if l_title:
                if 0: yield None
                yield to_string(l_title)

    blocks = {'north_head': block_north_head, 'title': block_title}
    debug_info = '1=8&2=16&6=19&8=21&10=24&13=27&15=30&2=34'
    return locals()