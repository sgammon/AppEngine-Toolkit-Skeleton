from __future__ import division
from jinja2.runtime import LoopContext, TemplateReference, Macro, Markup, TemplateRuntimeError, missing, concat, escape, markup_join, unicode_join, to_string, identity, TemplateNotFound
def run(environment):
    name = '/source\\main\\helloworld.html'

    def root(context, environment=environment):
        parent_template = None
        if 0: yield None
        parent_template = environment.get_template('core/base_web.html', '/source\\main\\helloworld.html')
        for name, parent_block in parent_template.blocks.iteritems():
            context.blocks.setdefault(name, []).append(parent_block)
        for event in parent_template.root_render_func(context):
            yield event

    def block_main(context, environment=environment):
        if 0: yield None
        yield u'\n\t<h1>Welcome to AppTools!</h1>\n'

    blocks = {'main': block_main}
    debug_info = '1=9&3=15'
    return locals()