(function() {
  var AppTools, AppToolsModel, AppToolsRouter, AppToolsView, CoreAPI, CoreAgentAPI, CoreDevAPI, CoreDispatchAPI, CoreEventsAPI, CorePushAPI, CoreRPCAPI, CoreStorageAPI, CoreUserAPI, Expand, Find, Milk, Parse, RPCAPI, RPCRequest, TemplateCache, key,
    __slice = Array.prototype.slice,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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

  CoreAPI = (function() {

    function CoreAPI() {}

    return CoreAPI;

  })();

  if (this.Backbone != null) {
    this.__apptools_preinit.backbone = true;
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
    this.AppToolsView = AppToolsView;
    this.AppToolsModel = AppToolsModel;
    this.AppToolsRouter = AppToolsRouter;
    if (typeof exports !== "undefined" && exports !== null) {
      exports['AppToolsView'] = AppToolsView;
      exports['AppToolsModel'] = AppToolsModel;
      exports['AppToolsRouter'] = AppToolsRouter;
    }
  }

  if (typeof exports !== "undefined" && exports !== null) {
    for (key in Milk) {
      exports[key] = Milk[key];
    }
    exports['CoreAPI'] = CoreAPI;
  } else {
    this.Milk = Milk;
    this.CoreAPI = CoreAPI;
  }

  CoreDevAPI = (function(_super) {

    __extends(CoreDevAPI, _super);

    function CoreDevAPI(apptools) {
      this.verbose = __bind(this.verbose, this);
      this.error = __bind(this.error, this);
      this.eventlog = __bind(this.eventlog, this);
      this.log = __bind(this.log, this);
      this.setDebug = __bind(this.setDebug, this);      this.config = {};
      this.environment = {};
      this.performance = {};
      this.debug = {
        logging: true,
        eventlog: true,
        verbose: true
      };
    }

    CoreDevAPI.prototype.setDebug = function(debug) {
      this.debug = debug;
      return console.log("[CoreDev] Debug has been set.", this.debug);
    };

    CoreDevAPI.prototype.log = function() {
      var context, message, module;
      module = arguments[0], message = arguments[1], context = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      if (!(context != null)) context = '{no context}';
      if (this.debug.logging === true) {
        console.log.apply(console, ["[" + module + "] INFO: " + message].concat(__slice.call(context)));
      }
    };

    CoreDevAPI.prototype.eventlog = function() {
      var context, sublabel;
      sublabel = arguments[0], context = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!(context != null)) context = '{no context}';
      if (this.debug.eventlog === true) {
        console.log.apply(console, ["[EventLog] " + sublabel].concat(__slice.call(context)));
      }
    };

    CoreDevAPI.prototype.error = function() {
      var context, message, module;
      module = arguments[0], message = arguments[1], context = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      if (this.debug.logging === true) {
        console.log.apply(console, ["[" + module + "] ERROR: " + message].concat(__slice.call(context)));
      }
    };

    CoreDevAPI.prototype.verbose = function() {
      var context, message, module;
      module = arguments[0], message = arguments[1], context = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      if (this.debug.verbose === true) {
        this.log.apply(this, [module, message].concat(__slice.call(context)));
      }
    };

    return CoreDevAPI;

  })(CoreAPI);

  CoreEventsAPI = (function(_super) {

    __extends(CoreEventsAPI, _super);

    function CoreEventsAPI(apptools) {
      var _this = this;
      this.registry = [];
      this.callchain = {};
      this.history = [];
      this.trigger = function() {
        var args, callback_directive, event, hook_error_count, hook_exec_count, result, _i, _len, _ref;
        event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        $.apptools.dev.verbose('Events', 'Triggered event.', event, args, _this.callchain[event]);
        if (__indexOf.call(_this.registry, event) >= 0) {
          hook_exec_count = 0;
          hook_error_count = 0;
          _ref = _this.callchain[event].hooks;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            callback_directive = _ref[_i];
            try {
              if (callback_directive.bridge === true) {
                _this.trigger.apply(_this, [callback_directive.event].concat(__slice.call(args)));
              }
              if (callback_directive.once === true && callback_directive.has_run === true) {
                continue;
              } else {
                result = callback_directive.fn.apply(callback_directive, args);
                hook_exec_count++;
                _this.history.push({
                  event: event,
                  callback: callback_directive,
                  args: args,
                  result: result
                });
                callback_directive.has_run = true;
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
          return {
            executed: hook_exec_count,
            errors: hook_error_count
          };
        } else {
          return false;
        }
      };
      this.register = function(name) {
        _this.registry.push(name);
        _this.callchain[name] = {
          hooks: []
        };
        apptools.dev.verbose('Events', 'Registered event.', name);
        return true;
      };
      this.hook = function(event, callback, once) {
        if (once == null) once = false;
        if (__indexOf.call(_this.registry, event) < 0) _this.register(event);
        _this.callchain[event].hooks.push({
          fn: callback,
          once: once,
          has_run: false,
          bridge: false
        });
        apptools.dev.verbose('Events', 'Hook registered on event.', event);
        return true;
      };
      this.bridge = function(from_events, to_events) {
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
              apptools.dev.verbose('Events', 'Bridging events.', source_ev, '->', target_ev);
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

  CoreAgentAPI = (function(_super) {

    __extends(CoreAgentAPI, _super);

    function CoreAgentAPI(apptools) {
      this._data = {};
      this.platform = {};
      this.capabilities = {};
      if (apptools.lib.modernizr != null) {
        this.capabilities = apptools.lib.modernizr;
      }
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
          mobile: mobile,
          webkit: $.browser.webkit,
          msie: $.browser.msie,
          opera: $.browser.opera,
          mozilla: $.browser.mozilla
        }
      };
      return this.capabilities.simple = {
        cookies: navigator.cookieEnabled,
        ajax: $.support.ajax
      };
    };

    return CoreAgentAPI;

  })(CoreAPI);

  CoreDispatchAPI = (function(_super) {

    __extends(CoreDispatchAPI, _super);

    function CoreDispatchAPI(bsdbot) {
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
        return $.apptools.dev.verbose('Dispatch', 'Dispatch startup signal received.');
      };
      this.expect = function(id, request, xhr) {
        _this.state.pending[id] = {
          request: request,
          callbacks: callbacks,
          xhr: xhr
        };
        return $.apptools.dev.verbose('Dispatch', 'Received EXPECT signal.', id, request, callbacks, xhr);
      };
      this.receive = function(raw_response) {
        var context, response, _base, _base2, _base3;
        response = JSON.parse(raw_response.data);
        $.apptools.dev.verbose('Dispatch', 'Parsed async message.', response);
        _this.state.history.received.push(raw_response);
        if (response.status === 'ok') {
          $.apptools.dev.verbose('Dispatch', 'Triggering deferred success callback.');
          _this.state.complete[response.id] = _this.state.pending[response.id];
          _this.state.complete[response.id].response = response;
          $.apptools.dev.log('RPC', 'Success', raw_response.data, response.status, _this.state.complete[response.id].xhr);
          $.apptools.api.rpc.lastResponse = raw_response.data;
          $.apptools.api.rpc.history[response.id].xhr = _this.state.complete[response.id].xhr;
          $.apptools.api.rpc.history[response.id].status = response.status;
          $.apptools.api.rpc.history[response.id].response = raw_response.data;
          context = {
            xhr: _this.state.complete[response.id].xhr,
            status: response.status,
            data: raw_response.data
          };
          $.apptools.events.trigger('RPC_SUCCESS', context);
          $.apptools.events.trigger('RPC_COMPLETE', context);
          return typeof (_base = _this.state.complete[response.id].callbacks).success === "function" ? _base.success(response.response.content) : void 0;
        } else if (response.status === 'notify') {
          $.apptools.dev.verbose('Dispatch', 'Received NOTIFY signal.');
          return typeof (_base2 = _this.state.pending[response.id].callbacks).notify === "function" ? _base2.notify(response.response.content) : void 0;
        } else {
          $.apptools.dev.error('Dispatch', 'Userland deferred task error. Calling error callback.', response);
          return typeof (_base3 = _this.state.pending[response.id].callbacks).error === "function" ? _base3.error(response.content) : void 0;
        }
      };
      this.error = function(error) {
        _this.state.error = true;
        _this.history.errors.push(error);
        return $.apptools.dev.error('Dispatch', 'Dispatch error state triggered.', error);
      };
      this.close = function() {
        _this.state.opened = false;
        _this.state.receiving = false;
        return $.apptools.dev.verbose('Dispatch', 'Dispatch shutdown signal received.');
      };
    }

    return CoreDispatchAPI;

  })(CoreAPI);

  CoreStorageAPI = (function(_super) {

    __extends(CoreStorageAPI, _super);

    function CoreStorageAPI(apptools) {
      var _this = this;
      apptools.events.register('STORAGE_INIT');
      apptools.events.register('STORAGE_READY');
      apptools.events.register('STORAGE_ERROR');
      apptools.events.register('STORAGE_ACTIVITY');
      apptools.events.register('COLLECTION_SCAN');
      apptools.events.register('COLLECTION_CREATE');
      apptools.events.register('COLLECTION_DESTROY');
      apptools.events.register('COLLECTION_UPDATE');
      apptools.events.register('COLLECTION_SYNC');
      apptools.events.register('STORAGE_READ');
      apptools.events.register('STORAGE_WRITE');
      apptools.events.register('STORAGE_DELETE');
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
      this.enable = function() {
        apptools.events.trigger('STORAGE_INIT');
        return apptools.events.trigger('STORAGE_READY');
      };
      apptools.events.bridge(['STORAGE_READ', 'STORAGE_WRITE', 'STORAGE_DELETE'], 'STORAGE_ACTIVITY');
      apptools.events.bridge(['COLLECTION_CREATE', 'COLLECTION_UPDATE', 'COLLECTION_DESTROY', 'COLLECTION_SYNC', 'COLLECTION_SCAN'], 'STORAGE_ACTIVITY');
    }

    return CoreStorageAPI;

  })(CoreAPI);

  RPCAPI = (function() {

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
      rpcMethod = function(params, callbacks, async, opts) {
        if (params == null) params = {};
        if (callbacks == null) callbacks = null;
        if (async == null) async = false;
        if (opts == null) opts = {};
        return (function(params, callbacks, async, opts) {
          var request;
          if (params == null) params = {};
          if (callbacks == null) callbacks = null;
          if (async == null) async = false;
          if (opts == null) opts = {};
          request = $.apptools.api.rpc.createRPCRequest({
            method: method,
            api: api,
            params: params || {},
            opts: opts || {},
            async: async || false
          });
          if (callbacks !== null) {
            return request.fulfill(callbacks);
          } else {
            return request;
          }
        })(params, callbacks, async, opts);
      };
      $.apptools.api.registerAPIMethod(api, method, base_uri, config);
      return rpcMethod;
    };

    return RPCAPI;

  })();

  RPCRequest = (function() {

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
        contentType: 'application/json; charset=utf-8'
      };
      if (id != null) this.envelope.id = id;
      if (opts != null) this.envelope.opts = opts;
      if (agent != null) this.envelope.agent = agent;
    }

    RPCRequest.prototype.fulfill = function() {
      var callbacks, config, defaultFailureCallback, defaultSuccessCallback,
        _this = this;
      callbacks = arguments[0], config = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!(callbacks != null ? callbacks.success : void 0)) {
        defaultSuccessCallback = function(context) {
          return $.apptools.dev.log('RPC', 'RPC succeeded but had no success callback.', _this);
        };
        callbacks.success = defaultSuccessCallback;
      }
      if (!(callbacks != null ? callbacks.failure : void 0)) {
        defaultFailureCallback = function(context) {
          return $.apptools.dev.error('RPC', 'RPC failed but had no failure callback.', _this);
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

  })();

  CoreRPCAPI = (function(_super) {

    __extends(CoreRPCAPI, _super);

    function CoreRPCAPI(apptools) {
      var original_xhr, _ref,
        _this = this;
      apptools.events.register('RPC_CREATE');
      apptools.events.register('RPC_FULFILL');
      apptools.events.register('RPC_SUCCESS');
      apptools.events.register('RPC_ERROR');
      apptools.events.register('RPC_COMPLETE');
      apptools.events.register('RPC_PROGRESS');
      if (window.amplify != null) {
        apptools.dev.verbose('RPC', 'AmplifyJS detected. Registering.');
        if (apptools != null ? (_ref = apptools.sys) != null ? _ref.drivers : void 0 : void 0) {
          apptools.sys.drivers.register('transport', 'amplify', window.amplify, true, true);
        }
      }
      this.base_rpc_uri = '/_api/rpc';
      original_xhr = $.ajaxSettings.xhr;
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
          }
        },
        config: {
          headers: {
            "X-ServiceClient": ["AppToolsJS//", [apptools.sys.version.major.toString(), apptools.sys.version.minor.toString(), apptools.sys.version.micro.toString(), apptools.sys.version.build.toString()].join('.'), "-", apptools.sys.version.release.toString()].join(''),
            "X-ServiceTransport": "AppTools-JSONRPC"
          }
        }
      };
      $.ajaxSetup({
        global: true,
        xhr: function() {
          return _this.internals.transports.xhr.factory();
        },
        headers: this.internals.config.headers
      });
      this.rpc = {
        lastRequest: null,
        lastFailure: null,
        lastResponse: null,
        action_prefix: null,
        alt_push_response: false,
        history: {},
        used_ids: [],
        factory: function(name, base_uri, methods, config) {
          return $.apptools.api[name] = new RPCAPI(name, base_uri, methods, config);
        },
        _assembleRPCURL: function(method, api, prefix, base_uri) {
          if (api == null) api = null;
          if (prefix == null) prefix = null;
          if (base_uri == null) base_uri = null;
          if (api === null && base_uri === null) {
            throw "[RPC] Error: Must specify either an API or base URI to generate an RPC endpoint.";
          } else {
            if (base_uri === null) {
              base_uri = $.apptools.api.base_rpc_uri + '/' + api;
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
          if (this.used_ids.length > 0) {
            id = Math.max.apply(this, this.used_ids) + 1;
            this.used_ids.push(id);
            return id;
          } else {
            this.used_ids.push(1);
            return 1;
          }
        },
        decodeRPCResponse: function(data, status, xhr, success, error) {
          return success(data, status);
        },
        createRPCRequest: function(config) {
          var request;
          request = new RPCRequest(this.provisionRequestID());
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
            request.setPush(this.alt_push_response);
          }
          $.apptools.dev.log('RPC', 'New Request', request, config);
          request.setAction(this._assembleRPCURL(request.method, request.api, this.action_prefix, this.base_rpc_uri));
          return request;
        },
        fulfillRPCRequest: function(config, request, callbacks) {
          var context;
          $.apptools.dev.log('RPC', 'Fulfill', config, request, callbacks);
          this.lastRequest = request;
          this.history[request.envelope.id] = {
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
                throw "[RPC] Error: Request must have an API or explicity BASE_URI.";
              } else {
                request.action = this._assembleRPCURL(request.method, request.api, this.action_prefix);
              }
            } else {
              request.action = this._assembleRPCURL(request.method, null, this.action_prefix, request.base_uri);
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
          $.apptools.events.trigger('RPC_FULFILL', context);
          (function(request, callbacks) {
            var amplify, xhr, xhr_action, xhr_settings, _ref2, _ref3,
              _this = this;
            apptools = window.apptools;
            xhr_settings = {
              resourceId: request.api + '.' + request.method,
              url: request.action,
              data: JSON.stringify(request.payload()),
              async: request.ajax.async,
              global: request.ajax.global,
              type: request.ajax.http_method,
              accepts: request.ajax.accepts,
              crossDomain: request.ajax.crossDomain,
              dataType: request.ajax.dataType,
              processData: false,
              ifModified: request.ajax.ifModified,
              contentType: request.ajax.contentType,
              beforeSend: function(xhr, settings) {
                $.apptools.api.rpc.history[request.envelope.id].xhr = xhr;
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
                $.apptools.dev.error('RPC', 'Error: ', {
                  error: error,
                  status: status,
                  xhr: xhr
                });
                $.apptools.api.rpc.lastFailure = error;
                $.apptools.api.rpc.history[request.envelope.id].xhr = xhr;
                $.apptools.api.rpc.history[request.envelope.id].status = status;
                $.apptools.api.rpc.history[request.envelope.id].failure = error;
                context = {
                  xhr: xhr,
                  status: status,
                  error: error
                };
                $.apptools.events.trigger('RPC_ERROR', context);
                $.apptools.events.trigger('RPC_COMPLETE', context);
                return callbacks != null ? typeof callbacks.failure === "function" ? callbacks.failure(error) : void 0 : void 0;
              },
              success: function(data, status, xhr) {
                if (data.status === 'ok') {
                  if (callbacks != null) {
                    if (typeof callbacks.status === "function") {
                      callbacks.status('success');
                    }
                  }
                  $.apptools.dev.log('RPC', 'Success', data, status, xhr);
                  $.apptools.api.rpc.lastResponse = data;
                  $.apptools.api.rpc.history[request.envelope.id].xhr = xhr;
                  $.apptools.api.rpc.history[request.envelope.id].status = status;
                  $.apptools.api.rpc.history[request.envelope.id].response = data;
                  context = {
                    xhr: xhr,
                    status: status,
                    data: data
                  };
                  $.apptools.events.trigger('RPC_SUCCESS', context);
                  $.apptools.events.trigger('RPC_COMPLETE', context);
                  return callbacks != null ? typeof callbacks.success === "function" ? callbacks.success(data.response.content, data.response.type, data) : void 0 : void 0;
                } else if (data.status === 'wait') {
                  if (callbacks != null) {
                    if (typeof callbacks.status === "function") {
                      callbacks.status('wait');
                    }
                  }
                  $.apptools.dev.log('RPC', 'PushWait', data, status, xhr);
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
                  return $.apptools.push.internal.expect(request.envelope.id, request, xhr);
                } else if (data.status === 'failure') {
                  if (callbacks != null) {
                    if (typeof callbacks.status === "function") {
                      callbacks.status('error');
                    }
                  }
                  $.apptools.dev.error('RPC', 'Error: ', {
                    error: error,
                    status: status,
                    xhr: xhr
                  });
                  $.apptools.api.rpc.lastFailure = error;
                  $.apptools.api.rpc.history[request.envelope.id].xhr = xhr;
                  $.apptools.api.rpc.history[request.envelope.id].status = status;
                  $.apptools.api.rpc.history[request.envelope.id].failure = error;
                  context = {
                    xhr: xhr,
                    status: status,
                    error: error
                  };
                  $.apptools.events.trigger('RPC_ERROR', context);
                  $.apptools.events.trigger('RPC_COMPLETE', context);
                  return callbacks != null ? typeof callbacks.failure === "function" ? callbacks.failure(error) : void 0 : void 0;
                }
              },
              statusCode: {
                404: function() {
                  $.apptools.dev.error('RPC', 'HTTP/404', 'Could not resolve RPC action URI.');
                  return $.apptools.events.trigger('RPC_ERROR', {
                    message: 'RPC 404: Could not resolve RPC action URI.',
                    code: 404
                  });
                },
                403: function() {
                  $.apptools.dev.error('RPC', 'HTTP/403', 'Not authorized to access the specified endpoint.');
                  return $.apptools.events.trigger('RPC_ERROR', {
                    message: 'RPC 403: Not authorized to access the specified endpoint.',
                    code: 403
                  });
                },
                500: function() {
                  $.apptools.dev.error('RPC', 'HTTP/500', 'Internal server error.');
                  return $.apptools.events.trigger('RPC_ERROR', {
                    message: 'RPC 500: Woops! Something went wrong. Please try again.',
                    code: 500
                  });
                }
              }
            };
            if ((_ref2 = $.apptools) != null ? (_ref3 = _ref2.sys) != null ? _ref3.drivers : void 0 : void 0) {
              amplify = $.apptools.sys.drivers.resolve('transport', 'amplify');
              if ((amplify != null) && amplify === !false) {
                $.apptools.dev.verbose('RPC', 'Fulfilling with AmplifyJS adapter.');
                xhr_action = amplify.request;
                xhr = xhr_action(xhr_settings);
              } else {
                $.apptools.dev.verbose('RPC', 'Fulfilling with AJAX adapter.', xhr_settings);
                xhr = $.ajax(xhr_settings.url, xhr_settings);
              }
            } else {
              $.apptools.dev.verbose('RPC', 'Fulfilling with AJAX adapter.', xhr_settings);
              xhr = $.ajax(xhr_settings.url, xhr_settings);
            }
            return $.apptools.dev.verbose('RPC', 'Resulting XHR: ', xhr);
          })(request, callbacks);
          return {
            id: request.envelope.id,
            request: request
          };
        }
      };
      this.ext = null;
      this.registerAPIMethod = function(api, name, base_uri, config) {
        var amplify, base_settings, resourceId, _ref2, _ref3;
        if ((_ref2 = $.apptools) != null ? (_ref3 = _ref2.sys) != null ? _ref3.drivers : void 0 : void 0) {
          amplify = $.apptools.sys.drivers.resolve('transport', 'amplify');
          if (amplify !== false) {
            $.apptools.dev.log('RPCAPI', 'Registering request procedure "' + api + '.' + name + '" with AmplifyJS.');
            resourceId = api + '.' + name;
            base_settings = {
              accepts: 'application/json',
              type: 'POST',
              dataType: 'json',
              contentType: 'application/json',
              url: this.api._assembleRPCURL(name, api, null, base_uri),
              decoder: this.api.decodeRPCResponse
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

  window.RPCAPI = RPCAPI;

  window.RPCRequest = RPCRequest;

  window.CoreRPCAPI = CoreRPCAPI;

  CoreUserAPI = (function(_super) {

    __extends(CoreUserAPI, _super);

    function CoreUserAPI(apptools) {
      var _this = this;
      this.setUserInfo = function(userinfo) {
        $.apptools.dev.log('UserAPI', 'Setting server-injected userinfo: ', userinfo);
        return _this.current_user = userinfo != null ? userinfo.current_user : void 0;
      };
    }

    return CoreUserAPI;

  })(CoreAPI);

  CorePushAPI = (function(_super) {

    __extends(CorePushAPI, _super);

    function CorePushAPI(apptools) {
      var _this = this;
      apptools.events.register('PUSH_INIT');
      apptools.events.register('PUSH_READY');
      apptools.events.register('PUSH_STATE_CHANGE');
      apptools.events.register('PUSH_CHANNEL_OPEN');
      apptools.events.register('PUSH_SOCKET_ESTABLISH');
      apptools.events.register('PUSH_SOCKET_ACTIVITY');
      apptools.events.register('PUSH_SOCKET_ACTIVITY_FINISH');
      apptools.events.register('PUSH_SOCKET_ERROR');
      apptools.events.register('PUSH_CHANNEL_CLOSE');
      this.state = {
        ready: false,
        status: null,
        transport: {
          socket: null,
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
      apptools.events.hook('PUSH_READY', function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return (_ref = $.apptools.events).trigger.apply(_ref, ['PUSH_STATE_CHANGE'].concat(__slice.call(args)));
      });
      apptools.events.hook('PUSH_SOCKET_ESTABLISH', function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return (_ref = $.apptools.events).trigger.apply(_ref, ['PUSH_STATE_CHANGE'].concat(__slice.call(args)));
      });
      apptools.events.hook('PUSH_SOCKET_ERROR', function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return (_ref = $.apptools.events).trigger.apply(_ref, ['PUSH_STATE_CHANGE'].concat(__slice.call(args)));
      });
      apptools.events.hook('PUSH_CHANNEL_OPEN', function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        (_ref = $.apptools.events).trigger.apply(_ref, ['PUSH_STATE_CHANGE'].concat(__slice.call(args)));
        return $.apptools.api.rpc.alt_push_response = true;
      });
      apptools.events.hook('PUSH_CHANNEL_CLOSE', function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        (_ref = $.apptools.events).trigger.apply(_ref, ['PUSH_STATE_CHANGE'].concat(__slice.call(args)));
        return $.apptools.api.rpc.alt_push_response = false;
      });
      this.events = {
        on_open: function() {
          $.apptools.dev.verbose('PushSocket', 'Message transport opened.');
          _this.state.status = 'ready';
          return apptools.events.trigger('PUSH_CHANNEL_OPEN', _this.state);
        },
        on_message: function(payload) {
          var _base;
          $.apptools.dev.verbose('PushSocket', 'Message received.', payload);
          _this.state.status = 'receiving';
          apptools.events.trigger('PUSH_SOCKET_ACTIVITY', _this.state);
          if (typeof (_base = _this.state.callbacks).activity === "function") {
            _base.activity(payload);
          }
          return apptools.events.trigger('PUSH_SOCKET_ACTIVITY_FINISH', _this.state);
        },
        on_error: function(error) {
          $.apptools.dev.error('PushSocket', 'Message transport error.', error);
          _this.state.status = 'error';
          return apptools.events.trigger('PUSH_SOCKET_ERROR', _this.state);
        },
        on_close: function() {
          $.apptools.dev.verbose('PushSocket', 'Message transport closed.');
          _this.state.status = 'close';
          _this.state.ready = false;
          return apptools.events.trigger('PUSH_CHANNEL_CLOSE', _this.state);
        }
      };
      this.internal = {
        open_channel: function(token) {
          apptools.events.trigger('PUSH_INIT', token);
          _this.state.config.token = token;
          _this.state.transport.channel = new goog.appengine.Channel(_this.state.config.token);
          return _this.internal;
        },
        open_socket: function() {
          _this.state.transport.socket = _this.state.transport.channel.open();
          apptools.events.trigger('PUSH_SOCKET_ESTABLISH', _this.state.transport.socket);
          _this.state.transport.socket.onopen = _this.events.on_open;
          _this.state.transport.socket.onmessage = _this.events.on_message;
          _this.state.transport.socket.onerror = _this.events.on_error;
          _this.state.transport.socket.onclose = _this.events.on_close;
          return _this.internal;
        },
        listen: function(callbacks) {
          _this.state.callbacks = _.defaults(callbacks, _this.state.callbacks);
          _this.state.ready = true;
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
      this.establish = function(token, callbacks) {
        _this.state.status = 'init';
        _this.internal.open_channel(token).open_socket().listen(callbacks);
        return _this;
      };
    }

    return CorePushAPI;

  })(CoreAPI);

  AppTools = (function() {

    function AppTools(window) {
      var _this = this;
      this.sys = {
        version: {
          major: 0,
          minor: 1,
          micro: 3,
          build: 02062011,
          release: "ALPHA"
        }
      };
      this.lib = {};
      if ((window != null ? window.Modernizr : void 0) != null) {
        this.lib.modernizr = window.Modernizr;
        this.load = function(fragment) {
          return _this.lib.modernizr.load(fragment);
        };
      }
      if ((window != null ? window.Backbone : void 0) != null) {
        this.lib.backbone = window.Backbone;
      }
      if ((window != null ? window.Lawnchair : void 0) != null) {
        this.lib.lawnchair = window.Lawnchair;
      }
      if ((window != null ? window.amplify : void 0) != null) {
        this.lib.amplify = window.amplify;
      }
      if ((window != null ? window.jQuery : void 0) != null) {
        this.lib.jquery = window.jQuery;
      }
      this.dev = new CoreDevAPI(this);
      this.events = new CoreEventsAPI(this);
      this.agent = new CoreAgentAPI(this);
      this.agent.discover();
      this.dispatch = new CoreDispatchAPI(this);
      this.rpc = new CoreRPCAPI(this);
      this.model = new CoreModelAPI(this);
      this.api = new CoreAPIBridge(this);
      this.user = new CoreUserAPI(this);
      this.push = new CorePushAPI(this);
      return this;
    }

    return AppTools;

  })();

  window.AppTools = AppTools;

  window.apptools = new AppTools();

  if (typeof $ !== "undefined" && $ !== null) {
    $.extend({
      apptools: window.apptools
    });
  }

}).call(this);
