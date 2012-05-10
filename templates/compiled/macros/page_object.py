from __future__ import division
from jinja2.runtime import LoopContext, TemplateReference, Macro, Markup, TemplateRuntimeError, missing, concat, escape, markup_join, unicode_join, to_string, identity, TemplateNotFound
def run(environment):
    name = '/source\\macros\\page_object.js'

    def root(context, environment=environment):
        if 0: yield None
        def macro(l_services, l_config, l_page):
            t_1 = []
            l_sys = context.resolve('sys')
            l_null = context.resolve('null')
            pass
            t_1.append(
                u'$(document).ready(function (){\n\n\t', 
            )
            for event in context.blocks['platform_statement'][0](context):
                t_1.append(event)
            t_1.append(
                u'\n\n\t', 
            )
            if l_services != l_null:
                pass
                l_action = l_cfg = l_opts = l_service = missing
                l_enumerate = context.resolve('enumerate')
                for (l_service, l_action, l_cfg, l_opts) in l_services:
                    pass
                    t_1.extend((
                        u"$.apptools.api.rpc.factory('", 
                        to_string(l_service), 
                        u"', '", 
                        to_string(l_action), 
                        u"', [", 
                    ))
                    l_i = l_method = missing
                    l_len = context.resolve('len')
                    for (l_i, l_method) in context.call(l_enumerate, environment.getattr(l_cfg, 'methods')):
                        pass
                        t_1.extend((
                            u"'", 
                            to_string(l_method), 
                            u"'", 
                        ))
                        if l_i != (context.call(l_len, environment.getattr(l_cfg, 'methods')) - 1):
                            pass
                            t_1.append(
                                u',', 
                            )
                    l_i = l_method = missing
                    t_1.append(
                        u'],', 
                    )
                    l_util = context.resolve('util')
                    pass
                    t_2 = context.eval_ctx.save()
                    context.eval_ctx.autoescape = False
                    t_1.append(
                        to_string(context.call(environment.getattr(environment.getattr(environment.getattr(l_util, 'converters'), 'json'), 'dumps'), l_opts)), 
                    )
                    context.eval_ctx.revert(t_2)
                    t_1.append(
                        u');', 
                    )
                l_action = l_cfg = l_opts = l_service = missing
            t_1.append(
                u'\n\n\t', 
            )
            if environment.getattr(l_page, 'open_channel'):
                pass
                t_1.append(
                    u'\n\t', 
                )
                if environment.getattr(l_page, 'channel_token'):
                    pass
                    t_1.extend((
                        u'\n\t\t$.apptools.push.channel.establish("', 
                        to_string(environment.getattr(l_page, 'channel_token')), 
                        u'").listen();\n\t', 
                    ))
                t_1.append(
                    u'\n\t', 
                )
            t_1.append(
                u'\n\n\t', 
            )
            for event in context.blocks['userobj'][0](context):
                t_1.append(event)
            t_1.extend((
                u'\n\n\t_PLATFORM_VERSION = "', 
                to_string(environment.getattr(l_sys, 'version')), 
                u'";\n\t$.apptools.events.trigger(\'API_READY\');\n\n});', 
            ))
            return concat(t_1)
        context.exported_vars.add('build_page_object')
        context.vars['build_page_object'] = l_build_page_object = Macro(environment, macro, 'build_page_object', ('services', 'config', 'page'), (), False, False, False)

    def block_platform_statement(context, environment=environment):
        l_util = context.resolve('util')
        l_sys = context.resolve('sys')
        l_api = context.resolve('api')
        if 0: yield None
        yield u"\n\t\t$.apptools.sys.platform = {\n\t\t\tname: '%s', version: '%s', origindc: '%s', instance: '%s'," % (
            environment.getattr(environment.getattr(environment.getattr(l_util, 'config'), 'project'), 'name'), 
            environment.getattr(l_sys, 'version'), 
            environment.getattr(environment.getattr(l_util, 'appengine'), 'datacenter'), 
            environment.getattr(environment.getattr(l_util, 'appengine'), 'instance'), 
        )
        if context.call(environment.getattr(environment.getattr(l_api, 'users'), 'is_current_user_admin')):
            if 0: yield None
            yield u'debug: '
            l_off = context.resolve('off')
            if 0: yield None
            t_3 = context.eval_ctx.save()
            context.eval_ctx.autoescape = l_off
            yield (context.eval_ctx.autoescape and escape or to_string)(context.call(environment.getattr(environment.getattr(environment.getattr(l_util, 'converters'), 'json'), 'dumps'), environment.getattr(environment.getattr(l_util, 'config'), 'debug')))
            context.eval_ctx.revert(t_3)
        yield u'};'
        if (environment.getattr(environment.getattr(l_util, 'config'), 'debug') or context.call(environment.getattr(environment.getattr(l_api, 'users'), 'is_current_user_admin'))):
            if 0: yield None
            yield u'$.apptools.dev.setDebug({logging: true, eventlog: true, verbose: true});'
        else:
            if 0: yield None
            yield u'$.apptools.dev.setDebug({logging: false, eventlog: false, verbose: false});'

    def block_userobj(context, environment=environment):
        l_util = context.resolve('util')
        l_api = context.resolve('api')
        l_userapi = context.resolve('userapi')
        l_userobj = context.resolve('userobj')
        if 0: yield None
        if l_userapi != None:
            if 0: yield None
            yield u'$.apptools.user.setUserInfo({'
            if context.call(environment.getattr(environment.getattr(l_api, 'users'), 'get_current_user')) != None:
                if 0: yield None
                l_userobj = context.call(environment.getattr(environment.getattr(l_api, 'users'), 'get_current_user'))
                yield u'current_user: {\n\t\t\t\t\t\tnickname: "%s",\n\t\t\t\t\t\temail: "%s"\n\t\t\t\t\t},\n\t\t\t\t\tis_user_admin: %s' % (
                    context.call(environment.getattr(l_userobj, 'nickname')), 
                    context.call(environment.getattr(l_userobj, 'email')), 
                    context.call(environment.getattr(environment.getattr(environment.getattr(l_util, 'converters'), 'json'), 'dumps'), context.call(environment.getattr(environment.getattr(l_api, 'users'), 'is_current_user_admin'))), 
                )
            else:
                if 0: yield None
                yield u'current_user: null,\n\t\t\t\t\tis_user_admin: false'
            yield u'});'

    blocks = {'platform_statement': block_platform_statement, 'userobj': block_userobj}
    debug_info = '1=8&5=16&19=21&20=25&21=29&25=67&26=72&27=76&31=85&52=89&5=96&7=102&8=107&9=114&12=117&31=124&32=130&36=133&37=135&39=137&40=138&42=139'
    return locals()