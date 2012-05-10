from __future__ import division
from jinja2.runtime import LoopContext, TemplateReference, Macro, Markup, TemplateRuntimeError, missing, concat, escape, markup_join, unicode_join, to_string, identity, TemplateNotFound
def run(environment):
    name = '/source\\core\\__base.html'

    def root(context, environment=environment):
        if 0: yield None
        yield u'<!doctype html>'
        for event in context.blocks['_tpl_root'][0](context):
            yield event

    def block_prenorth(context, environment=environment):
        if 0: yield None

    def block_body(context, environment=environment):
        if 0: yield None
        yield u'\n\t'

    def block_head(context, environment=environment):
        if 0: yield None
        yield u'\n\t\t'
        for event in context.blocks['meta'][0](context):
            yield event
        for event in context.blocks['prenorth'][0](context):
            yield event
        for event in context.blocks['north'][0](context):
            yield event
        for event in context.blocks['postnorth'][0](context):
            yield event
        yield u'\n\n\t\t<title>'
        for event in context.blocks['title'][0](context):
            yield event
        yield u'</title>\n\t'

    def block_north(context, environment=environment):
        if 0: yield None
        template = environment.get_template('core/__north.html', '/source\\core\\__base.html')
        for event in template.root_render_func(template.new_context(context.parent, True, locals())):
            yield event

    def block_title(context, environment=environment):
        if 0: yield None
        yield u'Welcome to AppTools!'

    def block_mobile(context, environment=environment):
        l_util = context.resolve('util')
        l_page = context.resolve('page')
        l_asset = context.resolve('asset')
        if 0: yield None
        if (environment.getattr(l_page, 'ios') or environment.getattr(environment.getattr(l_util, 'config'), 'debug')):
            if 0: yield None
            yield u'\n\t\t<!-- Mobile/Extras -->\n\t\t<meta name="MobileOptimized" content="320">\n\t\t<meta name="HandheldFriendly" content="True">\n\t\t<meta name="apple-mobile-web-app-capable" content="yes">\n\t\t<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />\n\n\t\t<link rel="apple-touch-icon" href="%s" />\n\t\t<link rel="apple-touch-startup-image" href="%s" />\n\t\t<link rel="apple-touch-icon-precomposed" href="%s">\n\t\t<link rel="apple-touch-icon-precomposed" sizes="114x114" href="%s">\n\t\t' % (
                context.call(environment.getattr(l_asset, 'image'), 'mobile/ios', 'touch-icon.png'), 
                context.call(environment.getattr(l_asset, 'image'), 'mobile/ios', 'iphone-splash.png'), 
                context.call(environment.getattr(l_asset, 'image'), 'mobile/ios', 'touch-icon-precomposed.png'), 
                context.call(environment.getattr(l_asset, 'image'), 'mobile/ios', 'apple-touch-icon.png'), 
            )

    def block_opengraph(context, environment=environment):
        l_page = context.resolve('page')
        if 0: yield None
        yield u'\n\t\t<!-- OpenGraph -->\n\t\t<meta property="og:title" content="" />\n\t\t<meta property="og:type" content="website" />\n\t\t<meta property="og:determiner" content="" />\n\t\t<meta property="og:locale" content="en_US" />\n\t\t<meta property="og:url" content="%s" />\n\t\t<meta property="og:description" content="" />\n\t\t<meta property="og:image" content="" />\n\t\t<meta property="og:image:width" content="298" />\n\t\t<meta property="og:image:height" content="298" />\n\t\t<meta property="og:site_name" content="" />\n\t\t<meta property="fb:app_id" content="" />\n\n\t\t<!-- Location/Geo -->\n\t\t<meta property="og:latitude" content="">\n\t\t<meta property="og:longitude" content="">\n\t\t<meta property="og:street-address" content="">\n\t\t<meta property="og:locality" content="">\n\t\t<meta property="og:region" content="">\n\t\t<meta property="og:postal-code" content="">\n\t\t<meta property="og:country-name" content="">\n\t\t<meta property="og:email" content="">\n\t\t<meta property="og:phone_number" content="">\n\t\t' % (
            environment.getattr(l_page, 'url'), 
        )

    def block_meta(context, environment=environment):
        l_util = context.resolve('util')
        l_page = context.resolve('page')
        l_asset = context.resolve('asset')
        if 0: yield None
        yield u'\n\t\t<!-- Meta -->\n\t\t<meta charset="utf-8">\n\t\t<meta http-equiv="Vary" content="encoding">\n\t\t<meta http-equiv="Content-Language" content="en">\n\t\t<meta http-equiv="Cache-Control" content="private">\n\t\t<meta http-equiv="Content-Type" content="text/html">\n\t\t<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">\n\t\t'
        if environment.getattr(l_page, 'cookies'):
            if 0: yield None
            yield u'\n\t\t<meta http-equiv="Set-Cookie" content="%s">\n\t\t' % (
                environment.getattr(l_page, 'cookies'), 
            )
        yield u'\n\n\t\t<!-- Info -->\n\t\t<meta name="author" content="">\n\t\t<meta name="publisher" content="">\n\t\t<meta name="keywords" content="">\n\t\t<meta name="copyright" content="">\n\t\t<meta name="description" content="">\n\t\t<meta name="application-name" content="AppTools">\n\t\t<meta name="google-site-verification" content="" />\n\t\t<meta name="robots" content="index, follow">\n\t\t<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=yes,height=device-height">\n\t\t<meta name="revisit-after" content="7 days">\n\t\t<!-- keyword,keyword,keyword -->\n\n\t\t'
        for event in context.blocks['opengraph'][0](context):
            yield event
        for event in context.blocks['mobile'][0](context):
            yield event
        yield u'<link rel="icon" href="//%s/favicon.ico" type="image/x-icon">\n\t\t<link rel="logo" href="%s">\n\t\t<link rel="shortcut icon" href="//%s/favicon.ico" type="image/x-icon">\n\n\t\t' % (
            context.call(environment.getattr(environment.getattr(environment.getattr(l_util, 'request'), 'headers'), 'get'), 'host'), 
            context.call(environment.getattr(l_asset, 'image'), 'branding', 'logo.svg'), 
            context.call(environment.getattr(environment.getattr(environment.getattr(l_util, 'request'), 'headers'), 'get'), 'host'), 
        )

    def block__tpl_root(context, environment=environment):
        l_page = context.resolve('page')
        if 0: yield None
        if (not environment.getattr(l_page, 'manifest')):
            if 0: yield None
            yield u'\n<!--[if IEMobile 7]><html class="no-js iem7" lang="en" prefix="og: http://ogp.me/ns#"><![endif]-->\n<!--[if (gt IEMobile 7)|!(IEMobile)]><!--><html class="no-js" lang="en" prefix="og: http://ogp.me/ns#"><!--<![endif]-->\n<!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en" prefix="og: http://ogp.me/ns#"> <![endif]-->\n<!--[if IE 7]>    <html class="no-js ie7 oldie" lang="en" prefix="og: http://ogp.me/ns#"> <![endif]-->\n<!--[if IE 8]>    <html class="no-js ie8 oldie" lang="en" prefix="og: http://ogp.me/ns#"> <![endif]-->\n<!--[if gt IE 8]><!--> <html class="no-js" lang="en" prefix="og: http://ogp.me/ns#"> <!--<![endif]-->\n'
        else:
            if 0: yield None
            yield u'\n<!--[if IEMobile 7]><html class="no-js iem7" lang="en" prefix="og: http://ogp.me/ns#" manifest="%s"><![endif]-->\n<!--[if (gt IEMobile 7)|!(IEMobile)]><!--><html class="no-js" lang="en" prefix="og: http://ogp.me/ns#" manifest="%s"><!--<![endif]-->\n<!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en" prefix="og: http://ogp.me/ns#" manifest="%s"> <![endif]-->\n<!--[if (IE 7)&!(IEMobile)]>    <html class="no-js ie7 oldie" lang="en" prefix="og: http://ogp.me/ns#" manifest="%s"> <![endif]-->\n<!--[if (IE 8)&!(IEMobile)]>    <html class="no-js ie8 oldie" lang="en" prefix="og: http://ogp.me/ns#" manifest="%s"> <![endif]-->\n<!--[if gt IE 8]><!--> <html class="no-js" lang="en" prefix="og: http://ogp.me/ns#" manifest="%s"> <!--<![endif]-->\n' % (
                environment.getattr(environment.getattr(l_page, 'manifest'), 'location'), 
                environment.getattr(environment.getattr(l_page, 'manifest'), 'location'), 
                environment.getattr(environment.getattr(l_page, 'manifest'), 'location'), 
                environment.getattr(environment.getattr(l_page, 'manifest'), 'location'), 
                environment.getattr(environment.getattr(l_page, 'manifest'), 'location'), 
                environment.getattr(environment.getattr(l_page, 'manifest'), 'location'), 
            )
        yield u'\n\n<head>\n\t'
        for event in context.blocks['head'][0](context):
            yield event
        yield u'\n</head>\n\n<body role="application" lang="en" translate="yes" dir="ltr">\n\n\t'
        for event in context.blocks['body'][0](context):
            yield event
        yield u'\n\n\t'
        template = environment.get_template('core/__south.html', '/source\\core\\__base.html')
        for event in template.root_render_func(template.new_context(context.parent, True, locals())):
            yield event
        yield u'\n\n</body>\n</html>'

    def block_postnorth(context, environment=environment):
        if 0: yield None

    blocks = {'prenorth': block_prenorth, 'body': block_body, 'head': block_head, 'north': block_north, 'title': block_title, 'mobile': block_mobile, 'opengraph': block_opengraph, 'meta': block_meta, '_tpl_root': block__tpl_root, 'postnorth': block_postnorth}
    debug_info = '2=9&93=12&105=15&20=19&21=22&93=24&94=26&97=28&99=31&94=35&95=37&99=41&72=45&73=50&80=53&81=54&82=55&83=56&46=59&52=63&21=66&29=72&30=75&46=78&72=80&87=83&88=84&89=85&2=88&3=91&11=97&12=98&13=99&14=100&15=101&16=102&20=105&105=108&108=111&97=116'
    return locals()