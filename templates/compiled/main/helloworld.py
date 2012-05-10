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
        l_util = context.resolve('util')
        l_assets = context.resolve('assets')
        if 0: yield None
        yield u"\n\n<div id='welcome'>\n  <h1>Hello, world!</h1>\n\n  <p>Welcome to your new, AppTools-powered App Engine app.</p>\n\n  <div id='debugtools'>\n    <p><b>Service tools</b>\n      <ul>\n        <li class='section'><a class='openclose opened' href='#servicetest'>Service Test</a>\n          <ul>\n            <li>Service.HelloWorld result: <pre>Hello, 127.0.0.1!</pre></li>\n          </ul>\n        </li>\n\n        <li class='section closed'><a class='openclose closed' href='#services'>Configured Services</a>\n          <ul class='collapsed'>\n            <li>Service One</li>\n          </ul>\n        </li>\n      </ul>\n\n    <p><b>AppTools information</b>\n      <ul>\n        <li><a href='#'>Core APIs</a>\n          <ul>\n            <li>Assets API<ul>\n              <li>Force HTTPS: %s</li>\n              <li>Force Absolute: %s</li>\n            </ul></li>\n            <li>Output API<ul>\n                <li>Loader: __NULL__</li>\n\n              </ul>\n            </li></ul></li>\n      </ul>\n    </p>\n\n    <p><b>Runtime information</b>\n      <ul>\n        <li class='section opened'><a class='openclose opened' href='#appinfo'>Application</a>\n          <ul class='expanded'>\n            <li>Name: %s</li>\n            <li>Version: %s.%s.%s %s</li>\n            <li>Debug Mode: " % (
            environment.getattr(l_assets, 'force_https'), 
            environment.getattr(l_assets, 'force_absolute'), 
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
        yield u"%s</span></li>\n          </ul>\n        </li>\n        <li class='section closed'><a class='openclose closed' href='#request'>Request</a>\n          <ul class='collapsed'>\n            <li>Hash: %s</li>\n            <li>Namespace: %s</li>\n            <li>Datacenter: %s</li>\n            <li>Instance: %s</li>\n            <li>Backend: %s</li>\n            <li>Headers:\n              <ul>\n                " % (
            environment.getattr(environment.getattr(l_util, 'config'), 'debug'), 
            environment.getattr(environment.getattr(l_util, 'request'), 'hash'), 
            environment.getattr(environment.getattr(l_util, 'request'), 'namespace'), 
            environment.getattr(environment.getattr(l_util, 'appengine'), 'datacenter'), 
            environment.getattr(environment.getattr(l_util, 'appengine'), 'instance'), 
            environment.getattr(environment.getattr(l_util, 'appengine'), 'backend'), 
        )
        l_header = l_value = missing
        for (l_header, l_value) in context.call(environment.getattr(environment.getattr(environment.getattr(l_util, 'request'), 'headers'), 'items')):
            if 0: yield None
            yield u'\n                <li><b>%s</b> => <pre>%s</pre></li>\n                ' % (
                l_header, 
                l_value, 
            )
        l_header = l_value = missing
        yield u"\n              </ul>\n            </li>\n          </ul>\n        </li>\n        <li class='section closed'><a class='openclose closed' href='#request'>Environment</a>\n          <ul class='collapsed'>\n            "
        l_k = l_v = missing
        for (l_k, l_v) in context.call(environment.getattr(environment.getattr(environment.getattr(l_util, 'request'), 'env'), 'items')):
            if 0: yield None
            yield u'\n              <li>%s: %s</li>\n            ' % (
                l_k, 
                l_v, 
            )
        l_k = l_v = missing
        yield u'\n          </ul>\n        </li>\n      </ul>\n    </p>\n  </div>\n</div>\n\n'

    blocks = {'main': block_main}
    debug_info = '1=9&3=15&31=20&32=21&46=22&47=23&48=28&53=36&54=37&55=38&56=39&57=40&60=43&61=46&69=52&70=55'
    return locals()