{%- macro google_analytics_async(config) -%}

	{%- if config.enable -%}
	  var _gaq = _gaq || [];
	  _gaq.push(['_setAccount', '{{ config.account_id }}']);
	  _gaq.push(['_trackPageview']);

	  (function() {
	    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	  })();
	{%- endif -%}

{%- endmacro -%}