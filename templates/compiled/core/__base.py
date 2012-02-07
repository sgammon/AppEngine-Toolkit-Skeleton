from __future__ import division
from jinja2.runtime import LoopContext, TemplateReference, Macro, Markup, TemplateRuntimeError, missing, concat, escape, markup_join, unicode_join, to_string, identity, TemplateNotFound
def run(environment):
    name = '/source\\core\\__base.html'

    def root(context, environment=environment):
        if 0: yield None
        yield u'<!doctype html>\n<!--[if lt IE 7]> <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang="en"> <![endif]-->\n<!--[if IE 7]>    <html class="no-js lt-ie9 lt-ie8" lang="en"> <![endif]-->\n<!--[if IE 8]>    <html class="no-js lt-ie9" lang="en"> <![endif]-->\n<!--[if gt IE 8]><!--> <html class="no-js" lang="en"> <!--<![endif]-->\n<head>\n\t'
        template = environment.get_template('core/__north.html', '/source\\core\\__base.html')
        for event in template.root_render_func(template.new_context(context.parent, True, locals())):
            yield event
        yield u'\n</head>\n\n<body role="application">\n'
        for event in context.blocks['body'][0](context):
            yield event
        yield u'\n\n'
        template = environment.get_template('core/__south.html', '/source\\core\\__base.html')
        for event in template.root_render_func(template.new_context(context.parent, True, locals())):
            yield event
        yield u'\n</body>\n</html>'

    def block_body(context, environment=environment):
        if 0: yield None
        yield u'\n'

    blocks = {'body': block_body}
    debug_info = '7=9&11=13&14=16&11=21'
    return locals()