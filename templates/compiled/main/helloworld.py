from __future__ import division
from jinja2.runtime import LoopContext, TemplateReference, Macro, Markup, TemplateRuntimeError, missing, concat, escape, markup_join, unicode_join, to_string, identity, TemplateNotFound
def run(environment):
    name = '/source/main/helloworld.html'

    def root(context, environment=environment):
        parent_template = None
        if 0: yield None
        parent_template = environment.get_template('core/base_web.html', '/source/main/helloworld.html')
        for name, parent_block in parent_template.blocks.iteritems():
            context.blocks.setdefault(name, []).append(parent_block)
        for event in parent_template.root_render_func(context):
            yield event

    def block_main(context, environment=environment):
        l_util = context.resolve('util')
        if 0: yield None
        yield u"\n\n<div id='welcome'>\n\t<h1>Hello, world!</h1>\n\t\n\t<p>Welcome to your new, AppTools-powered App Engine app.</p>\n\n\t<div id='debugtools'>\n\t\t<p><b>Service tools</b>\n\t\t\t<ul>\n\t\t\t\t<li class='section'><a class='openclose opened' href='#servicetest'>Service Test</a>\n\t\t\t\t\t<ul>\n\t\t\t\t\t\t<li>Service.HelloWorld result: <pre>Hello, 127.0.0.1!</pre></li>\n\t\t\t\t\t</ul>\n\t\t\t\t</li>\n\n\t\t\t\t<li class='section closed'><a class='openclose closed' href='#services'>Configured Services</a>\n\t\t\t\t\t<ul class='collapsed'>\n\t\t\t\t\t\t<li>Service One</li>\n\t\t\t\t\t</ul>\n\t\t\t\t</li>\n\t\t\t</ul>\n\n\t\t<p><b>Runtime information</b>\n\t\t\t<ul>\n\t\t\t\t<li class='section opened'><a class='openclose opened' href='#appinfo'>Application</a>\n\t\t\t\t\t<ul class='expanded'>\n\t\t\t\t\t\t<li>Name: %s</li>\n\t\t\t\t\t\t<li>Version: %s.%s.%s %s</li>\n\t\t\t\t\t\t<li>Debug Mode: " % (
            environment.getattr(environment.getattr(environment.getattr(l_util, 'config'), 'project'), 'name'), 
            environment.getattr(environment.getattr(environment.getattr(environment.getattr(l_util, 'config'), 'project'), 'version'), 'major'), 
            environment.getattr(environment.getattr(environment.getattr(environment.getattr(l_util, 'config'), 'project'), 'version'), 'minor'), 
            environment.getattr(environment.getattr(environment.getattr(environment.getattr(l_util, 'config'), 'project'), 'version'), 'micro'), 
            environment.getattr(environment.getattr(environment.getattr(environment.getattr(l_util, 'config'), 'project'), 'version'), 'build'), 
        )
        if environment.getattr(environment.getattr(l_util, 'config'), 'debug'):
            if 0: yield None
            yield u"<span style='color: green'>"
        else:
            if 0: yield None
            yield u"<span style='color: red'>"
        yield u"%s</span></li>\n\t\t\t\t\t</ul>\n\t\t\t\t</li>\n\t\t\t\t<li class='section closed'><a class='openclose closed' href='#request'>Request</a>\n\t\t\t\t\t<ul class='collapsed'>\n\t\t\t\t\t\t<li>Hash: %s</li>\n\t\t\t\t\t\t<li>Namespace: %s</li>\n\t\t\t\t\t\t<li>Datacenter: %s</li>\n\t\t\t\t\t\t<li>Instance: %s</li>\n\t\t\t\t\t\t<li>Backend: %s</li>\n\t\t\t\t\t</ul>\n\t\t\t\t</li>\n\t\t\t\t<li class='section closed'><a class='openclose closed' href='#request'>Environment</a>\n\t\t\t\t\t<ul class='collapsed'>\n\t\t\t\t\t\t" % (
            environment.getattr(environment.getattr(l_util, 'config'), 'debug'), 
            environment.getattr(environment.getattr(l_util, 'request'), 'hash'), 
            environment.getattr(environment.getattr(l_util, 'request'), 'namespace'), 
            environment.getattr(environment.getattr(l_util, 'appengine'), 'datacenter'), 
            environment.getattr(environment.getattr(l_util, 'appengine'), 'instance'), 
            environment.getattr(environment.getattr(l_util, 'appengine'), 'backend'), 
        )
        l_k = l_v = missing
        for (l_k, l_v) in context.call(environment.getattr(environment.getattr(environment.getattr(l_util, 'request'), 'env'), 'items')):
            if 0: yield None
            yield u'\n\t\t\t\t\t\t\t<li>%s: %s</li>\n\t\t\t\t\t\t' % (
                l_k, 
                l_v, 
            )
        l_k = l_v = missing
        yield u'\n\t\t\t\t\t</ul>\n\t\t\t\t</li>\n\t\t\t</ul>\n\t\t</p>\n\t</div>\n</div>\n\n\n\n'

    blocks = {'main': block_main}
    debug_info = '1=9&3=15&30=19&31=20&32=25&37=33&38=34&39=35&40=36&41=37&46=40&47=43'
    return locals()