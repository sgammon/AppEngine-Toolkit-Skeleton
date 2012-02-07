from __future__ import division
from jinja2.runtime import LoopContext, TemplateReference, Macro, Markup, TemplateRuntimeError, missing, concat, escape, markup_join, unicode_join, to_string, identity, TemplateNotFound
def run(environment):
    name = '/source\\core\\base_web.html'

    def root(context, environment=environment):
        parent_template = None
        l_page = context.resolve('page')
        if 0: yield None
        parent_template = environment.get_template('core/__base.html', '/source\\core\\base_web.html')
        for name, parent_block in parent_template.blocks.iteritems():
            context.blocks.setdefault(name, []).append(parent_block)
        if environment.getattr(l_page, 'ie'):
            if 0: yield None
        for event in parent_template.root_render_func(context):
            yield event

    def block_body(context, environment=environment):
        if 0: yield None
        yield u'\n\n<!-- Header -->\n<div id="header-container">\n\t<header class="wrapper clearfix" role="banner">\n\t\t'
        for event in context.blocks['header'][0](context):
            yield event
        yield u'\n\t</header>\n</div>\n\n<!-- Main Content -->\n<div id="main-container">\n\t<div id="main" class="wrapper clearfix" role="main">\n\t\t'
        for event in context.blocks['main'][0](context):
            yield event
        yield u'\n\t</div> <!-- #main -->\n</div> <!-- #main-container -->\n\n<!-- Footer -->\n<div id="footer-container">\n\t<footer class="wrapper" role="banner">\n\t\t'
        for event in context.blocks['footer'][0](context):
            yield event
        yield u'\n\t</footer>\n</div>\n\n'

    def block_header(context, environment=environment):
        if 0: yield None
        yield u'\n\t\t<h1 id="title">apptools</h1>\n\t\t<nav role="navigation">\n\t\t\t<ul>\n\t\t\t\t<li><a href="#">nav ul li a</a></li>\n\t\t\t\t<li><a href="#">nav ul li a</a></li>\n\t\t\t\t<li><a href="#">nav ul li a</a></li>\n\t\t\t</ul>\n\t\t</nav>\n\t\t'

    def block_main(context, environment=environment):
        if 0: yield None
        yield u'\n\t\t<article>\n\t\t\t<header>\n\t\t\t\t<h1>article header h1</h1>\n\t\t\t\t<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sodales urna non odio egestas tempor. Nunc vel vehicula ante. Etiam bibendum iaculis libero, eget molestie nisl pharetra in. In semper consequat est, eu porta velit mollis nec.</p>\n\t\t\t</header>\n\t\t\t<section>\n\t\t\t\t<h2>article section h2</h2>\n\t\t\t\t<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sodales urna non odio egestas tempor. Nunc vel vehicula ante. Etiam bibendum iaculis libero, eget molestie nisl pharetra in. In semper consequat est, eu porta velit mollis nec. Curabitur posuere enim eget turpis feugiat tempor. Etiam ullamcorper lorem dapibus velit suscipit ultrices. Proin in est sed erat facilisis pharetra.</p>\n\t\t\t</section>\n\t\t\t<section>\n\t\t\t\t<h2>article section h2</h2>\n\t\t\t\t<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sodales urna non odio egestas tempor. Nunc vel vehicula ante. Etiam bibendum iaculis libero, eget molestie nisl pharetra in. In semper consequat est, eu porta velit mollis nec. Curabitur posuere enim eget turpis feugiat tempor. Etiam ullamcorper lorem dapibus velit suscipit ultrices. Proin in est sed erat facilisis pharetra.</p>\n\t\t\t</section>\n\t\t\t<footer>\n\t\t\t\t<h3>article footer h3</h3>\n\t\t\t\t<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sodales urna non odio egestas tempor. Nunc vel vehicula ante. Etiam bibendum iaculis libero, eget molestie nisl pharetra in. In semper consequat est, eu porta velit mollis nec. Curabitur posuere enim eget turpis feugiat tempor.</p>\n\t\t\t</footer>\n\t\t</article>\n\n\t\t<aside>\n\t\t\t<h3>aside</h3>\n\t\t\t<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sodales urna non odio egestas tempor. Nunc vel vehicula ante. Etiam bibendum iaculis libero, eget molestie nisl pharetra in. In semper consequat est, eu porta velit mollis nec. Curabitur posuere enim eget turpis feugiat tempor. Etiam ullamcorper lorem dapibus velit suscipit ultrices.</p>\n\t\t</aside>\n\t\t'

    def block_footer(context, environment=environment):
        if 0: yield None
        yield u'\n\t\t<h3>footer</h3>\n\t\t'

    blocks = {'body': block_body, 'header': block_header, 'main': block_main, 'footer': block_footer}
    debug_info = '1=10&3=13&7=18&12=21&28=24&59=27&12=31&28=35&59=39'
    return locals()