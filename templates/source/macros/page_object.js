{%- macro build_page_object(services, config, page) -%}

$(document).ready(function (){
{% block platform_statement %}
{%- if util.config.debug or api.users.is_current_user_admin() -%}
	{% block tpl_debug_on %}
	$.apptools.dev.setDebug({logging: true, eventlog: true, verbose: true});
	{% endblock %}
{%- else -%}
	{% block tpl_debug_off %}
	$.apptools.dev.setDebug({logging: false, eventlog: false, verbose: false});
	{% endblock %}
{%- endif -%}
	$.apptools.sys.platform = { {%- block platform_statement_content -%}
		name: '{{ util.config.project.name }}', version: '{{ sys.version }}', origindc: '{{ util.appengine.datacenter }}', instance: '{{ util.appengine.instance }}'
		{%- if api.users.is_current_user_admin() -%},
		debug: {% autoescape off %}{{ util.converters.json.dumps(util.config.debug) }}{% endautoescape %}
		{%- endif -%}
	{%- endblock -%}};
{%- endblock -%}
{%- block userobj -%}
{% if userapi != none %}
	$.apptools.user.setUserInfo({
		{%- if api.users.get_current_user() != none -%}
			{%- set userobj = api.users.get_current_user() -%}
			current_user: {
				nickname: "{{ userobj.nickname() }}",
				email: "{{ userobj.email() }}"
			}, is_user_admin: {{ util.converters.json.dumps(api.users.is_current_user_admin()) }}
		{%- else -%}
			current_user: null, is_user_admin: false
		{%- endif -%}
	});
{% endif %}
{%- endblock -%}

{%- if services -%}
	$.apptools.api.rpc.factory([{%- for service, action, cfg, opts in services -%}
		{name: '{{ service }}', base_uri: '{{ action }}', methods: [{%- for i, method in enumerate(cfg.methods) -%}'{{ method }}'{%- if i != (len(cfg.methods) - 1) %},{%- endif -%}{%- endfor -%}], config: {%- autoescape false -%}{{ util.converters.json.dumps(opts) }}{%- endautoescape -%}}{%- if not loop.last -%},{%- endif -%}
{%- endfor -%}]);
{%- endif -%}

{% block platform_go %}
	_PLATFORM_VERSION = "{{ sys.version }}";
	$.apptools.events.trigger('API_READY');
{% endblock %}

{%- if page.open_channel -%}
{% if page.channel_token %}
	$.apptools.push.channel.establish("{{ page.channel_token }}").listen();
{% endif %}
{% endif %}
});

{%- endmacro -%}
