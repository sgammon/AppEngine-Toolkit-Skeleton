from __future__ import division
from jinja2.runtime import LoopContext, TemplateReference, Macro, Markup, TemplateRuntimeError, missing, concat, escape, markup_join, unicode_join, to_string, identity, TemplateNotFound
def run(environment):
    name = '/source/core/base_web.html'

    def root(context, environment=environment):
        parent_template = None
        if 0: yield None
        parent_template = environment.get_template('core/__base.html', '/source/core/base_web.html')
        for name, parent_block in parent_template.blocks.iteritems():
            context.blocks.setdefault(name, []).append(parent_block)
        for event in parent_template.root_render_func(context):
            yield event

    def block_body(context, environment=environment):
        if 0: yield None
        yield u'\n<div id="container">\n\t'
        for event in context.blocks['_wrapper'][0](context):
            yield event
        yield u'\n</div> <!--! end of #container -->\n'

    def block_header(context, environment=environment):
        if 0: yield None

    def block_main(context, environment=environment):
        if 0: yield None

    def block__wrapper(context, environment=environment):
        if 0: yield None
        yield u'\n\t<header>\n\t\t'
        for event in context.blocks['header'][0](context):
            yield event
        yield u'\n\t</header>\n\t<div id="main" role="main">\n\t\t'
        for event in context.blocks['main'][0](context):
            yield event
        yield u'\n\t</div>\n\t<footer>\n\t\t'
        for event in context.blocks['footer'][0](context):
            yield event
        yield u'\n\t</footer>\n\t'

    def block_footer(context, environment=environment):
        if 0: yield None

    blocks = {'body': block_body, 'header': block_header, 'main': block_main, '_wrapper': block__wrapper, 'footer': block_footer}
    debug_info = '1=9&3=15&5=18&7=22&10=25&5=28&7=31&10=34&13=37'
    return locals()