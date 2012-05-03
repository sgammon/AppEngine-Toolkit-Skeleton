(function() {
  var AppException, AppTools, AppToolsCollection, AppToolsException, AppToolsModel, AppToolsRouter, AppToolsView, BlogManagerAPI, ContentManagerAPI, CoreAPI, CoreAdminAPI, CoreAgentAPI, CoreDevAPI, CoreDispatchAPI, CoreEventsAPI, CoreException, CoreInterface, CoreModelAPI, CoreObject, CorePushAPI, CoreRPCAPI, CoreRenderAPI, CoreStorageAPI, CoreUserAPI, CoreWidget, CoreWidgetAPI, Expand, Find, Milk, PageManagerAPI, Parse, PushDriver, QueryDriver, RPCAPI, RPCDriver, RPCRequest, RPCResponse, RenderDriver, SiteManagerAPI, StorageDriver, TemplateCache,
    __slice = Array.prototype.slice,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.__apptools_preinit = {};

  TemplateCache = {};

  Find = function(name, stack, value) {
    var ctx, i, part, parts, _i, _len, _ref, _ref2;
    if (value == null) value = null;
    if (name === '.') return stack[stack.length - 1];
    _ref = name.split(/\./), name = _ref[0], parts = 2 <= _ref.length ? __slice.call(_ref, 1) : [];
    for (i = _ref2 = stack.length - 1; _ref2 <= -1 ? i < -1 : i > -1; _ref2 <= -1 ? i++ : i--) {
      if (stack[i] == null) continue;
      if (!(typeof stack[i] === 'object' && name in (ctx = stack[i]))) continue;
      value = ctx[name];
      break;
    }
    for (_i = 0, _len = parts.length; _i < _len; _i++) {
      part = parts[_i];
      value = Find(part, [value]);
    }
    if (value instanceof Function) {
      value = (function(value) {
        return function() {
          var val;
          val = value.apply(ctx, arguments);
          return (val instanceof Function) && val.apply(null, arguments) || val;
        };
      })(value);
    }
    return value;
  };

  Expand = function() {
    var args, f, obj, tmpl;
    obj = arguments[0], tmpl = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    return ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = tmpl.length; _i < _len; _i++) {
        f = tmpl[_i];
        _results.push(f.call.apply(f, [obj].concat(__slice.call(args))));
      }
      return _results;
    })()).join('');
  };

  Parse = function(template, delimiters, section) {
    var BuildRegex, buffer, buildInterpolationTag, buildInvertedSectionTag, buildPartialTag, buildSectionTag, cache, content, contentEnd, d, error, escape, isStandalone, match, name, parseError, pos, sectionInfo, tag, tagPattern, tmpl, type, whitespace, _name, _ref, _ref2, _ref3;
    if (delimiters == null) delimiters = ['{{', '}}'];
    if (section == null) section = null;
    cache = (TemplateCache[_name = delimiters.join(' ')] || (TemplateCache[_name] = {}));
    if (template in cache) return cache[template];
    buffer = [];
    BuildRegex = function() {
      var tagClose, tagOpen;
      tagOpen = delimiters[0], tagClose = delimiters[1];
      return RegExp("([\\s\\S]*?)([" + ' ' + "\\t]*)(?:" + tagOpen + "\\s*(?:(!)\\s*([\\s\\S]+?)|(=)\\s*([\\s\\S]+?)\\s*=|({)\\s*(\\w[\\S]*?)\\s*}|([^0-9a-zA-Z._!={]?)\\s*([\\w.][\\S]*?))\\s*" + tagClose + ")", "gm");
    };
    tagPattern = BuildRegex();
    tagPattern.lastIndex = pos = (section || {
      start: 0
    }).start;
    parseError = function(pos, msg) {
      var carets, e, endOfLine, error, indent, key, lastLine, lastTag, lineNo, parsedLines, tagStart;
      (endOfLine = /$/gm).lastIndex = pos;
      endOfLine.exec(template);
      parsedLines = template.substr(0, pos).split('\n');
      lineNo = parsedLines.length;
      lastLine = parsedLines[lineNo - 1];
      tagStart = contentEnd + whitespace.length;
      lastTag = template.substr(tagStart + 1, pos - tagStart - 1);
      indent = new Array(lastLine.length - lastTag.length + 1).join(' ');
      carets = new Array(lastTag.length + 1).join('^');
      lastLine = lastLine + template.substr(pos, endOfLine.lastIndex - pos);
      error = new Error();
      for (key in e = {
        "message": "" + msg + "\n\nLine " + lineNo + ":\n" + lastLine + "\n" + indent + carets,
        "error": msg,
        "line": lineNo,
        "char": indent.length,
        "tag": lastTag
      }) {
        error[key] = e[key];
      }
      return error;
    };
    while (match = tagPattern.exec(template)) {
      _ref = match.slice(1, 3), content = _ref[0], whitespace = _ref[1];
      type = match[3] || match[5] || match[7] || match[9];
      tag = match[4] || match[6] || match[8] || match[10];
      contentEnd = (pos + content.length) - 1;
      pos = tagPattern.lastIndex;
      isStandalone = (contentEnd === -1 || template.charAt(contentEnd) === '\n') && ((_ref2 = template.charAt(pos)) === (void 0) || _ref2 === '' || _ref2 === '\r' || _ref2 === '\n');
      if (content) {
        buffer.push((function(content) {
          return function() {
            return content;
          };
        })(content));
      }
      if (isStandalone && (type !== '' && type !== '&' && type !== '{')) {
        if (template.charAt(pos) === '\r') pos += 1;
        if (template.charAt(pos) === '\n') pos += 1;
      } else if (whitespace) {
        buffer.push((function(whitespace) {
          return function() {
            return whitespace;
          };
        })(whitespace));
        contentEnd += whitespace.length;
        whitespace = '';
      }
      switch (type) {
        case '!':
          break;
        case '':
        case '&':
        case '{':
          buildInterpolationTag = function(name, is_unescaped) {
            return function(context) {
              var value, _ref3;
              if ((value = (_ref3 = Find(name, context)) != null ? _ref3 : '') instanceof Function) {
                value = Expand.apply(null, [this, Parse("" + (value()))].concat(__slice.call(arguments)));
              }
              if (!is_unescaped) value = this.escape("" + value);
              return "" + value;
            };
          };
          buffer.push(buildInterpolationTag(tag, type));
          break;
        case '>':
          buildPartialTag = function(name, indentation) {
            return function(context, partials) {
              var partial;
              partial = partials(name).toString();
              if (indentation) partial = partial.replace(/^(?=.)/gm, indentation);
              return Expand.apply(null, [this, Parse(partial)].concat(__slice.call(arguments)));
            };
          };
          buffer.push(buildPartialTag(tag, whitespace));
          break;
        case '#':
        case '^':
          sectionInfo = {
            name: tag,
            start: pos,
            error: parseError(tagPattern.lastIndex, "Unclosed section '" + tag + "'!")
          };
          _ref3 = Parse(template, delimiters, sectionInfo), tmpl = _ref3[0], pos = _ref3[1];
          sectionInfo['#'] = buildSectionTag = function(name, delims, raw) {
            return function(context) {
              var parsed, result, v, value;
              value = Find(name, context) || [];
              tmpl = value instanceof Function ? value(raw) : raw;
              if (!(value instanceof Array)) value = [value];
              parsed = Parse(tmpl || '', delims);
              context.push(value);
              result = (function() {
                var _i, _len, _results;
                _results = [];
                for (_i = 0, _len = value.length; _i < _len; _i++) {
                  v = value[_i];
                  context[context.length - 1] = v;
                  _results.push(Expand.apply(null, [this, parsed].concat(__slice.call(arguments))));
                }
                return _results;
              }).apply(this, arguments);
              context.pop();
              return result.join('');
            };
          };
          sectionInfo['^'] = buildInvertedSectionTag = function(name, delims, raw) {
            return function(context) {
              var value;
              value = Find(name, context) || [];
              if (!(value instanceof Array)) value = [1];
              value = value.length === 0 ? Parse(raw, delims) : [];
              return Expand.apply(null, [this, value].concat(__slice.call(arguments)));
            };
          };
          buffer.push(sectionInfo[type](tag, delimiters, tmpl));
          break;
        case '/':
          if (section == null) {
            error = "End Section tag '" + tag + "' found, but not in section!";
          } else if (tag !== (name = section.name)) {
            error = "End Section tag closes '" + tag + "'; expected '" + name + "'!";
          }
          if (error) throw parseError(tagPattern.lastIndex, error);
          template = template.slice(section.start, contentEnd + 1 || 9e9);
          cache[template] = buffer;
          return [template, pos];
        case '=':
          if ((delimiters = tag.split(/\s+/)).length !== 2) {
            error = "Set Delimiters tags should have two and only two values!";
          }
          if (error) throw parseError(tagPattern.lastIndex, error);
          escape = /[-[\]{}()*+?.,\\^$|#]/g;
          delimiters = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = delimiters.length; _i < _len; _i++) {
              d = delimiters[_i];
              _results.push(d.replace(escape, "\\$&"));
            }
            return _results;
          })();
          tagPattern = BuildRegex();
          break;
        default:
          throw parseError(tagPattern.lastIndex, "Unknown tag type -- " + type);
      }
      tagPattern.lastIndex = pos != null ? pos : template.length;
    }
    if (section != null) throw section.error;
    if (template.length !== pos) {
      buffer.push(function() {
        return template.slice(pos);
      });
    }
    return cache[template] = buffer;
  };

  Milk = {
    VERSION: '1.2.0',
    helpers: [],
    partials: null,
    escape: function(value) {
      var entities;
      entities = {
        '&': 'amp',
        '"': 'quot',
        '<': 'lt',
        '>': 'gt'
      };
      return value.replace(/[&"<>]/g, function(ch) {
        return "&" + entities[ch] + ";";
      });
    },
    render: function(template, data, partials) {
      var context;
      if (partials == null) partials = null;
      if (!((partials || (partials = this.partials || {})) instanceof Function)) {
        partials = (function(partials) {
          return function(name) {
            if (!(name in partials)) throw "Unknown partial '" + name + "'!";
            return Find(name, [partials]);
          };
        })(partials);
      }
      context = this.helpers instanceof Array ? this.helpers : [this.helpers];
      return Expand(this, Parse(template), context.concat([data]), partials);
    }
  };

  if (this.__apptools_preinit != null) {
    this.__apptools_preinit.abstract_base_classes = [];
    this.__apptools_preinit.deferred_core_modules = [];
    this.__apptools_preinit.abstract_feature_interfaces = [];
    this.__apptools_preinit.deferred_library_integrations = [];
  } else {
    this.__apptools_preinit = {
      abstract_base_classes: [],
      deferred_core_modules: [],
      abstract_feature_interfaces: [],
      deferred_library_integrations: []
    };
  }

  CoreAPI = (function() {

    function CoreAPI() {}

    return CoreAPI;

  })();

  this.__apptools_preinit.abstract_base_classes.push(CoreAPI);

  CoreObject = (function() {

    function CoreObject() {}

    return CoreObject;

  })();

  this.__apptools_preinit.abstract_base_classes.push(CoreObject);

  CoreInterface = (function() {

    function CoreInterface() {}

    return CoreInterface;

  })();

  this.__apptools_preinit.abstract_base_classes.push(CoreInterface);

  CoreException = (function(_super) {

    __extends(CoreException, _super);

    function CoreException(module, message, context) {
      this.module = module;
      this.message = message;
      this.context = context;
    }

    CoreException.prototype.toString = function() {
      return '[' + this.module + '] CoreException: ' + this.message;
    };

    return CoreException;

  })(Error);

  this.__apptools_preinit.abstract_base_classes.push(CoreException);

  AppException = (function(_super) {

    __extends(AppException, _super);

    function AppException() {
      AppException.__super__.constructor.apply(this, arguments);
    }

    AppException.prototype.toString = function() {
      return '[' + this.module + '] AppException: ' + this.message;
    };

    return AppException;

  })(CoreException);

  AppToolsException = (function(_super) {

    __extends(AppToolsException, _super);

    function AppToolsException() {
      AppToolsException.__super__.constructor.apply(this, arguments);
    }

    AppToolsException.prototype.toString = function() {
      return '[' + this.module + '] AppToolsException: ' + this.message;
    };

    return AppToolsException;

  })(CoreException);

  this.__apptools_preinit.abstract_base_classes.push(AppException);

  this.__apptools_preinit.abstract_base_classes.push(AppToolsException);

  if (this.Backbone != null) {
    AppToolsView = (function(_super) {

      __extends(AppToolsView, _super);

      function AppToolsView() {
        AppToolsView.__super__.constructor.apply(this, arguments);
      }

      return AppToolsView;

    })(Backbone.View);
    AppToolsModel = (function(_super) {

      __extends(AppToolsModel, _super);

      function AppToolsModel() {
        AppToolsModel.__super__.constructor.apply(this, arguments);
      }

      return AppToolsModel;

    })(Backbone.Model);
    AppToolsRouter = (function(_super) {

      __extends(AppToolsRouter, _super);

      function AppToolsRouter() {
        AppToolsRouter.__super__.constructor.apply(this, arguments);
      }

      return AppToolsRouter;

    })(Backbone.Router);
    AppToolsCollection = (function(_super) {

      __extends(AppToolsCollection, _super);

      function AppToolsCollection() {
        AppToolsCollection.__super__.constructor.apply(this, arguments);
      }

      return AppToolsCollection;

    })(Backbone.Collection);
  } else {
    AppToolsView = (function() {

      function AppToolsView() {}

      return AppToolsView;

    })();
    AppToolsModel = (function() {

      function AppToolsModel() {}

      return AppToolsModel;

    })();
    AppToolsRouter = (function() {

      function AppToolsRouter() {}

      return AppToolsRouter;

    })();
    AppToolsCollection = (function() {

      function AppToolsCollection() {}

      return AppToolsCollection;

    })();
  }

  this.__apptools_preinit.abstract_base_classes.push(AppToolsView);

  this.__apptools_preinit.abstract_base_classes.push(AppToolsModel);

  this.__apptools_preinit.abstract_base_classes.push(AppToolsRouter);

  this.__apptools_preinit.abstract_base_classes.push(AppToolsCollection);

  CoreDevAPI = (function(_super) {

    __extends(CoreDevAPI, _super);

    CoreDevAPI.mount = 'dev';

    CoreDevAPI.events = [];

    function CoreDevAPI(apptools, window) {
      var _this = this;
      this.config = {};
      this.environment = {};
      this.performance = {};
      this.debug = {
        logging: true,
        eventlog: true,
        verbose: true,
        serverside: false
      };
      this.setDebug = function(debug) {
        _this.debug = debug;
        return _this._sendLog("[CoreDev] Debug has been set.", _this.debug);
      };
      this._sendLog = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return console.log.apply(console, args);
      };
      this.log = function() {
        var context, message, module;
        module = arguments[0], message = arguments[1], context = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        if (!(context != null)) context = '{no context}';
        if (_this.debug.logging === true) {
          _this._sendLog.apply(_this, ["[" + module + "] INFO: " + message].concat(__slice.call(context)));
        }
      };
      this.warning = this.warn = function() {
        var context, message, module;
        module = arguments[0], message = arguments[1], context = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        if (!(context != null)) context = '{no context}';
        if (_this.debug.logging === true) {
          _this._sendLog.apply(_this, ["[" + module + "] WARNING: " + message].concat(__slice.call(context)));
        }
      };
      this.error = function() {
        var context, message, module;
        module = arguments[0], message = arguments[1], context = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        if (_this.debug.logging === true) {
          _this._sendLog.apply(_this, ["[" + module + "] ERROR: " + message].concat(__slice.call(context)));
        }
      };
      this.verbose = function() {
        var context, message, module;
        module = arguments[0], message = arguments[1], context = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        if (_this.debug.verbose === true) {
          _this._sendLog.apply(_this, ["[" + module + "] DEBUG: " + message].concat(__slice.call(context)));
        }
      };
      this.exception = this.critical = function() {
        var context, exception, message, module;
        module = arguments[0], message = arguments[1], exception = arguments[2], context = 4 <= arguments.length ? __slice.call(arguments, 3) : [];
        if (exception == null) exception = window.AppToolsException;
        _this._sendLog("A critical error or unhandled exception occurred.");
        _this._sendLog.apply(_this, ["[" + module + "] CRITICAL: " + message].concat(__slice.call(context)));
        throw new exception(module, message, context);
      };
    }

    return CoreDevAPI;

  })(CoreAPI);

  this.__apptools_preinit.abstract_base_classes.push(CoreDevAPI);

  CoreModelAPI = (function(_super) {

    __extends(CoreModelAPI, _super);

    CoreModelAPI.mount = 'model';

    CoreModelAPI.events = [];

    function CoreModelAPI(apptools, window) {}

    return CoreModelAPI;

  })(CoreAPI);

  this.__apptools_preinit.abstract_base_classes.push(CoreModelAPI);

  CoreEventsAPI = (function(_super) {

    __extends(CoreEventsAPI, _super);

    CoreEventsAPI.mount = 'events';

    CoreEventsAPI.events = [];

    function CoreEventsAPI(apptools, window) {
      var _this = this;
      this.registry = [];
      this.callchain = {};
      this.history = [];
      this.fire = this.trigger = function() {
        var args, bridge, callback_directive, event, event_bridges, hook_error_count, hook_exec_count, result, touched_events, _i, _j, _len, _len2, _ref;
        event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        apptools.dev.verbose('Events', 'Triggered event:', event, args, _this.callchain[event]);
        if (__indexOf.call(_this.registry, event) >= 0) {
          hook_exec_count = 0;
          hook_error_count = 0;
          event_bridges = [];
          touched_events = [];
          touched_events.push(event);
          _ref = _this.callchain[event].hooks;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            callback_directive = _ref[_i];
            try {
              if (callback_directive.once === true && callback_directive.has_run === true) {
                continue;
              } else if ((callback_directive.bridge != null) === false) {
                result = callback_directive.fn.apply(callback_directive, args);
                hook_exec_count++;
                _this.history.push({
                  event: event,
                  callback: callback_directive,
                  args: args,
                  result: result
                });
                callback_directive.has_run = true;
              } else if (callback_directive.bridge === true) {
                event_bridges.push({
                  event: callback_directive.event,
                  args: args
                });
              }
            } catch (error) {
              hook_error_count++;
              _this.history.push({
                event: event,
                callback: callback_directive,
                args: args,
                error: error
              });
            }
          }
          for (_j = 0, _len2 = event_bridges.length; _j < _len2; _j++) {
            bridge = event_bridges[_j];
            touched_events.push(bridge.event);
            _this.trigger.apply(_this, [bridge.event].concat(__slice.call(bridge.args)));
          }
          return {
            events: touched_events,
            executed: hook_exec_count,
            errors: hook_error_count
          };
        } else {
          return false;
        }
      };
      this.create = this.register = function(names) {
        var name, _i, _len;
        if (!(names instanceof Array)) names = [names];
        for (_i = 0, _len = names.length; _i < _len; _i++) {
          name = names[_i];
          _this.registry.push.apply(_this.registry, names);
          _this.callchain[name] = {
            hooks: []
          };
        }
        apptools.dev.verbose('Events', 'Registered events:', {
          count: names.length,
          events: names
        });
        return true;
      };
      this.on = this.upon = this.when = this.hook = function(event, callback, once) {
        if (once == null) once = false;
        if (__indexOf.call(_this.registry, event) < 0) {
          apptools.dev.warning('Events', '');
          _this.register(event);
        }
        _this.callchain[event].hooks.push({
          fn: callback,
          once: once,
          has_run: false,
          bridge: false
        });
        apptools.dev.verbose('Events', 'Hook registered on event.', event);
        return true;
      };
      this.delegate = this.bridge = function(from_events, to_events) {
        var source_ev, target_ev, _i, _len, _results;
        if (typeof to_events === 'string') to_events = [to_events];
        if (typeof from_events === 'string') from_events = [from_events];
        _results = [];
        for (_i = 0, _len = from_events.length; _i < _len; _i++) {
          source_ev = from_events[_i];
          _results.push((function() {
            var _j, _len2, _results2;
            _results2 = [];
            for (_j = 0, _len2 = to_events.length; _j < _len2; _j++) {
              target_ev = to_events[_j];
              apptools.dev.verbose('Events', 'Bridging events:', source_ev, '->', target_ev);
              if (!(this.callchain[source_ev] != null)) {
                apptools.dev.warn('Events', 'Bridging from undefined source event:', source_ev);
                this.register(source_ev);
              }
              _results2.push(this.callchain[source_ev].hooks.push({
                event: target_ev,
                bridge: true
              }));
            }
            return _results2;
          }).call(_this));
        }
        return _results;
      };
    }

    return CoreEventsAPI;

  })(CoreAPI);

  this.__apptools_preinit.abstract_base_classes.push(CoreEventsAPI);

  CoreAgentAPI = (function(_super) {

    __extends(CoreAgentAPI, _super);

    CoreAgentAPI.mount = 'agent';

    CoreAgentAPI.events = ['UA_DISCOVER'];

    function CoreAgentAPI(apptools, window) {
      this._data = {};
      this.platform = {};
      this.capabilities = {};
      if (apptools.lib.modernizr != null) {
        this.capabilities = apptools.lib.modernizr;
      }
      this.capabilities.simple = {};
      this._data = {
        browsers: [
          {
            string: navigator.userAgent,
            subString: "Chrome",
            identity: "Chrome"
          }, {
            string: navigator.userAgent,
            subString: "OmniWeb",
            versionSearch: "OmniWeb/",
            identity: "OmniWeb"
          }, {
            string: navigator.vendor,
            subString: "Apple",
            identity: "Safari",
            versionSearch: "Version"
          }, {
            prop: window.opera,
            identity: "Opera"
          }, {
            string: navigator.vendor,
            subString: "iCab",
            identity: "iCab"
          }, {
            string: navigator.vendor,
            subString: "KDE",
            identity: "Konqueror"
          }, {
            string: navigator.userAgent,
            subString: "Firefox",
            identity: "Firefox"
          }, {
            string: navigator.vendor,
            subString: "Camino",
            identity: "Camino"
          }, {
            string: navigator.userAgent,
            subString: "Netscape",
            identity: "Netscape"
          }, {
            string: navigator.userAgent,
            subString: "MSIE",
            identity: "Explorer",
            versionSearch: "MSIE"
          }, {
            string: navigator.userAgent,
            subString: "Gecko",
            identity: "Mozilla",
            versionSearch: "rv"
          }, {
            string: navigator.userAgent,
            subString: "Mozilla",
            identity: "Netscape",
            versionSearch: "Mozilla"
          }
        ],
        os: [
          {
            string: navigator.platform,
            subString: "Win",
            identity: "Windows"
          }, {
            string: navigator.platform,
            subString: "Mac",
            identity: "Mac"
          }, {
            string: navigator.userAgent,
            subString: "iPhone",
            identity: "iPhone/iPod"
          }, {
            string: navigator.platform,
            subString: "Linux",
            identity: "Linux"
          }
        ]
      };
    }

    CoreAgentAPI.prototype._makeMatch = function(data) {
      var prop, string, value, _i, _len;
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        value = data[_i];
        string = value.string;
        prop = value.prop;
        this._data.versionSearchString = value.versionSearch || value.identity;
        if (string !== null) {
          if (value.string.indexOf(value.subString) !== -1) return value.identity;
        } else if (prop) {
          return value.identity;
        }
      }
    };

    CoreAgentAPI.prototype._makeVersion = function(dataString) {
      var index;
      index = dataString.indexOf(this._data.versionSearchString);
      if (index === -1) {} else {
        return parseFloat(dataString.substring(index + this._data.versionSearchString.length + 1));
      }
    };

    CoreAgentAPI.prototype.discover = function() {
      var browser, mobile, os, type, version;
      browser = this._makeMatch(this._data.browsers) || "unknown";
      version = this._makeVersion(navigator.userAgent) || this._makeVersion(navigator.appVersion) || "unknown";
      os = this._makeMatch(this._data.os) || "unknown";
      if (browser === 'iPod/iPhone' || browser === 'Android') {
        type = 'mobile';
        mobile = false;
      }
      this.platform = {
        os: os,
        type: type,
        vendor: navigator.vendor,
        product: navigator.product,
        browser: browser,
        version: version,
        flags: {
          online: navigator.onLine || true,
          mobile: mobile,
          webkit: $.browser.webkit,
          msie: $.browser.msie,
          opera: $.browser.opera,
          mozilla: $.browser.mozilla
        }
      };
      this.capabilities.simple.cookies = navigator.cookieEnabled;
      if (window.jQuery != null) {
        return this.capabilities.simple.ajax = $.support.ajax;
      }
    };

    return CoreAgentAPI;

  })(CoreAPI);

  this.__apptools_preinit.abstract_base_classes.push(CoreAgentAPI);

  CoreDispatchAPI = (function(_super) {

    __extends(CoreDispatchAPI, _super);

    CoreDispatchAPI.mount = 'dispatch';

    CoreDispatchAPI.events = [];

    function CoreDispatchAPI(apptools, window) {
      var _this = this;
      this.state = {
        opened: false,
        receiving: false,
        error: false,
        history: {
          errors: [],
          received: []
        },
        pending: {},
        complete: {}
      };
      this.init = function() {
        _this.state.opened = true;
        return apptools.dev.verbose('Dispatch', 'Dispatch startup signal received.');
      };
      this.expect = function(id, request, xhr) {
        _this.state.pending[id] = {
          request: request,
          callbacks: callbacks,
          xhr: xhr
        };
        return apptools.dev.verbose('Dispatch', 'Received EXPECT signal.', id, request, callbacks, xhr);
      };
      this.receive = function(raw_response) {
        var context, response, _base, _base2, _base3;
        try {
          response = JSON.parse(raw_response.data);
        } catch (e) {
          response = raw_response.data;
        }
        apptools.dev.verbose('Dispatch', 'Parsed async message.', response);
        _this.state.history.received.push(raw_response);
        if (response.status === 'ok') {
          apptools.dev.verbose('Dispatch', 'Triggering deferred success callback.');
          _this.state.complete[response.id] = _this.state.pending[response.id];
          _this.state.complete[response.id].response = response;
          delete _this.state.pending[response.id];
          apptools.dev.log('RPC', 'Success', raw_response.data, response.status, _this.state.complete[response.id].xhr);
          apptools.api.rpc.lastResponse = raw_response.data;
          apptools.api.rpc.history[response.id].xhr = _this.state.complete[response.id].xhr;
          apptools.api.rpc.history[response.id].status = response.status;
          apptools.api.rpc.history[response.id].response = raw_response.data;
          context = {
            xhr: _this.state.complete[response.id].xhr,
            status: response.status,
            data: raw_response.data
          };
          apptools.events.trigger('RPC_SUCCESS', context);
          return typeof (_base = _this.state.complete[response.id].callbacks).success === "function" ? _base.success(response.response.content) : void 0;
        } else if (response.status === 'notify') {
          apptools.dev.verbose('Dispatch', 'Received NOTIFY signal.');
          return typeof (_base2 = _this.state.pending[response.id].callbacks).notify === "function" ? _base2.notify(response.response.content) : void 0;
        } else {
          apptools.dev.error('Dispatch', 'Userland deferred task error. Calling error callback.', response);
          return typeof (_base3 = _this.state.pending[response.id].callbacks).error === "function" ? _base3.error(response.content) : void 0;
        }
      };
      this.error = function(error) {
        _this.state.error = true;
        _this.history.errors.push(error);
        return apptools.dev.error('Dispatch', 'Dispatch error state triggered.', error);
      };
      this.close = function() {
        _this.state.opened = false;
        _this.state.receiving = false;
        return apptools.dev.verbose('Dispatch', 'Dispatch shutdown signal received.');
      };
    }

    return CoreDispatchAPI;

  })(CoreAPI);

  this.__apptools_preinit.abstract_base_classes.push(CoreDispatchAPI);

  CoreStorageAPI = (function(_super) {

    __extends(CoreStorageAPI, _super);

    CoreStorageAPI.mount = 'storage';

    CoreStorageAPI.events = ['STORAGE_INIT', 'STORAGE_READY', 'STORAGE_ERROR', 'STORAGE_ACTIVITY', 'STORAGE_READ', 'STORAGE_WRITE', 'STORAGE_DELETE', 'COLLECTION_SCAN', 'COLLECTION_CREATE', 'COLLECTION_DESTROY', 'COLLECTION_UPDATE', 'COLLECTION_SYNC'];

    function CoreStorageAPI(apptools, window) {
      var _this = this;
      this._state = {
        runtime: {
          index: {
            key_read_tally: {},
            key_write_tally: {},
            local_by_key: {},
            local_by_kind: {}
          },
          count: {
            total_keys: 0,
            by_collection: [],
            by_kind: []
          },
          data: {}
        },
        config: {
          autoload: false,
          autosync: {
            enabled: false,
            interval: 120
          },
          adapters: {},
          obfuscate: false,
          local_only: false,
          callbacks: {
            ready: null,
            sync: null
          }
        },
        supervisor: {},
        cachebridge: {},
        model_kind_map: {},
        collection_kind_map: {}
      };
      this.internal = {
        check_support: function(modernizr) {},
        bootstrap: function(lawnchair) {},
        provision_collection: function(name, adapter, callback) {}
      };
      this.get = function() {};
      this.list = function() {};
      this.count = function() {};
      this.put = function() {};
      this.query = function() {};
      this["delete"] = function() {};
      this.sync = function() {};
      this._init = function() {
        apptools.dev.verbose('Storage', 'Storage support is currently stubbed.');
        apptools.events.trigger('STORAGE_INIT');
        return apptools.events.trigger('STORAGE_READY');
      };
      apptools.events.bridge(['STORAGE_READ', 'STORAGE_WRITE', 'STORAGE_DELETE'], 'STORAGE_ACTIVITY');
      apptools.events.bridge(['COLLECTION_CREATE', 'COLLECTION_UPDATE', 'COLLECTION_DESTROY', 'COLLECTION_SYNC', 'COLLECTION_SCAN'], 'STORAGE_ACTIVITY');
    }

    return CoreStorageAPI;

  })(CoreAPI);

  StorageDriver = (function(_super) {

    __extends(StorageDriver, _super);

    StorageDriver.methods = [];

    StorageDriver["export"] = "private";

    function StorageDriver() {
      return;
    }

    return StorageDriver;

  })(CoreInterface);

  this.__apptools_preinit.abstract_base_classes.push(StorageDriver);

  this.__apptools_preinit.abstract_base_classes.push(CoreStorageAPI);

  this.__apptools_preinit.abstract_feature_interfaces.push({
    adapter: StorageDriver,
    name: "storage"
  });

  RPCAPI = (function(_super) {

    __extends(RPCAPI, _super);

    function RPCAPI(name, base_uri, methods, config) {
      var method, _i, _len, _ref;
      this.name = name;
      this.base_uri = base_uri;
      this.methods = methods;
      this.config = config;
      if (this.methods.length > 0) {
        _ref = this.methods;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          method = _ref[_i];
          this[method] = this._buildRPCMethod(method, base_uri, config);
        }
      }
    }

    RPCAPI.prototype._buildRPCMethod = function(method, base_uri, config) {
      var api, rpcMethod,
        _this = this;
      api = this.name;
      rpcMethod = function(params, callbacks, async, push, opts, config) {
        if (params == null) params = {};
        if (callbacks == null) callbacks = null;
        if (async == null) async = false;
        if (push == null) push = false;
        if (opts == null) opts = {};
        if (config == null) config = {};
        return (function(params, callbacks, async, push, opts) {
          var request;
          request = $.apptools.api.rpc.createRPCRequest({
            method: method,
            api: api,
            params: params || {},
            opts: opts || {},
            async: async || false,
            push: push || false
          });
          if (callbacks !== null) {
            return request.fulfill(callbacks, config);
          } else {
            return request;
          }
        })(params, callbacks, async, push, opts);
      };
      $.apptools.api.registerAPIMethod(api, method, base_uri, config);
      return rpcMethod;
    };

    return RPCAPI;

  })(CoreObject);

  RPCRequest = (function(_super) {

    __extends(RPCRequest, _super);

    function RPCRequest(id, opts, agent) {
      this.params = {};
      this.action = null;
      this.method = null;
      this.api = null;
      this.base_uri = null;
      this.envelope = {
        id: null,
        opts: {},
        agent: {}
      };
      this.ajax = {
        accepts: 'application/json',
        async: true,
        cache: true,
        global: true,
        http_method: 'POST',
        crossDomain: false,
        processData: false,
        ifModified: false,
        dataType: 'json',
        push: false,
        contentType: 'application/json; charset=utf-8'
      };
      if (id != null) this.envelope.id = id;
      if (opts != null) this.envelope.opts = opts;
      if (agent != null) this.envelope.agent = agent;
    }

    RPCRequest.prototype.fulfill = function(callbacks, config) {
      var defaultFailureCallback, defaultSuccessCallback,
        _this = this;
      if (callbacks == null) callbacks = {};
      if (!((callbacks != null ? callbacks.success : void 0) != null)) {
        defaultSuccessCallback = function(context, type, data) {
          return $.apptools.dev.log('RPC', 'RPC succeeded but had no success callback.', _this, context, type, data);
        };
        callbacks.success = defaultSuccessCallback;
      }
      if (!((callbacks != null ? callbacks.failure : void 0) != null)) {
        defaultFailureCallback = function(context) {
          return $.apptools.dev.error('RPC', 'RPC failed but had no failure callback.', _this, context);
        };
        callbacks.failure = defaultFailureCallback;
      }
      return $.apptools.api.rpc.fulfillRPCRequest(config, this, callbacks);
    };

    RPCRequest.prototype.setAsync = function(async) {
      var _ref;
      if ((_ref = this.ajax) != null) if (_ref.async == null) _ref.async = async;
      return this;
    };

    RPCRequest.prototype.setPush = function(push) {
      if (push === true) {
        this.ajax.push = true;
        this.envelope.opts['alt'] = 'socket';
        this.envelope.opts['token'] = $.apptools.push.state.config.token;
      }
      return this;
    };

    RPCRequest.prototype.setOpts = function(opts) {
      var _ref, _ref2;
      if ((_ref = this.envelope) != null) {
        _ref.opts = _.defaults(opts, (_ref2 = this.envelope) != null ? _ref2.opts : void 0);
      }
      return this;
    };

    RPCRequest.prototype.setAgent = function(agent) {
      var _ref;
      if ((_ref = this.envelope) != null) {
        if (_ref.agent == null) _ref.agent = agent;
      }
      return this;
    };

    RPCRequest.prototype.setAction = function(action) {
      this.action = action;
      return this;
    };

    RPCRequest.prototype.setMethod = function(method) {
      this.method = method;
      return this;
    };

    RPCRequest.prototype.setAPI = function(api) {
      this.api = api;
      return this;
    };

    RPCRequest.prototype.setBaseURI = function(base_uri) {
      this.base_uri = base_uri;
      return this;
    };

    RPCRequest.prototype.setParams = function(params) {
      this.params = params != null ? params : {};
      return this;
    };

    RPCRequest.prototype.payload = function() {
      var _payload;
      _payload = {
        id: this.envelope.id,
        opts: this.envelope.opts,
        agent: this.envelope.agent,
        request: {
          params: this.params,
          method: this.method,
          api: this.api
        }
      };
      return _payload;
    };

    return RPCRequest;

  })(CoreObject);

  RPCResponse = (function(_super) {

    __extends(RPCResponse, _super);

    function RPCResponse() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      $.apptools.dev.verbose('RPC', 'RPCResponse is not yet implemented and is currently stubbed.');
      return;
    }

    return RPCResponse;

  })(CoreObject);

  CoreRPCAPI = (function(_super) {

    __extends(CoreRPCAPI, _super);

    CoreRPCAPI.mount = 'api';

    CoreRPCAPI.events = ['RPC_CREATE', 'RPC_FULFILL', 'RPC_SUCCESS', 'RPC_ERROR', 'RPC_COMPLETE', 'RPC_PROGRESS'];

    function CoreRPCAPI(apptools, window) {
      var original_xhr, _ref, _ref2,
        _this = this;
      this.state = {
        sockets: {
          token: '__NULL__',
          enabled: false,
          status: 'DISCONNECTED',
          "default": null,
          default_host: (((_ref = apptools.config) != null ? (_ref2 = _ref.rpc) != null ? _ref2.socket_host : void 0 : void 0) != null) || null
        }
      };
      this.base_rpc_uri = apptools.config.rpc.base_uri || '/_api/rpc';
      this.socket_host = apptools.config.rpc.socket_host || null;
      if (apptools.sys.libraries.resolve('jQuery') !== false) {
        original_xhr = $.ajaxSettings.xhr;
      } else {
        original_xhr = new XMLHTTPRequest();
      }
      this.internals = {
        transports: {
          xhr: {
            factory: function() {
              var req;
              req = original_xhr();
              if (req) {
                if (typeof req.addEventListener === 'function') {
                  req.addEventListener("progress", function(ev) {
                    return apptools.events.trigger('RPC_PROGRESS', {
                      event: ev
                    });
                  }, false);
                }
              }
              return req;
            }
          },
          websocket: {
            factory: function() {
              var req, socket, _ref3, _ref4, _ref5, _ref6;
              if (apptools.agent.capabilities.websockets != null) {
                if ((((_ref3 = _this.state.sockets) != null ? _ref3.enabled : void 0) != null) === true) {
                  if ((((_ref4 = _this.state.sockets) != null ? _ref4["default"] : void 0) != null) === null && ((_ref5 = _this.state.sockets) != null ? (_ref6 = _ref5.open) != null ? _ref6.length : void 0 : void 0) === 0) {
                    socket = new apptools.push.socket.establish();
                    _this.state.sockets.enabled = true;
                    _this.state.sockets["default"] = socket;
                    _this.state.sockets.status = 'CONNECTED';
                  }
                  req = {};
                  return req;
                }
              } else {
                apptools.dev.error('RPC', 'Socket factory can\'t produce a socket because the client platform does not support WebSockets.');
                throw "SocketsNotSupported: The client platform does not have support for websockets.";
              }
            }
          }
        },
        config: {
          headers: {
            "X-ServiceClient": ["AppToolsJS/", [AppTools.version.major.toString(), AppTools.version.minor.toString(), AppTools.version.micro.toString(), AppTools.version.build.toString()].join('.'), "-", AppTools.version.release.toString()].join(''),
            "X-ServiceTransport": "AppTools/JSONRPC"
          }
        }
      };
      if (apptools.sys.libraries.resolve('jQuery') !== false) {
        $.ajaxSetup({
          global: true,
          xhr: function() {
            return _this.internals.transports.xhr.factory();
          },
          headers: this.internals.config.headers
        });
      }
      this.rpc = {
        lastRequest: null,
        lastFailure: null,
        lastResponse: null,
        history: {},
        action_prefix: null,
        alt_push_response: false,
        used_ids: [],
        factory: function(name, base_uri, methods, config) {
          return apptools.api[name] = new RPCAPI(name, base_uri, methods, config);
        },
        _assembleRPCURL: function(method, api, prefix, base_uri) {
          if (!(api != null) && !(base_uri != null)) {
            throw "[RPC] Error: Must specify either an API or base URI to generate an RPC endpoint.";
          } else {
            if (api != null) {
              if (base_uri != null) {
                base_uri = base_uri + '/' + api;
              } else {
                base_uri = _this.base_rpc_uri + '/' + api;
              }
            } else {
              if (!(base_uri != null)) base_uri = _this.base_rpc_uri;
            }
            if (prefix !== null) {
              return [prefix + base_uri, method].join('.');
            } else {
              return [base_uri, method].join('.');
            }
          }
        },
        provisionRequestID: function() {
          var id;
          if (_this.rpc.used_ids.length > 0) {
            id = Math.max.apply(_this, _this.rpc.used_ids) + 1;
            _this.rpc.used_ids.push(id);
            return id;
          } else {
            _this.rpc.used_ids.push(1);
            return 1;
          }
        },
        decodeRPCResponse: function(data, status, xhr, success, error) {
          return success(data, status);
        },
        createRPCRequest: function(config) {
          var request;
          request = new RPCRequest(_this.rpc.provisionRequestID());
          if (config.api != null) request.setAPI(config.api);
          if (config.method != null) request.setMethod(config.method);
          if (config.agent != null) request.setAgent(config.agent);
          if (config.opts != null) request.setOpts(config.opts);
          if (config.base_uri != null) request.setBaseURI(config.base_uri);
          if (config.params != null) request.setParams(config.params);
          if (config.async != null) request.setAsync(config.async);
          if (config.push != null) {
            request.setPush(config.push);
          } else {
            request.setPush(_this.rpc.alt_push_response);
          }
          apptools.dev.verbose('RPC', 'New Request', request, config);
          request.setAction(_this.rpc._assembleRPCURL(request.method, request.api, _this.rpc.action_prefix, _this.base_rpc_uri));
          return request;
        },
        fulfillRPCRequest: function(config, request, callbacks, transport) {
          var context;
          if (transport == null) transport = 'xhr';
          apptools.dev.verbose('RPC', 'Fulfill', config, request, callbacks);
          _this.rpc.lastRequest = request;
          _this.rpc.history[request.envelope.id] = {
            request: request,
            config: config,
            callbacks: callbacks
          };
          if (request.action === null) {
            if (request.method === null) {
              throw "[RPC] Error: Request must specify at least an action or method.";
            }
            if (request.base_uri === null) {
              if (request.api === null) {
                throw "[RPC] Error: Request must have an API or explicity defined BASE_URI.";
              } else {
                request.action = _this.rpc._assembleRPCURL(request.method, request.api, _this.rpc.action_prefix);
              }
            } else {
              request.action = _this.rpc._assembleRPCURL(request.method, null, _this.rpc.action_prefix, request.base_uri);
            }
          }
          if (request.action === null || request.action === void 0) {
            throw '[RPC] Error: Could not determine RPC action.';
          }
          context = {
            config: config,
            request: request,
            callbacks: callbacks
          };
          apptools.events.trigger('RPC_FULFILL', context);
          (function(apptools, request, callbacks) {
            var driver, xhr, xhr_action, xhr_settings,
              _this = this;
            xhr_settings = {
              resourceId: request.api + '.' + request.method,
              url: request.action,
              data: JSON.stringify(request.payload()),
              async: request.ajax.async,
              global: request.ajax.global,
              type: request.ajax.http_method || 'POST',
              accepts: request.ajax.accepts || 'application/json',
              crossDomain: request.ajax.crossDomain,
              dataType: request.ajax.dataType,
              processData: false,
              ifModified: request.ajax.ifModified,
              contentType: request.ajax.contentType,
              beforeSend: function(xhr, settings) {
                apptools.api.rpc.history[request.envelope.id].xhr = xhr;
                if (callbacks != null) {
                  if (typeof callbacks.status === "function") {
                    callbacks.status('beforeSend');
                  }
                }
                return xhr;
              },
              error: function(xhr, status, error) {
                if (callbacks != null) {
                  if (typeof callbacks.status === "function") {
                    callbacks.status('error');
                  }
                }
                apptools.dev.error('RPC', 'Error: ', {
                  error: error,
                  status: status,
                  xhr: xhr
                });
                apptools.api.rpc.lastFailure = error;
                apptools.api.rpc.history[request.envelope.id].xhr = xhr;
                apptools.api.rpc.history[request.envelope.id].status = status;
                apptools.api.rpc.history[request.envelope.id].failure = error;
                context = {
                  xhr: xhr,
                  status: status,
                  error: error
                };
                apptools.events.trigger('RPC_ERROR', context);
                apptools.events.trigger('RPC_COMPLETE', context);
                return callbacks != null ? typeof callbacks.failure === "function" ? callbacks.failure(error) : void 0 : void 0;
              },
              success: function(data, status, xhr) {
                if (data.status === 'ok') {
                  if (callbacks != null) {
                    if (typeof callbacks.status === "function") {
                      callbacks.status('success');
                    }
                  }
                  apptools.dev.log('RPC', 'Success', data, status, xhr);
                  apptools.api.rpc.lastResponse = data;
                  apptools.api.rpc.history[request.envelope.id].xhr = xhr;
                  apptools.api.rpc.history[request.envelope.id].status = status;
                  apptools.api.rpc.history[request.envelope.id].response = data;
                  context = {
                    xhr: xhr,
                    status: status,
                    data: data
                  };
                  apptools.events.trigger('RPC_SUCCESS', context);
                  apptools.events.trigger('RPC_COMPLETE', context);
                  return callbacks != null ? typeof callbacks.success === "function" ? callbacks.success(data.response.content, data.response.type, data) : void 0 : void 0;
                } else if (data.status === 'wait') {
                  if (callbacks != null) {
                    if (typeof callbacks.status === "function") {
                      callbacks.status('wait');
                    }
                  }
                  apptools.dev.log('RPC', 'PushWait', data, status, xhr);
                  context = {
                    xhr: xhr,
                    status: status,
                    data: data
                  };
                  if (callbacks != null) {
                    if (typeof callbacks.wait === "function") {
                      callbacks.wait(data, status, xhr);
                    }
                  }
                  return apptools.push.internal.expect(request.envelope.id, request, xhr);
                } else if (data.status === 'fail') {
                  if (callbacks != null) {
                    if (typeof callbacks.status === "function") {
                      callbacks.status('error');
                    }
                  }
                  apptools.dev.error('RPC', 'Error: ', {
                    error: data,
                    status: status,
                    xhr: xhr
                  });
                  apptools.api.rpc.lastFailure = data;
                  apptools.api.rpc.history[request.envelope.id].xhr = xhr;
                  apptools.api.rpc.history[request.envelope.id].status = status;
                  apptools.api.rpc.history[request.envelope.id].failure = data;
                  context = {
                    xhr: xhr,
                    status: status,
                    error: data
                  };
                  apptools.events.trigger('RPC_ERROR', context);
                  apptools.events.trigger('RPC_COMPLETE', context);
                  return callbacks != null ? typeof callbacks.failure === "function" ? callbacks.failure(data) : void 0 : void 0;
                } else {
                  return callbacks != null ? typeof callbacks.success === "function" ? callbacks.success(data.response.content, data.response.type, data) : void 0 : void 0;
                }
              },
              statusCode: {
                404: function() {
                  apptools.dev.error('RPC', 'HTTP/404', 'Could not resolve RPC action URI.');
                  return apptools.events.trigger('RPC_ERROR', {
                    message: 'RPC 404: Could not resolve RPC action URI.',
                    code: 404
                  });
                },
                403: function() {
                  apptools.dev.error('RPC', 'HTTP/403', 'Not authorized to access the specified endpoint.');
                  return apptools.events.trigger('RPC_ERROR', {
                    message: 'RPC 403: Not authorized to access the specified endpoint.',
                    code: 403
                  });
                },
                500: function() {
                  apptools.dev.error('RPC', 'HTTP/500', 'Internal server error.');
                  return apptools.events.trigger('RPC_ERROR', {
                    message: 'RPC 500: Woops! Something went wrong. Please try again.',
                    code: 500
                  });
                }
              }
            };
            driver = apptools.sys.drivers.resolve('transport');
            if (driver.name === 'amplify') {
              apptools.dev.verbose('RPC', 'Fulfilling with AmplifyJS transport adapter.');
              xhr_action = driver.driver.request;
              xhr = xhr_action(xhr_settings);
            } else if (driver.name === 'jquery') {
              apptools.dev.verbose('RPC', 'Fulfilling with jQuery AJAX transport adapter.', xhr_settings);
              xhr = jQuery.ajax(xhr_settings.url, xhr_settings);
            } else {
              apptools.dev.error('RPC', 'Native RPC adapter is currently stubbed.');
              throw "[RPC]: No valid AJAX transport adapter found.";
            }
            return apptools.dev.verbose('RPC', 'Resulting XHR: ', xhr);
          })(apptools, request, callbacks);
          return {
            id: request.envelope.id,
            request: request
          };
        }
      };
      this.ext = null;
      this.registerAPIMethod = function(api, name, base_uri, config) {
        var amplify, base_settings, resourceId, _ref3;
        if (apptools != null ? (_ref3 = apptools.sys) != null ? _ref3.drivers : void 0 : void 0) {
          amplify = apptools.sys.drivers.resolve('transport', 'amplify');
          if (amplify !== false) {
            apptools.dev.log('RPCAPI', 'Registering request procedure "' + api + '.' + name + '" with AmplifyJS.');
            resourceId = api + '.' + name;
            base_settings = {
              accepts: 'application/json',
              type: 'POST',
              dataType: 'json',
              contentType: 'application/json',
              url: _this.rpc._assembleRPCURL(name, api, null, base_uri),
              decoder: _this.rpc.decodeRPCResponse
            };
            if (config.caching != null) {
              if (config.caching === true) base_settings.caching = 'persist';
              return amplify.request.define(resourceId, "ajax", base_settings);
            } else {
              return amplify.request.define(resourceId, "ajax", base_settings);
            }
          }
        }
      };
    }

    return CoreRPCAPI;

  })(CoreAPI);

  RPCDriver = (function(_super) {

    __extends(RPCDriver, _super);

    RPCDriver.methods = [];

    RPCDriver["export"] = "private";

    function RPCDriver() {
      return;
    }

    return RPCDriver;

  })(CoreInterface);

  this.__apptools_preinit.abstract_base_classes.push(RPCAPI);

  this.__apptools_preinit.abstract_base_classes.push(RPCDriver);

  this.__apptools_preinit.abstract_base_classes.push(CoreRPCAPI);

  this.__apptools_preinit.abstract_base_classes.push(RPCRequest);

  this.__apptools_preinit.abstract_base_classes.push(RPCResponse);

  this.__apptools_preinit.abstract_feature_interfaces.push({
    adapter: RPCDriver,
    name: "transport"
  });

  CoreUserAPI = (function(_super) {

    __extends(CoreUserAPI, _super);

    CoreUserAPI.mount = 'user';

    CoreUserAPI.events = ['SET_USER_INFO'];

    function CoreUserAPI(apptools, window) {
      this.current_user = null;
    }

    CoreUserAPI.prototype.setUserInfo = function(userinfo) {
      this.current_user = userinfo.current_user || null;
      $.apptools.dev.log('UserAPI', 'Set server-injected userinfo: ', this.current_user);
      return $.apptools.events.trigger('SET_USER_INFO', this.current_user);
    };

    return CoreUserAPI;

  })(CoreAPI);

  this.__apptools_preinit.abstract_base_classes.push(CoreUserAPI);

  CorePushAPI = (function(_super) {

    __extends(CorePushAPI, _super);

    CorePushAPI.mount = 'push';

    CorePushAPI.events = ['PUSH_INIT', 'PUSH_READY', 'PUSH_STATE_CHANGE', 'PUSH_SOCKET_OPEN', 'PUSH_SOCKET_ESTABLISH', 'PUSH_SOCKET_ACTIVITY', 'PUSH_SOCKET_ACTIVITY_FINISH', 'PUSH_SOCKET_ERROR', 'PUSH_SOCKET_CLOSE'];

    function CorePushAPI(apptools, window) {
      var _this = this;
      this.state = {
        ready: false,
        status: 'init',
        transport: {
          sockets: [],
          channel: null
        },
        callbacks: {
          open: null,
          expect: null,
          activity: null,
          error: null,
          close: null
        },
        config: {
          token: null
        }
      };
      apptools.events.bridge(['PUSH_READY', 'PUSH_SOCKET_ESTABLISH', 'PUSH_SOCKET_ERROR', 'PUSH_SOCKET_OPEN', 'PUSH_SOCKET_CLOSE'], 'PUSH_STATE_CHANGE');
      apptools.events.hook('PUSH_SOCKET_OPEN', function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return apptools.api.rpc.alt_push_response = true;
      });
      apptools.events.hook('PUSH_SOCKET_CLOSE', function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return apptools.api.rpc.alt_push_response = false;
      });
      this.events = {
        on_open: function(socket) {
          if (_this.state.transport.sockets.length = 0) {
            _this.state.status = 'ready';
          }
          apptools.events.trigger('PUSH_SOCKET_OPEN', _this.state);
          return apptools.dev.verbose('PushSocket', 'Message transport opened.');
        },
        on_message: function(socket, payload) {
          var _base;
          _this.state.status = 'receiving';
          apptools.dev.verbose('PushSocket', 'Message received.', payload);
          apptools.events.trigger('PUSH_SOCKET_ACTIVITY', _this.state);
          if (typeof (_base = _this.state.callbacks).activity === "function") {
            _base.activity(payload);
          }
          return apptools.events.trigger('PUSH_SOCKET_ACTIVITY_FINISH', _this.state);
        },
        on_error: function(socket, error) {
          _this.state.status = 'error';
          apptools.dev.error('PushSocket', 'Message transport error.', error);
          return apptools.events.trigger('PUSH_SOCKET_ERROR', _this.state);
        },
        on_close: function(socket) {
          _this.state.ready = false;
          _this.state.status = 'close';
          apptools.dev.verbose('PushSocket', 'Message transport closed.');
          return apptools.events.trigger('PUSH_SOCKET_CLOSE', _this.state);
        }
      };
      this.internal = {
        open_channel: function(token) {
          apptools.events.trigger('PUSH_INIT', {
            token: token,
            type: 'channel'
          });
          _this.state.config.token = token;
          _this.state.transport.channel = new goog.appengine.Channel(_this.state.config.token);
          return _this.internal._add_socket(_this.state.transport.channel);
        },
        open_websocket: function(token, server) {
          apptools.events.trigger('PUSH_INIT', {
            token: token,
            server: server,
            type: 'websocket'
          });
          apptools.dev.log('Push', "WARNING: WebSockets support is currently experimental.");
          return _this.internal._add_socket(_this.state.transport.socket);
        },
        _add_socket: function(transport, callbacks) {
          var socket;
          socket = transport.open();
          _this.state.transport.sockets.push(socket);
          apptools.events.trigger('PUSH_SOCKET_ESTABLISH', socket);
          socket.onopen = function() {
            var args, _ref;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return (_ref = _this.events).on_open.apply(_ref, [socket].concat(__slice.call(args)));
          };
          socket.onmessage = function() {
            var args, _ref;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return (_ref = _this.events).on_message.apply(_ref, [socket].concat(__slice.call(args)));
          };
          socket.onerror = function() {
            var args, _ref;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return (_ref = _this.events).on_error.apply(_ref, [socket].concat(__slice.call(args)));
          };
          socket.onclose = function() {
            var args, _ref;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return (_ref = _this.events).on_close.apply(_ref, [socket].concat(__slice.call(args)));
          };
          return _this.internal;
        },
        expect: function(id, request, xhr) {
          var _ref, _ref2;
          if ((_ref = _this.state) != null) {
            if ((_ref2 = _ref.callbacks) != null) {
              if (typeof _ref2.expect === "function") {
                _ref2.expect(id, request, xhr);
              }
            }
          }
          return _this.internal;
        }
      };
      this.channel = {
        establish: function(token) {
          return _this.internal.open_channel(token);
        }
      };
      this.socket = {
        establish: function(token, host) {
          if (host == null) host = null;
          return _this.internal.open_websocket(token, host || apptools.config.sockets.host);
        }
      };
      this.listen = function(callbacks) {
        _this.state.callbacks = _.defaults(callbacks, _this.state.callbacks);
        _this.state.ready = true;
        return _this.internal;
      };
    }

    return CorePushAPI;

  })(CoreAPI);

  PushDriver = (function(_super) {

    __extends(PushDriver, _super);

    PushDriver.methods = [];

    PushDriver["export"] = "private";

    function PushDriver() {
      return;
    }

    return PushDriver;

  })(CoreInterface);

  this.__apptools_preinit.abstract_base_classes.push(PushDriver);

  this.__apptools_preinit.abstract_base_classes.push(CorePushAPI);

  this.__apptools_preinit.abstract_feature_interfaces.push({
    adapter: PushDriver,
    name: "transport"
  });

  CoreRenderAPI = (function(_super) {

    __extends(CoreRenderAPI, _super);

    CoreRenderAPI.mount = 'render';

    CoreRenderAPI.events = ['ADD_TEMPLATE', 'RENDER_TEMPLATE'];

    CoreRenderAPI["export"] = 'private';

    function CoreRenderAPI(apptools, window) {
      return;
    }

    CoreRenderAPI.prototype._init = function() {};

    return CoreRenderAPI;

  })(CoreAPI);

  RenderDriver = (function(_super) {

    __extends(RenderDriver, _super);

    RenderDriver["export"] = 'private';

    RenderDriver.methods = ['render', 'register_template'];

    function RenderDriver() {
      return;
    }

    return RenderDriver;

  })(CoreInterface);

  QueryDriver = (function(_super) {

    __extends(QueryDriver, _super);

    QueryDriver["export"] = 'private';

    QueryDriver.methods = ['element_by_id', 'elements_by_class'];

    function QueryDriver() {
      return;
    }

    return QueryDriver;

  })(CoreInterface);

  this.__apptools_preinit.abstract_base_classes.push(QueryDriver);

  this.__apptools_preinit.abstract_base_classes.push(RenderDriver);

  this.__apptools_preinit.abstract_base_classes.push(CoreRenderAPI);

  this.__apptools_preinit.abstract_feature_interfaces.push({
    adapter: RenderDriver,
    name: "render"
  });

  CoreWidgetAPI = (function(_super) {

    __extends(CoreWidgetAPI, _super);

    function CoreWidgetAPI() {
      CoreWidgetAPI.__super__.constructor.apply(this, arguments);
    }

    CoreWidgetAPI.mount = 'widget';

    CoreWidgetAPI.events = [];

    CoreWidgetAPI.prototype._init = function(apptools) {
      apptools.sys.state.add_flag('widgets');
      apptools.dev.verbose('CoreWidget', 'Widget functionality is currently stubbed.');
    };

    return CoreWidgetAPI;

  })(CoreAPI);

  CoreWidget = (function(_super) {

    __extends(CoreWidget, _super);

    function CoreWidget() {
      CoreWidget.__super__.constructor.apply(this, arguments);
    }

    return CoreWidget;

  })(CoreObject);

  if (this.__apptools_preinit != null) {
    if (!(this.__apptools_preinit.abstract_base_classes != null)) {
      this.__apptools_preinit.abstract_base_classes = [];
    }
    if (!(this.__apptools_preinit.deferred_core_modules != null)) {
      this.__apptools_preinit.deferred_core_modules = [];
    }
  } else {
    this.__apptools_preinit = {
      abstract_base_classes: [],
      deferred_core_modules: []
    };
  }

  this.__apptools_preinit.abstract_base_classes.push(CoreWidget);

  this.__apptools_preinit.abstract_base_classes.push(CoreWidgetAPI);

  this.__apptools_preinit.deferred_core_modules.push({
    module: CoreWidgetAPI
  });

  CoreAdminAPI = (function(_super) {

    __extends(CoreAdminAPI, _super);

    function CoreAdminAPI() {
      this._init = __bind(this._init, this);
      CoreAdminAPI.__super__.constructor.apply(this, arguments);
    }

    CoreAdminAPI.mount = 'admin';

    CoreAdminAPI.events = [];

    CoreAdminAPI.prototype._init = function(apptools) {
      apptools.sys.state.add_flag('admin');
      apptools.dev.log('AdminAPI', 'NOTICE: Admin APIs are enabled.');
    };

    return CoreAdminAPI;

  })(CoreAPI);

  if (this.__apptools_preinit != null) {
    if (!(this.__apptools_preinit.abstract_base_classes != null)) {
      this.__apptools_preinit.abstract_base_classes = [];
    }
    if (!(this.__apptools_preinit.deferred_core_modules != null)) {
      this.__apptools_preinit.deferred_core_modules = [];
    }
  } else {
    this.__apptools_preinit = {
      abstract_base_classes: [],
      deferred_core_modules: []
    };
  }

  this.__apptools_preinit.abstract_base_classes.push(CoreAdminAPI);

  this.__apptools_preinit.deferred_core_modules.push({
    module: CoreAdminAPI
  });

  BlogManagerAPI = (function(_super) {

    __extends(BlogManagerAPI, _super);

    BlogManagerAPI.mount = 'blog';

    BlogManagerAPI.events = [];

    function BlogManagerAPI(apptools, admin_api) {
      apptools.dev.verbose('BlogManager', 'AppToolsXMS BlogManager is currently stubbed.');
    }

    return BlogManagerAPI;

  })(CoreAdminAPI);

  this.__apptools_preinit.abstract_base_classes.push(BlogManagerAPI);

  this.__apptools_preinit.deferred_core_modules.push({
    module: BlogManagerAPI,
    package: 'admin'
  });

  PageManagerAPI = (function(_super) {

    __extends(PageManagerAPI, _super);

    PageManagerAPI.mount = 'page';

    PageManagerAPI.events = ['PAGE_EDIT', 'PAGE_SAVE', 'PAGE_META_SAVE'];

    function PageManagerAPI(apptools, admin, window) {
      apptools.dev.verbose('PageManager', 'AppToolsXMS PageManager is currently stubbed.');
    }

    return PageManagerAPI;

  })(CoreAdminAPI);

  this.__apptools_preinit.abstract_base_classes.push(PageManagerAPI);

  this.__apptools_preinit.deferred_core_modules.push({
    module: PageManagerAPI,
    package: 'admin'
  });

  SiteManagerAPI = (function(_super) {

    __extends(SiteManagerAPI, _super);

    SiteManagerAPI.mount = 'site';

    SiteManagerAPI.events = ['SITE_EDIT', 'SITE_SAVE', 'SITE_META_SAVE'];

    function SiteManagerAPI(apptools, admin, window) {
      apptools.dev.verbose('SiteManager', 'AppToolsXMS SiteManager is currently stubbed.');
    }

    return SiteManagerAPI;

  })(CoreAdminAPI);

  this.__apptools_preinit.abstract_base_classes.push(SiteManagerAPI);

  this.__apptools_preinit.deferred_core_modules.push({
    module: SiteManagerAPI,
    package: 'admin'
  });

  ContentManagerAPI = (function(_super) {

    __extends(ContentManagerAPI, _super);

    ContentManagerAPI.mount = 'content';

    ContentManagerAPI.events = [];

    function ContentManagerAPI(apptools, admin, window) {
      var change_count, editing, features, state, style_cache, that,
        _this = this;
      editing = false;
      style_cache = {};
      state = {};
      change_count = 0;
      features = {
        panel: {
          commands: {
            undo: function() {
              return document.execCommand('undo');
            },
            redo: function() {
              return document.execCommand('redo');
            },
            cut: function() {
              return document.execCommand('cut');
            },
            paste: function() {
              return document.execCommand('paste');
            },
            table: function() {
              return document.execCommand('enableInlineTableEditing');
            },
            resize: function() {
              return document.execCommand('enableObjectResizing');
            },
            clip: null,
            b: function() {
              return document.execCommand('bold');
            },
            u: function() {
              return document.execCommand('underline');
            },
            i: function() {
              return document.execCommand('italic');
            },
            clear: function() {
              return document.execCommand('removeFormat');
            },
            h1: function() {
              var t;
              t = document.selection ? document.selection() : window.getSelection();
              return document.execCommand('insertHTML', false, '<h1 class="h1">' + String(t) + '</h1>');
            },
            h2: function() {
              var t;
              t = document.selection ? document.selection() : window.getSelection();
              return document.execCommand('insertHTML', false, '<h2 class="h2">' + String(t) + '</h2>');
            },
            h3: function() {
              var t;
              t = document.selection ? document.selection() : window.getSelection();
              return document.execCommand('insertHTML', false, '<h3 class="h3">' + String(t) + '</h3>');
            },
            fontColor: function() {
              var c, t;
              t = document.selection ? document.selection() : window.getSelection();
              c = prompt('Please enter a hexidecimal color value (i.e. #ffffff)');
              c = c[0] === '#' ? c : '#' + c;
              return document.execCommand('insertHTML', false, '<span style="color:' + c + ';">' + t + '</span>');
            },
            fontSize: function() {
              var s, t;
              t = document.selection ? document.selection() : window.getSelection();
              s = prompt('Please enter desired point size (i.e. 10)');
              return document.execCommand('insertHTML', false, '<span style="font-size:' + s + 'pt;">' + t + '</span>');
            },
            fontFace: null,
            l: function() {
              return document.execCommand('justifyLeft');
            },
            r: function() {
              return document.execCommand('justifyRight');
            },
            c: function() {
              return document.execCommand('justifyCenter');
            },
            "in": function() {
              return document.execCommand('indent');
            },
            out: function() {
              return document.execCommand('outdent');
            },
            bullet: function() {
              return document.execCommand('insertUnorderedList');
            },
            number: function() {
              return document.execCommand('insertOrderedList');
            },
            indentSpecial: null,
            lineSpacing: null,
            link: function() {
              var l, t;
              t = document.selection ? document.selection() : window.getSelection();
              if (!util.is(t)) {
                t = prompt("What link text do you want to display?");
              }
              l = prompt('What URL do you want to link to?');
              return document.execCommand('insertHTML', false, '<a href="' + l + '">' + t + '</a>');
            },
            image: null,
            video: null
          },
          panel_html: ['<div id="CMS_wrap">', '<div id="CMS_panel" class="fixed panel" style="opacity: 0;">', '<div id="CMS_frame" class="nowrap">', '<div class="cms_pane" id="buttons">', '<div class="cms_subpane">', '<h1 class="cms_sp">editing</h1>', '<p>', '<button id="cms_undo" value="undo">undo</button>', '<button id="cms_redo" value="redo">redo</button>', '<button id="cms_cut" value="cut">cut</button>', '<button id="cms_paste" value="paste">paste</button>', '</p>', '</div>', '<hr/>', '<div class="cms_subpane">', '<h1 class="cms_sp">typography</h1>', '<p>', '<select id="cms_headers" class="cms">', '<option id="cms_h1" class="h1">Heading 1</option>', '<option id="cms_h2" class="h2">Heading 2</option>', '<option id="cms_h3" class="h3">Heading 3</option>', '</select>', '<button id="cms_b" value="bold">B</button>', '<button id="cms_u" value="underline">U</button>', '<button id="cms_i" value="italic">I</button>', '<button id="cms_clear" value="clear formatting">clear</button>', '<button id="cms_fontColor" value="font color">font color</button>', '<button id="cms_fontSize" value="font size">font size</button>', '</p>', '</div>', '<hr/>', '<div class="cms_subpane">', '<h1 class="cms_sp">alignment</h1>', '<p style="text-lign:center">', '<button id="cms_l" value="left">left</button>', '<button id="cms_c" value="center">center</button>', '<button id="cms_r" value="right">right</button>', '<br>', '<button id="cms_in" value="indent">&raquo;</button>', '<button id="cms_out" value="outdent">&laquo;</button>', '<br>', '<button id="cms_ul" value="unordered list">&lt;ul&gt;</button>', '<button id="cms_ol" value="ordered list">&lt;ol&gt;</button>', '</p>', '</div>', '<hr/>', '<div class="cms_subpane">', '<h1 class="cms_sp">interactive</h1>', '<p>', '<button id="cms_link" value="link">add link</button>', '</p>', '</div>', '</div>', '<div class="cms_pane" id="styles">', '<div class="cms_subpane">', '<h1 class="cms_sp">styles</h1>', '<p>MIDDLE</p>', '</div>', '</div>', '<div class="cms_pane" id="assets">', '<div class="cms_subpane">', '<h1 class="cms_sp">drop files here</h1>', '<div id="upload_wrap">', '<div id="upload" class="dragdrop">', '<span class="center-text" id="up_content">+</span>', '</div>', '</div>', '</div>', '<hr>', '<div class="cms_subpane">', '<h1 class="cms_sp">uploaded assets</h1>', '<p>', '<button id="pop_assets_button" class="pop" name="assets" value="pop out this pane!">pop me out</button>', '</p>', '</div>', '</div>', '</div>', '<div id="CMS_nav">', '<a class="scroll" href="#buttons">buttons</a>', '<a class="scroll" href="#styles">styles</a>', '<a class="scroll" href="#assets">assets</a>', '</div>', '<div id="CMS_panel_footer">&copy; momentum labs 2012</div>', '</div>', '</div>'].join('\n'),
          status_html: '<div class="fixed panel bigger" id="cms_edit_on" style="vertical-align: middle; left: -305px;top: 50px;width: 300px;text-align: right;padding-right: 10px;opacity: 0;"><span id="cms_span" style="color: #222;cursor: pointer">content editing <span style="color: green;font-weight: bold;">ON</span></span></div>',
          init: false
        },
        scroller: {
          animation: {
            duration: 500,
            easing: 'easeInOutExpo',
            complete: null
          },
          axis: 'horizontal',
          frame: 'CMS_frame',
          init: false
        },
        pop: {
          animation: {
            duration: 500,
            easing: 'easeInOutExpo',
            complete: null
          },
          position: {
            bottom: '60px',
            right: '60px'
          },
          init: false
        },
        modal: {
          animation: {
            duration: 400,
            easing: 'easeInOutExpo',
            complete: null
          },
          initial: {
            width: '0px',
            height: '0px',
            top: window.innerHeight / 2 + 'px',
            left: window.innerWidth / 2 + 'px'
          },
          ratio: {
            x: 0.4,
            y: 0.4
          },
          html: ['<div id="modal_wrap" style="opacity: 0;" class="modal_wrap">', '<div id="modal" style="opacity: 0;" class="fixed modal">', '<div id="modal_status"></div>', '<div id="modal_content">', '*****', '</div>', '<div id="modal_ui"><button id="mod-close">close</button></div>', '</div>', '</div>'].join('\n'),
          content: '<span style="font-size: 25px;margin: 10px auto;color: #5f5f5f;font-weight:bold">hello, lightbox!</span>',
          rounded: true,
          init: false
        },
        overlay: '<div id="m-overlay" class="fixed" style="opacity: 0;"></div>',
        init: false
      };
      this.config = $.extend(true, {}, features);
      this.util = {
        bind: function(obje, eve, fnc) {
          var rObj;
          rObj = {};
          rObj[eve] = fnc;
          return obje.bind(rObj);
        },
        imgPreview: function(eV) {
          var img, res;
          res = eV.target.result;
          img = document.createElement('img');
          img.classList.add('preview');
          img.src = res;
          return document.getElementById('upload').appendChild(img);
        },
        is: function(thing) {
          if ($.inArray(thing, [false, null, NaN, void 0, 0, {}, [], '', 'false', 'False', 'null', 'NaN', 'undefined', '0', 'none', 'None']) === -1) {
            return true;
          } else {
            return false;
          }
        },
        isID: function(str) {
          if (String(str).split('')[0] === '#' || document.getElementById(str) !== null) {
            return true;
          } else {
            return false;
          }
        },
        handleDrag: function(evE) {
          var eT;
          e.preventDefault();
          e.stopPropagation();
          eT = e.target;
          if (e.type === 'dragenter') {
            return $(eT).addClass('hover');
          } else if (e.type !== 'dragover') {
            return $(eT).removeClass('hover');
          }
        },
        makeDragDrop: function(elem) {
          elem.addEventListener('dragenter', _this.util.handleDrag, false);
          elem.addEventListener('dragexit', _this.util.handleDrag, false);
          elem.addEventListener('dragleave', _this.util.handleDrag, false);
          elem.addEventListener('dragover', _this.util.handleDrag, false);
          return elem.addEventListener('drop', _this.uploadAsset, false);
        },
        wrap: function(func) {
          var args;
          args = Array.prototype.slice.call(arguments, 1);
          return function() {
            return func.apply(this, args);
          };
        }
      };
      this.edit = function(o) {
        var $id, $o, offset;
        $o = $(o);
        offset = $o.offset();
        $id = $o.attr('id');
        console.log('Enabling inline editing of #' + $id);
        o.contentEditable = true;
        editing = true;
        style_cache[$id] = $o.attr('style');
        state[$id] = $o.html();
        $o.unbind('click');
        $('body').append(_this.config.overlay);
        $('#m-overlay').animate({
          'opacity': 0.75
        }, {
          duration: 400,
          easing: 'easeInOutExpo'
        });
        $o.css({
          'z-index': function() {
            var z;
            return z = 900 + Math.floor(Math.random() * 81);
          }
        });
        $o.offset(offset);
        if (!_this.util.isID('CMS_panel')) {
          _this.panel.make();
          _this.panel.live();
        }
        return $('#m-overlay').bind({
          click: _this.util.wrap(_this.save, o)
        });
      };
      this.save = function(ob) {
        var $id, $kn, $o, inHTML, that;
        $o = $(ob);
        $id = $o.attr('id');
        inHTML = $o.html();
        $kn = $o.data('snippet-keyname') ? $o.data('snippet-keyname') : 'default-key';
        that = _this;
        ob.contentEditable = false;
        editing = false;
        _this.panel.destroy();
        _this.util.bind($o, 'click', _this.util.wrap(_this.edit, ob));
        if (!_this.util.isID('CMS_sync')) {
          $('body').append('<div class="cms_message warn" id="CMS_sync" style="top: 50px;opacity: 0;"><div id="sync_loader" class="loader">syncing changes...</div></div>');
        }
        return $('#m-overlay').animate({
          'opacity': 0
        }, {
          duration: 500,
          easing: 'easeInOutExpo',
          complete: function() {
            $('#m-overlay').remove();
            if (inHTML !== state[$id]) {
              return $('#CMS_sync').animate({
                'opacity': 1
              }, {
                duration: 700,
                easing: 'easeInOutExpo',
                complete: function() {
                  change_count++;
                  return that.sync({
                    snippet_keyname: $kn,
                    inner_html: inHTML
                  });
                }
              });
            }
          }
        });
      };
      this.sync = function(snippetObj) {
        var that;
        that = _this;
        $.apptools.dev.verbose('CMS', 'Initiating sync operation for snippet.', snippetObj);
        return $.apptools.api.content.save_snippet(snippetObj).fulfill({
          success: function() {
            if (change_count - 1 === 0) {
              $('#CMS_sync').html('changes saved!');
              $('#CMS_sync').removeClass('warn').removeClass('error').addClass('yay');
              setTimeout(function() {
                return $('#CMS_sync').animate({
                  'opacity': 0
                }, {
                  duration: 500,
                  easing: 'easeInOutExpo',
                  complete: function() {
                    return $('#CMS_sync').remove();
                  }
                });
              }, 700);
              return change_count--;
            } else {
              return change_count--;
            }
          },
          failure: function(error) {
            $('#CMS_sync').html('error syncing page.');
            $('#CMS_sync').removeClass('warn').addClass('error');
            return setTimeout(function() {
              $('#CMS_sync').append('<br><a id="sync_retry" style="pointer: cursor;text-decoration: underline;">retry sync</a>');
              return that.util.bind($('#sync_retry'), 'click', that.util.wrap(that.sync, snippetObj));
            }, 1500);
          }
        });
      };
      this.revert = function(obj) {
        var _kn;
        _kn = $(obj).data('snippet-keyname');
        return $.apptools.api.content.revert_snippet({
          snippet_keyname: _kn
        }).fulfill({
          success: function() {
            $(_o).html(response.inner_html);
            $('body').append('div id="CMS_revert" class="cms_message yay" style="opacity: 0;">changes reverted!</div>');
            return $('#CMS_revert').animate({
              'opacity': 1
            }, {
              duration: 400,
              easing: 'easeInOutExpo',
              complete: function() {
                return setTimeout(function() {
                  return $('#CMS_revert').animate({
                    'opacity': 0
                  }, {
                    duration: 500,
                    easing: 'easeInOutExpo',
                    complete: function() {
                      return $('#CMS_revert').remove();
                    }
                  });
                }, 700);
              }
            });
          },
          failure: function(error) {
            $('#CMS_revert').html('error reverting page.');
            return $('#CMS_revert').removeClass('warn').addClass('error');
          }
        });
      };
      this.uploadAsset = function(e) {
        var file, files, readFile, _i, _len, _results;
        e.preventDefault();
        e.stopPropagation();
        $(e.target).removeClass('hover');
        files = e.dataTransfer.files;
        readFile = function(f) {
          var reader;
          if (f.type.match(/image.*/)) {
            reader = new FileReader();
            reader.onloadend = this.util.imgPreview;
            return reader.readAsDataURL(f);
          }
        };
        _results = [];
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          file = files[_i];
          _results.push(readFile(file));
        }
        return _results;
      };
      this.placeAsset = function(ev) {};
      this.panel = {
        make: function() {
          var raw;
          raw = _this.config.panel.panel_html;
          $('body').append(raw);
          $('#CMS_panel').css({
            'bottom': '0px'
          });
          $('#CMS_wrap').css({
            'opacity': 1
          });
          return $('#CMS_panel').animate({
            'bottom': '60px',
            'opacity': 1
          }, {
            'duration': 500,
            'easing': 'easeInOutExpo'
          });
        },
        live: function() {
          var axn, bu, cmds, frame, that, up;
          cmds = _this.config.panel.commands;
          frame = _this.config.scroller.frame;
          up = document.getElementById('upload');
          that = _this;
          $('.scroll').each(function() {
            var $t, rel, t;
            t = this;
            $t = $(t);
            rel = String($t.attr('href')).slice(1);
            $t.attr('id', 'scr' + rel);
            $t.attr('href', 'javascript:void(0);');
            $('#' + frame).data('scroller', {
              axis: 'horizontal'
            });
            that.util.bind($t, 'click', that.util.wrap(that.scroller.jump, rel));
            return that.config.scroller.init = true;
          });
          _this.scroller.classify(frame);
          $('.pop').each(function() {
            var $t, rel, t;
            t = this;
            $t = $(t);
            rel = $t.attr('name');
            $t.removeAttr('name');
            $t.data('pop', {
              target: rel
            });
            that.util.bind($t, 'click', that.util.wrap(that.pop.pop, rel));
            return that.config.pop.init = true;
          });
          _this.util.makeDragDrop(up);
          for (bu in cmds) {
            axn = cmds[bu];
            _this.util.bind($('#cms_' + bu), 'click', axn);
          }
          return _this.config.panel.init = true;
        },
        die: function() {
          var _axn, _bu, _cmds, _results;
          _cmds = _this.config.panel.commands;
          _results = [];
          for (_bu in _cmds) {
            _axn = _cmds[_bu];
            _results.push($('#cms_' + _bu).unbind('click'));
          }
          return _results;
        },
        destroy: function() {
          var deep;
          $('#m-overlay').unbind();
          deep = true;
          if (editing === false) {
            return $('#CMS_panel').animate({
              'opacity': 0,
              'bottom': '0px'
            }, {
              duration: 450,
              easing: 'easeInOutExpo',
              complete: function() {
                if (deep === true) {
                  return $('#CMS_wrap').remove();
                } else {
                  return $('#CMS_wrap').css({
                    'opacity': 1
                  });
                }
              }
            });
          }
        },
        toggle: function() {
          if (_this.util.is($('#CMS_panel'))) {
            _this.panel.destroy;
            return $('#cms_span').html('&gt;');
          } else {
            _this.panel.make();
            _this.panel.live();
            return $('#cms_span').html('x');
          }
        }
      };
      this.scroller = {
        classify: function(ctx) {
          var $c, $d;
          $c = $('#' + ctx);
          $d = $c.data('scroller');
          if (($d.axis === 'horizontal') || !_this.util.is($d.axis)) {
            $('.cms_pane').removeClass('left').removeClass('clear').addClass('in-table');
            return $c.addClass('nowrap');
          } else if ($d.axis === 'vertical') {
            $c.removeClass('nowrap');
            return $('.cms_pane').removeClass('in-table').addClass('left').addClass('clear');
          }
        },
        jump: function(reL, cback, eVent) {
          var $d, $f, anim, diff, f_o, r_o;
          if (_this.util.is(e)) {
            e.preventDefault();
            e.stopPropagation();
          }
          $f = $('#' + _this.config.scroller.frame);
          $d = $f.data('scroller');
          anim = _this.util.is(cback) ? $.extend({}, _this.config.scroller.animation, {
            complete: cback
          }) : _this.config.scroller.animation;
          f_o = $f.offset();
          r_o = $('#' + reL).offset();
          if ($d.axis === 'vertical') {
            diff = Math.floor(r_o.top - f_o.top);
            return $f.animate({
              scrollTop: '+=' + diff
            }, anim);
          } else if ($d.axis === 'horizontal') {
            diff = Math.floor(r_o.left - f_o.left);
            return $f.animate({
              scrollLeft: '+=' + diff
            }, anim);
          }
        }
      };
      this.pop = {
        pop: function(iD) {
          var $t, anim, biD, pHTML, piD, popped, pos, prevSib, that;
          that = _this;
          $t = $('#' + iD);
          piD = 'pop_' + iD;
          biD = piD + '_button';
          pos = _this.config.pop.position;
          pHTML = $t.html();
          prevSib = $t.prev().attr('id');
          $b.unbind('click');
          anim = $.extend({}, _this.config.pop.animation, {
            complete: function() {
              $t.remove();
              $('#' + biD).html('pop back in');
              that.util.bind($('#' + biD), 'click', that.util.wrap(that.pop.reset, iD, 'CMS_frame'));
              return that.util.makeDragDrop(document.getElementById('upload'));
            }
          });
          popped = '<div id="' + piD + '" class="fixed panel" style="opacity:0;">' + pHTML + '</div>';
          $('body').append(popped);
          $('#' + piD).css({
            'bottom': '0px',
            'right': pos.right,
            'z-index': 989
          });
          $('#' + piD).animate({
            'bottom': pos.bottom,
            'opacity': 1
          }, anim);
          return _this.scroller.jump(prevSib);
        },
        reset: function(id, tid) {
          var $tar, anim, bid, pid, that;
          if (tid === false || !_this.util.is(tid)) {
            return $('#pop_' + id).remove();
          } else {
            that = _this;
            pid = 'pop_' + iD;
            $tar = $('#' + tid);
            bid = pid + '_button';
            $(bid).unbind('click');
            return anim = $.extend({}, _this.config.pop.animation, {
              complete: function() {
                $('#' + pid).remove();
                $('#' + bid).html('pop me out');
                that.util.bind($('#' + bid), 'click', that.util.wrap(that.pop.pop, id));
                return that.util.makeDragDrop(document.getElementById('upload'));
              }
            });
          }
        }
      };
      this.modal = {
        show: function(rEL, rELHTML, callBack) {
          var modalCSS, modalHTML, modalHeight, modalWidth, _anim, _html;
          modalCSS = {
            opacity: 1
          };
          _anim = this.util.is(callBack) ? $.extend({}, this.config.modal.animation, {
            complete: callBack
          }) : this.config.modal.animation;
          _html = this.config.modal.html.split('*****');
          modalHTML = _html[0] + rELHTML + _html[1];
          modalWidth = Math.floor(this.config.modal.ratio.x * window.innerWidth);
          modalHeight = Math.floor(this.config.modal.ratio.y * window.innerHeight);
          modalCSS.width = modalWidth + 'px';
          modalCSS.height = modalHeight + 'px';
          modalCSS.top = Math.floor((window.innerHeight - modalHeight) / 2);
          modalCSS.left = Math.floor((window.innerWidth - modalWidth) / 2);
          $('body').append(this.config.overlay);
          $('#m-overlay').animate({
            opacity: 0.5
          }, {
            duration: 400,
            easing: 'easeInOutExpo',
            complete: function() {
              return this.util.bind($('#m-overlay'), 'click', this.modal.hide);
            }
          });
          $('body').append(modalHTML);
          $('#modal-wrap').css({
            opacity: 1
          });
          if (this.config.modal.rounded) $('#modal').addClass('rounded');
          $('#modal').css(this.config.modal.initial);
          $('#modal').animate(modalCSS, _anim);
          return this.util.bind($('#mod-close'), 'click', this.modal.hide);
        },
        hide: function() {
          var $id, _end;
          $id = $('#modal');
          _end = $.extend({}, this.config.modal.initial, {
            left: 0 + 'px',
            width: window.innerWidth,
            right: 0 + 'px',
            opacity: 0.5
          });
          setTimeout(function() {
            $id.removeClass('rounded');
            return $id.css({
              padding: 0
            });
          }, 150);
          return $id.animate(_end, {
            duration: 400,
            easing: 'easeInOutExpo',
            complete: function() {
              $id.animate({
                opacity: 0
              }, {
                duration: 250,
                easing: 'easeInOutExpo'
              });
              return $('#m-overlay').animate({
                opacity: 0
              }, {
                duration: 500,
                easing: 'easeInOutExpo',
                complete: function() {
                  $('#m-overlay').remove();
                  return $('#modal_wrap').remove();
                }
              });
            }
          });
        }
      };
      apptools.dev.verbose('CMS', 'Initializing Momentum extensible management system...');
      that = this;
      $('body').append(this.config.panel.status_html);
      setTimeout(function() {
        $('#cms_span').animate({
          'opacity': 1
        }, {
          duration: 450,
          easing: 'easeInOutExpo'
        });
        return $('#cms_edit_on').animate({
          'opacity': 1,
          'left': '-155px'
        }, {
          duration: 400,
          easing: 'easeInOutExpo',
          complete: function() {
            return setTimeout(function() {
              return $('#cms_edit_on').animate({
                'left': '-290px'
              }, {
                duration: 400,
                easing: 'easeInOutExpo',
                complete: function() {
                  that.util.bind($('#cms_edit_on'), 'click', that.panel.toggle);
                  return that.panel.toggle();
                }
              });
            }, 1750);
          }
        });
      }, 500);
      $('.editable').each(function(){
            var t = this;
            that.util.bind($(t), 'click', that.util.wrap(that.edit, t));
        });;
    }

    return ContentManagerAPI;

  })(CoreAdminAPI);

  this.__apptools_preinit.abstract_base_classes.push(ContentManagerAPI);

  this.__apptools_preinit.deferred_core_modules.push({
    module: ContentManagerAPI,
    package: 'admin'
  });

  AppTools = (function() {

    AppTools.version = {
      major: 0,
      minor: 1,
      micro: 4,
      build: 4282012,
      release: "BETA",
      get: function() {
        return [[[this.major.toString(), this.minor.toString(), this.micro.toString()].join('.'), this.build.toString()].join('-'), this.release].join(' ');
      }
    };

    function AppTools(window) {
      var module, _i, _len, _ref, _ref2,
        _this = this;
      this.config = {
        rpc: {
          base_uri: '/_api/rpc',
          host: null,
          enabled: true
        },
        sockets: {
          host: null,
          enabled: false
        }
      };
      this.lib = {};
      this.sys = {
        platform: {},
        version: this.version,
        core_events: ['SYS_MODULE_LOADED', 'SYS_LIB_LOADED', 'SYS_DRIVER_LOADED'],
        state: {
          status: 'NOT_READY',
          flags: ['base'],
          modules: {},
          classes: {},
          interfaces: {},
          integrations: [],
          add_flag: function(flagname) {
            return this.sys.flags.push(flagname);
          },
          consider_preinit: function(preinit) {
            var cls, interface, lib, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3;
            if (preinit.abstract_base_classes != null) {
              _ref = preinit.abstract_base_classes;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                cls = _ref[_i];
                _this.sys.state.classes[cls.name] = cls;
                if ((cls.package != null) && (_this.sys.state.modules[cls.package] != null)) {
                  _this.sys.state.modules[cls.package].classes[cls.name] = cls;
                }
                if ((cls["export"] != null) && cls["export"] === 'private') {
                  continue;
                } else {
                  window[cls.name] = cls;
                }
              }
            }
            if (preinit.deferred_library_integrations != null) {
              _ref2 = preinit.deferred_library_integrations;
              for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
                lib = _ref2[_j];
                _this.sys.libraries.install(lib.name, lib.library);
              }
            }
            if (preinit.abstract_feature_interfaces != null) {
              _ref3 = preinit.abstract_feature_interfaces;
              for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
                interface = _ref3[_k];
                _this.sys.interfaces.install(interface.name, interface.adapter);
              }
            }
            return preinit;
          }
        },
        modules: {
          install: function(module, mountpoint_or_callback, callback) {
            var module_name, mountpoint, pass_parent, target_mod;
            if (mountpoint_or_callback == null) mountpoint_or_callback = null;
            if (callback == null) callback = null;
            if (mountpoint_or_callback != null) {
              if (typeof mountpoint_or_callback === 'function') {
                callback = mountpoint_or_callback;
                mountpoint = null;
              } else {
                mountpoint = mountpoint_or_callback;
              }
            }
            if (mountpoint != null) {
              if (!(_this[mountpoint] != null)) _this[mountpoint] = {};
              mountpoint = _this[mountpoint];
              pass_parent = true;
            } else {
              mountpoint = _this;
              pass_parent = false;
            }
            if (module.mount != null) {
              module_name = module.mount;
            } else {
              module_name = module.name.toLowerCase();
            }
            if ((module.events != null) && (_this.events != null)) {
              _this.events.register(module.events);
            }
            if (!(mountpoint[module_name] != null)) {
              if (pass_parent) {
                target_mod = mountpoint[module_name] = new module(_this, mountpoint, window);
                _this.sys.state.modules[module_name] = {
                  module: target_mod,
                  classes: {}
                };
              } else {
                target_mod = mountpoint[module_name] = new module(_this, window);
                _this.sys.state.modules[module_name] = {
                  module: target_mod,
                  classes: {}
                };
              }
            }
            if (module._init != null) module._init(_this);
            if ((_this.dev != null) && (_this.dev.verbose != null)) {
              _this.dev.verbose('ModuleLoader', 'Installed module:', target_mod, ' at mountpoint: ', mountpoint, ' under the name: ', module_name);
            }
            if (_this.events != null) {
              _this.events.trigger('SYS_MODULE_LOADED', {
                module: target_mod,
                mountpoint: mountpoint
              });
            }
            if (callback != null) callback(target_mod);
            return target_mod;
          }
        },
        libraries: {
          install: function(name, library, callback) {
            if (callback == null) callback = null;
            _this.lib[name.toLowerCase()] = library;
            _this.sys.state.integrations.push(name.toLowerCase());
            _this.dev.verbose('LibLoader', name + ' detected.');
            _this.events.trigger('SYS_LIB_LOADED', {
              name: name,
              library: library
            });
            if (callback != null) callback(library, name);
            return _this.lib[name.toLowerCase()];
          },
          resolve: function(name) {
            var lib, _i, _len, _ref;
            name = name.toLowerCase();
            _ref = _this.sys.state.integrations;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              lib = _ref[_i];
              if (lib !== name) {
                continue;
              } else {
                return _this.lib[name.toLowerCase()];
              }
            }
          }
        },
        interfaces: {
          install: function(name, adapter) {
            _this.dev.verbose('InterfaceLoader', 'Installed "' + name + '" interface.');
            _this.events.trigger('SYS_INTERFACE_LOADED', {
              name: name,
              adapter: adapter
            });
            _this.sys.state.interfaces[name] = {
              adapter: adapter,
              methods: adapter.methods
            };
            return _this.sys.state.interfaces[name];
          },
          resolve: function(name) {
            if (_this.sys.state.interfaces[name] != null) {
              return _this.sys.state.interfaces[name];
            } else {
              return false;
            }
          }
        },
        drivers: {
          query: {},
          loader: {},
          transport: {},
          storage: {},
          render: {},
          install: function(type, name, adapter, mountpoint, enabled, priority, callback) {
            if (callback == null) callback = null;
            _this.sys.drivers[type][name] = {
              name: name,
              driver: mountpoint,
              enabled: enabled,
              priority: priority,
              interface: adapter
            };
            if (callback != null) callback(_this.sys.drivers[type][name].driver);
            _this.events.trigger('SYS_DRIVER_LOADED', _this.sys.drivers[type][name]);
            return _this.sys.drivers[type][name];
          },
          resolve: function(type, name, strict) {
            var driver, priority_state, selected_driver;
            if (name == null) name = null;
            if (strict == null) strict = false;
            if (!(_this.sys.drivers[type] != null)) {
              apptools.dev.critical('CORE', 'Unkown driver type "' + type + '".');
              return;
            } else {
              if (name != null) {
                if (_this.sys.drivers[type][name] != null) {
                  return _this.sys.drivers[type][name].driver;
                } else {
                  if (strict) {
                    apptools.dev.critical('CORE', 'Could not resolve driver ', name, ' of type ', type, '.');
                  }
                }
                return false;
              }
            }
            priority_state = -1;
            selected_driver = false;
            for (driver in _this.sys.drivers[type]) {
              driver = _this.sys.drivers[type][driver];
              if (driver.priority > priority_state) {
                selected_driver = driver;
                break;
              }
            }
            return selected_driver;
          }
        },
        go: function() {
          _this.dev.log('Core', 'All systems go.');
          _this.sys.state.status = 'READY';
          return _this;
        }
      };
      this.sys.modules.install(CoreDevAPI, function(dev) {
        return dev.verbose('CORE', 'CoreDevAPI is up and running.');
      });
      this.sys.modules.install(CoreEventsAPI, function(events) {
        return events.register(_this.sys.core_events);
      });
      if (window.__apptools_preinit != null) {
        this.sys.state.consider_preinit(window.__apptools_preinit);
      }
      if ((window != null ? window.Modernizr : void 0) != null) {
        this.sys.libraries.install('Modernizr', window.Modernizr, function(lib, name) {
          return _this.load = function() {
            var fragments, _ref;
            fragments = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return (_ref = _this.lib.modernizr).load.apply(_ref, fragments);
          };
        });
      }
      if ((window != null ? window.jQuery : void 0) != null) {
        this.sys.libraries.install('jQuery', window.jQuery, function(lib, name) {
          _this.sys.drivers.install('query', 'jquery', _this.sys.state.classes.QueryDriver, _this.lib.jquery, true, 100, null);
          return _this.sys.drivers.install('transport', 'jquery', _this.sys.state.classes.RPCDriver, _this.lib.jquery, true, 100, null);
        });
      }
      if ((window != null ? window.Zepto : void 0) != null) {
        this.sys.libraries.install('Zepto', window.Zepto, function(lib, name) {
          _this.sys.drivers.install('query', 'zepto', _this.sys.state.classes.QueryDriver, _this.lib.zepto, true, 500, null);
          return _this.sys.drivers.install('transport', 'zepto', _this.sys.state.classes.RPCDriver, _this.lib.zepto, true, 500, null);
        });
      }
      if ((window != null ? window._ : void 0) != null) {
        this.sys.libraries.install('Underscore', window._, function(lib, name) {
          _this.sys.drivers.install('query', 'underscore', _this.sys.state.classes.QueryDriver, _this.lib.underscore, true, 50, null);
          return _this.sys.drivers.install('render', 'underscore', _this.sys.state.classes.RenderDriver, _this.lib.underscore, true, 50, null);
        });
      }
      if ((window != null ? window.Backbone : void 0) != null) {
        this.sys.libraries.install('Backbone', window.Backbone, function(library) {
          window.AppToolsView.prototype.apptools = _this;
          window.AppToolsModel.prototype.apptools = _this;
          window.AppToolsRouter.prototype.apptools = _this;
          return window.AppToolsCollection.prototype.apptools = _this;
        });
      }
      if ((window != null ? window.Lawnchair : void 0) != null) {
        this.sys.libraries.install('Lawnchair', window.Lawnchair, function(library) {
          return _this.sys.drivers.install('storage', 'lawnchair', _this.sys.state.classes.StorageDriver, _this.lib.lawnchair, true, 500, function(lawnchair) {
            return _this.dev.verbose('Lawnchair', 'Storage is currently stubbed. Come back later.');
          });
        });
      }
      if ((window != null ? window.amplify : void 0) != null) {
        this.sys.libraries.install('Amplify', window.amplify, function(library) {
          _this.sys.drivers.register('transport', 'amplify', _this.sys.state.classes.RPCDriver, _this.lib.amplify, true, 500, null);
          return _this.sys.drivers.register('storage', 'amplify', _this.sys.state.classes.StorageDriver, _this.lib.amplify, true, 100, null);
        });
      }
      if ((window != null ? window.Milk : void 0) != null) {
        this.sys.libraries.install('Milk', window.Milk, function(library) {
          return _this.sys.drivers.install('render', 'milk', _this.sys.state.classes.RenderDriver, _this.lib.milk, true, 100, function(milk) {
            return _this.dev.verbose('Milk', 'Render support is currently stubbed. Come back later.');
          });
        });
      }
      if ((window != null ? window.Mustache : void 0) != null) {
        this.sys.libraries.install('Mustache', window.Mustache, function(library) {
          return _this.sys.drivers.register('render', 'mustache', _this.sys.state.classes.RenderDriver, _this.lib.mustache, true, 500, function(mustache) {
            return _this.dev.verbose('Mustache', 'Render support is currently stubbed. Come back later.');
          });
        });
      }
      this.sys.modules.install(CoreModelAPI);
      this.sys.modules.install(CoreAgentAPI);
      this.sys.modules.install(CoreDispatchAPI);
      this.sys.modules.install(CoreRPCAPI);
      this.sys.modules.install(CorePushAPI);
      this.sys.modules.install(CoreUserAPI);
      this.sys.modules.install(CoreStorageAPI);
      this.sys.modules.install(CoreRenderAPI);
      if (((_ref = window.__apptools_preinit) != null ? _ref.deferred_core_modules : void 0) != null) {
        _ref2 = window.__apptools_preinit.deferred_core_modules;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          module = _ref2[_i];
          if (module.package != null) {
            this.sys.modules.install(module.module, module.package);
          } else {
            this.sys.modules.install(module.module);
          }
        }
      }
      return this.sys.go();
    }

    return AppTools;

  })();

  window.AppTools = AppTools;

  window.apptools = new AppTools(window);

  if (window.jQuery != null) {
    $.extend({
      apptools: window.apptools
    });
  } else {
    window.$ = function(id) {
      return document.getElementById(id);
    };
    window.$.apptools = window.apptools;
  }

}).call(this);
