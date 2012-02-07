from __future__ import division
from jinja2.runtime import LoopContext, TemplateReference, Macro, Markup, TemplateRuntimeError, missing, concat, escape, markup_join, unicode_join, to_string, identity, TemplateNotFound
def run(environment):
    name = '/source\\core\\__meta.html'

    def root(context, environment=environment):
        if 0: yield None
        yield u'<!-- Meta -->\n<meta charset="utf-8">\n<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">\n\n<!-- Are you currently reading this, robot/human? -->\n<meta name="robots" content="/robots.txt">\n<meta name="humans" content="/humans.txt">\n\n<meta name="description" content="">\n<meta name="author" content="">\n<meta name="keywords" content ="">\n\n<!-- OpenGraph -->\n<meta property="og:title" content="">\n<meta property="og:type" content="website">\n<meta property="og:url" content="">\n<meta property="og:image" content="">\n<meta property="og:site_name" content="">\n<meta property="og:description" content="">\n<meta property="fb:app_id" content="">\n\n\n<meta name="viewport" content="width=device-width,initial-scale=1">'

    blocks = {}
    debug_info = ''
    return locals()