var Lawnchair = function () {
    // lawnchair requires json
    if (!JSON) throw 'JSON unavailable! Include http://www.json.org/json2.js to fix.';
    // options are optional; callback is not
    if (arguments.length <= 2 && arguments.length > 0) {
        var callback = (typeof arguments[0] === 'function') ? arguments[0] : arguments[1],   options  = (typeof arguments[0] === 'function') ? {} : arguments[0];
    } else {
        throw 'Incorrect # of ctor args!';
    }
    // TODO perhaps allow for pub/sub instead?
    if (typeof callback !== 'function') throw 'No callback was provided';

    // ensure we init with this set to the Lawnchair prototype
    var self = (!(this instanceof Lawnchair))
             ? new Lawnchair(options, callback)
             : this

    // default configuration
    self.record = options.record || 'record'  // default for records
    self.name   = options.name   || 'records' // default name for underlying store

    // mixin first valid  adapter
    var adapter
    // if the adapter is passed in we try to load that only
    if (options.adapter) {
        adapter = Lawnchair.adapters[self.indexOf(Lawnchair.adapters, options.adapter)]
        adapter = adapter.valid() ? adapter : undefined
    // otherwise find the first valid adapter for this env
    }
    else {
        for (var i = 0, l = Lawnchair.adapters.length; i < l; i++) {
            adapter = Lawnchair.adapters[i].valid() ? Lawnchair.adapters[i] : undefined
            if (adapter) break
        }
    }

    // we have failed
    if (!adapter) throw 'No valid adapter.'

    // yay! mixin the adapter
    for (var j in adapter){
        self[j] = adapter[j];
    }

    // call init for each mixed in plugin
    for (var i = 0, l = Lawnchair.plugins.length; i < l; i++)
        Lawnchair.plugins[i].call(self)

    // init the adapter
    self.init(options, callback);

    // called as a function or as a ctor with new always return an instance
    return self
}

Lawnchair.adapters = [];

/**
 * queues an adapter for mixin
 * ===
 * - ensures an adapter conforms to a specific interface
 *
 */
Lawnchair.adapter = function (id, obj) {
    // add the adapter id to the adapter obj
    // ugly here for a  cleaner dsl for implementing adapters
    obj['adapter'] = id;
    // methods required to implement a lawnchair adapter
    var implementing = 'adapter valid init keys save batch get exists all remove nuke'.split(' ')
    ,   indexOf = this.prototype.indexOf;
    // mix in the adapter
    for (var i in obj) {
        if (indexOf(implementing, i) === -1) throw 'Invalid adapter! Nonstandard method: ' + i
    }
    // if we made it this far the adapter interface is valid
    Lawnchair.adapters.push(obj);
    return obj
}

Lawnchair.plugins = []

/**
 * generic shallow extension for plugins
 * ===
 * - if an init method is found it registers it to be called when the lawnchair is inited
 * - yes we could use hasOwnProp but nobody here is an asshole
 */
Lawnchair.plugin = function (obj) {
    for (var i in obj)
        i === 'init' ? Lawnchair.plugins.push(obj[i]) : this.prototype[i] = obj[i]
}

/**
 * helpers
 *
 */
Lawnchair.prototype = {

    isArray: Array.isArray || function(o) { return Object.prototype.toString.call(o) === '[object Array]' },

    /**
     * this code exists for ie8... for more background see:
     * http://www.flickr.com/photos/westcoastlogic/5955365742/in/photostream
     */
    indexOf: function(ary, item, i, l) {
        if (ary.indexOf) return ary.indexOf(item)
        for (i = 0, l = ary.length; i < l; i++) if (ary[i] === item) return i
        return -1
    },

    // awesome shorthand callbacks as strings. this is shameless theft from dojo.
    lambda: function (callback) {
        return this.fn(this.record, callback)
    },

    // first stab at named parameters for terse callbacks; dojo: first != best // ;D
    fn: function (name, callback) {
        return typeof callback == 'string' ? new Function(name, callback) : callback
    },

    // returns a unique identifier (by way of Backbone.localStorage.js)
    // TODO investigate smaller UUIDs to cut on storage cost
    uuid: function () {
        var S4 = function () {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    },

    // a classic iterator
    each: function (callback) {
        var cb = this.lambda(callback)
        // iterate from chain
        if (this.__results) {
            for (var i = 0, l = this.__results.length; i < l; i++) cb.call(this, this.__results[i], i)
        }
        // otherwise iterate the entire collection
        else {
            this.all(function(r) {
                for (var i = 0, l = r.length; i < l; i++) cb.call(this, r[i], i)
            })
        }
        return this
    }
// --
};
window.LawnchairDOM = Lawnchair.adapter('dom', {
    // ensure we are in an env with localStorage
    valid: function () {
        return !!window.Storage
    },

    init: function (options, callback) {
        // yay dom!
        this.storage = window.localStorage
        // indexer helper code
        var self = this
        // the indexer is an encapsulation of the helpers needed to keep an ordered index of the keys
        this.indexer = {
            // the key
            key: self.name + '._index_',
            // returns the index
            all: function() {
                var a = JSON.parse(self.storage.getItem(this.key))
                if (a == null) self.storage.setItem(this.key, JSON.stringify([])) // lazy init
                return JSON.parse(self.storage.getItem(this.key))
            },
            // adds a key to the index
            add: function (key) {
                var a = this.all()
                a.push(key)
                self.storage.setItem(this.key, JSON.stringify(a))
            },
            // deletes a key from the index
            del: function (key) {
                var a = this.all(), r = []
                // FIXME this is crazy inefficient but I'm in a strata meeting and half concentrating
                for (var i = 0, l = a.length; i < l; i++) {
                    if (a[i] != key) r.push(a[i])
                }
                self.storage.setItem(this.key, JSON.stringify(r))
            },
            // returns index for a key
            find: function (key) {
                var a = this.all()
                for (var i = 0, l = a.length; i < l; i++) {
                    if (key === a[i]) return i
                }
                return false
            }
        }

        if (callback) this.fn(this.name, callback).call(this, this)
    },

    save: function (obj, callback) {
        var key = obj.key || this.uuid()
        // if the key is not in the index push it on
        if (!this.indexer.find(key)) this.indexer.add(key)
        // now we kil the key and use it in the store colleciton
        delete obj.key;
        this.storage.setItem(key, JSON.stringify(obj))
        if (callback) {
            obj.key = key
            this.lambda(callback).call(this, obj)
        }
        return this
    },

    batch: function (ary, callback) {
        var saved = []
        // not particularily efficient but this is more for sqlite situations
        for (var i = 0, l = ary.length; i < l; i++) {
            this.save(ary[i], function(r){
                saved.push(r)
            })
        }
        if (callback) this.lambda(callback).call(this, saved)
        return this
    },

    // accepts [options], callback
    keys: function() {
        // TODO support limit/offset options here
        var limit = options.limit || null
        ,   offset = options.offset || 0
        if (callback) this.lambda(callback).call(this, this.indexer.all())
    },

    get: function (key, callback) {
        if (this.isArray(key)) {
            var r = []
            for (var i = 0, l = key.length; i < l; i++) {
                var obj = JSON.parse(this.storage.getItem(key[i]))
                if (obj) {
                    obj.key = key[i]
                    r.push(obj)
                }
            }
            if (callback) this.lambda(callback).call(this, r)
        } else {
            var obj = JSON.parse(this.storage.getItem(key))
            if (obj) obj.key = key
            if (callback) this.lambda(callback).call(this, obj)
        }
        return this
    },
    // NOTE adapters cannot set this.__results but plugins do
    // this probably should be reviewed
    all: function (callback) {
        var idx = this.indexer.all()
        ,   r   = []
        ,   o
        for (var i = 0, l = idx.length; i < l; i++) {
            o = JSON.parse(this.storage.getItem(idx[i]))
            o.key = idx[i]
            r.push(o)
        }
        if (callback) this.fn(this.name, callback).call(this, r)
        return this
    },

    remove: function (keyOrObj, callback) {
        var key = typeof keyOrObj === 'string' ? keyOrObj : keyOrObj.key
        this.indexer.del(key)
        this.storage.removeItem(key)
        if (callback) this.lambda(callback).call(this)
        return this
    },

    nuke: function (callback) {
        this.all(function(r) {
            for (var i = 0, l = r.length; i < l; i++) {
                this.remove(r[i]);
            }
            if (callback) this.lambda(callback).call(this)
        })
        return this
    }
});
window.LawnchairWindowName = Lawnchair.adapter('window-name', (function(index, store) {

    var data = window.top.name ? JSON.parse(window.top.name) : {}

    return {

        valid: function () {
            return typeof window.top.name != 'undefined'
        },

        init: function (options, callback) {
            data[this.name] = {index:[],store:{}}
            index = data[this.name].index
            store = data[this.name].store
            this.fn(this.name, callback).call(this, this)
        },

        keys: function (callback) {
            this.fn('keys', callback).call(this, index)
            return this
        },

        save: function (obj, cb) {
            // data[key] = value + ''; // force to string
            // window.top.name = JSON.stringify(data);
            var key = obj.key || this.uuid()
            if (obj.key) delete obj.key
            this.exists(key, function(exists) {
                if (!exists) index.push(key)
                store[key] = obj
                window.top.name = JSON.stringify(data) // TODO wow, this is the only diff from the memory adapter
                if (cb) {
                    obj.key = key
                    this.lambda(cb).call(this, obj)
                }
            })
            return this
        },

        batch: function (objs, cb) {
            var r = []
            for (var i = 0, l = objs.length; i < l; i++) {
                this.save(objs[i], function(record) {
                    r.push(record)
                })
            }
            if (cb) this.lambda(cb).call(this, r)
            return this
        },

        get: function (keyOrArray, cb) {
            var r;
            if (this.isArray(keyOrArray)) {
                r = []
                for (var i = 0, l = keyOrArray.length; i < l; i++) {
                    r.push(store[keyOrArray[i]])
                }
            } else {
                r = store[keyOrArray]
                if (r) r.key = keyOrArray
            }
            if (cb) this.lambda(cb).call(this, r)
            return this
        },

        exists: function (key, cb) {
            this.lambda(cb).call(this, !!(store[key]))
            return this
        },

        all: function (cb) {
            var r = []
            for (var i = 0, l = index.length; i < l; i++) {
                var obj = store[index[i]]
                obj.key = index[i]
                r.push(obj)
            }
            this.fn(this.name, cb).call(this, r)
            return this
        },

        remove: function (keyOrArray, cb) {
            var del = this.isArray(keyOrArray) ? keyOrArray : [keyOrArray]
            for (var i = 0, l = del.length; i < l; i++) {
                delete store[del[i]]
                index.splice(this.indexOf(index, del[i]), 1)
            }
            window.top.name = JSON.stringify(data)
            if (cb) this.lambda(cb).call(this)
            return this
        },

        nuke: function (cb) {
            storage = {}
            index = []
            window.top.name = JSON.stringify(data)
            if (cb) this.lambda(cb).call(this)
            return this
        }
    }
/////
})());
window.LawnchairIndexedDB = Lawnchair.adapter('indexed-db', (function(){

  function fail(e, i) { console.log('error in indexed-db adapter!', e, i); debugger; } ;

  function getIDB(){
    return window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.oIndexedDB || window.msIndexedDB;
  };



  return {

    valid: function() { return !!getIDB(); },

    init:function(options, callback) {
        this.idb = getIDB();
        this.waiting = [];
        var request = this.idb.open(this.name);
        var self = this;
        var cb = self.fn(self.name, callback);
        var win = function(){ return cb.call(self, self); }

        request.onsuccess = function(event) {
           self.db = request.result;

            if(self.db.version != "1.0") {
              var setVrequest = self.db.setVersion("1.0");
              // onsuccess is the only place we can create Object Stores
              setVrequest.onsuccess = function(e) {
                  self.store = self.db.createObjectStore("teststore", { autoIncrement: true} );
                  for (var i = 0; i < self.waiting.length; i++) {
                      self.waiting[i].call(self);
                  }
                  self.waiting = [];
                  win();
              };
              setVrequest.onerror = function(e) {
                  console.log("Failed to create objectstore " + e);
                  fail(e);
              }
            } else {
                self.store = {};
                for (var i = 0; i < self.waiting.length; i++) {
                      self.waiting[i].call(self);
                }
                self.waiting = [];
                win();
            }
        }
        request.onerror = fail;
    },

    save:function(obj, callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.save(obj, callback);
            });
            return;
         }

         var self = this;
         var win  = function (e) { if (callback) { obj.key = e.target.result; self.lambda(callback).call(self, obj) }};

         var trans = this.db.transaction(["teststore"], webkitIDBTransaction.READ_WRITE, 0);
         var store = trans.objectStore("teststore");
         var request = obj.key ? store.put(obj, obj.key) : store.put(obj);

         request.onsuccess = win;
         request.onerror = fail;

         return this;
    },

    // FIXME this should be a batch insert / just getting the test to pass...
    batch: function (objs, cb) {

        var results = []
        ,   done = false
        ,   self = this

        var updateProgress = function(obj) {
            results.push(obj)
            done = results.length === objs.length
        }

        var checkProgress = setInterval(function() {
            if (done) {
                if (cb) self.lambda(cb).call(self, results)
                clearInterval(checkProgress)
            }
        }, 200)

        for (var i = 0, l = objs.length; i < l; i++)
            this.save(objs[i], updateProgress)

        return this
    },


    get:function(key, callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.get(key, callback);
            });
            return;
        }


        var self = this;
        var win  = function (e) { if (callback) { self.lambda(callback).call(self, e.target.result) }};


        if (!this.isArray(key)){
            var req = this.db.transaction("teststore").objectStore("teststore").get(key);

            req.onsuccess = win;
            req.onerror = function(event) {
                console.log("Failed to find " + key);
                fail(event);
            };

        // FIXME: again the setInterval solution to async callbacks..
        } else {

            // note: these are hosted.
            var results = []
            ,   done = false
            ,   keys = key

            var updateProgress = function(obj) {
                results.push(obj)
                done = results.length === keys.length
            }

            var checkProgress = setInterval(function() {
                if (done) {
                    if (callback) self.lambda(callback).call(self, results)
                    clearInterval(checkProgress)
                }
            }, 200)

            for (var i = 0, l = keys.length; i < l; i++)
                this.get(keys[i], updateProgress)

        }

        return this;
    },

    all:function(callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.all(callback);
            });
            return;
        }
        var cb = this.fn(this.name, callback) || undefined;
        var self = this;
        var objectStore = this.db.transaction("teststore").objectStore("teststore");
        var toReturn = [];
        objectStore.openCursor().onsuccess = function(event) {
          var cursor = event.target.result;
          if (cursor) {
               toReturn.push(cursor.value);
               cursor.continue();
          }
          else {
              if (cb) cb.call(self, toReturn);
          }
        };
        return this;
    },

    remove:function(keyOrObj, callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.remove(keyOrObj, callback);
            });
            return;
        }
        if (typeof keyOrObj == "object") {
            keyOrObj = keyOrObj.key;
        }
        var self = this;
        var win  = function () { if (callback) self.lambda(callback).call(self) };

        var request = this.db.transaction(["teststore"], webkitIDBTransaction.READ_WRITE).objectStore("teststore").delete(keyOrObj);
        request.onsuccess = win;
        request.onerror = fail;
        return this;
    },

    nuke:function(callback) {
        if(!this.store) {
            this.waiting.push(function() {
                this.nuke(callback);
            });
            return;
        }

        var self = this
        ,   win  = callback ? function() { self.lambda(callback).call(self) } : function(){};

        try {
            this.db
                .transaction(["teststore"], webkitIDBTransaction.READ_WRITE)
                .objectStore("teststore").clear().onsuccess = win;

        } catch(e) {
            fail();
        }
        return this;
    }

  };

})());
window.LawnchairWebkitSQLite = Lawnchair.adapter('webkit-sqlite', (function () {
    // private methods
    var fail = function (e, i) { console.log('error in sqlite adaptor!', e, i) }
    ,   now  = function () { return new Date() } // FIXME need to use better date fn
    // not entirely sure if this is needed...
    if (!Function.prototype.bind) {
        Function.prototype.bind = function( obj ) {
            var slice = [].slice
            ,   args  = slice.call(arguments, 1)
            ,   self  = this
            ,   nop   = function () {}
            ,   bound = function () {
                    return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments))) 
                }
            nop.prototype   = self.prototype
            bound.prototype = new nop()
            return bound
        }
    }

    // public methods
    return {

        valid: function() { return !!(window.openDatabase) },

        init: function (options, callback) {
            var that   = this
            ,   cb     = that.fn(that.name, callback)
            ,   create = "CREATE TABLE IF NOT EXISTS " + this.name + " (id NVARCHAR(32) UNIQUE PRIMARY KEY, value TEXT, timestamp REAL)"
            ,   win    = function(){ return cb.call(that, that); }
            // open a connection and create the db if it doesn't exist
            this.db = openDatabase(this.name, '1.0.0', this.name, 65536)
            this.db.transaction(function (t) {
                t.executeSql(create, [], win, fail)
            })
        },

        keys:  function (callback) {
            var cb   = this.lambda(callback)
            ,   that = this
            ,   keys = "SELECT id FROM " + this.name + " ORDER BY timestamp DESC"

            this.db.transaction(function(t) {
                var win = function (xxx, results) {
                    if (results.rows.length == 0 ) {
                        cb.call(that, [])
                    } else {
                        var r = [];
                        for (var i = 0, l = results.rows.length; i < l; i++) {
                            r.push(results.rows.item(i).id);
                        }
                        cb.call(that, r)
                    }
                }
                t.executeSql(keys, [], win, fail)
            })
            return this
        },
        // you think thats air you're breathing now?
        save: function (obj, callback) {
            var that = this
            ,   id   = obj.key || that.uuid()
            ,   ins  = "INSERT INTO " + this.name + " (value, timestamp, id) VALUES (?,?,?)"
            ,   up   = "UPDATE " + this.name + " SET value=?, timestamp=? WHERE id=?"
            ,   win  = function () { if (callback) { obj.key = id; that.lambda(callback).call(that, obj) }}
            ,   val  = [now(), id]
            // existential
            that.exists(obj.key, function(exists) {
                // transactions are like condoms
                that.db.transaction(function(t) {
                    // TODO move timestamp to a plugin
                    var insert = function (obj) {
                        val.unshift(JSON.stringify(obj))
                        t.executeSql(ins, val, win, fail)
                    }
                    // TODO move timestamp to a plugin
                    var update = function (obj) {
                        delete(obj.key)
                        val.unshift(JSON.stringify(obj))
                        t.executeSql(up, val, win, fail)
                    }
                    // pretty
                    exists ? update(obj) : insert(obj)
                })
            });
            return this
        },

        // FIXME this should be a batch insert / just getting the test to pass...
        batch: function (objs, cb) {

            var results = []
            ,   done = false
            ,   that = this

            var updateProgress = function(obj) {
                results.push(obj)
                done = results.length === objs.length
            }

            var checkProgress = setInterval(function() {
                if (done) {
                    if (cb) that.lambda(cb).call(that, results)
                    clearInterval(checkProgress)
                }
            }, 200)

            for (var i = 0, l = objs.length; i < l; i++)
                this.save(objs[i], updateProgress)

            return this
        },

        get: function (keyOrArray, cb) {
            var that = this
            ,   sql  = ''
            // batch selects support
            if (this.isArray(keyOrArray)) {
                sql = 'SELECT id, value FROM ' + this.name + " WHERE id IN ('" + keyOrArray.join("','") + "')"
            } else {
                sql = 'SELECT id, value FROM ' + this.name + " WHERE id = '" + keyOrArray + "'"
            }
            // FIXME
            // will always loop the results but cleans it up if not a batch return at the end..
            // in other words, this could be faster
            var win = function (xxx, results) {
                var o = null
                ,   r = []
                if (results.rows.length) {
                    for (var i = 0, l = results.rows.length; i < l; i++) {
                        o = JSON.parse(results.rows.item(i).value)
                        o.key = results.rows.item(i).id
                        r.push(o)
                    }
                }
                if (!that.isArray(keyOrArray)) r = r.length ? r[0] : null
                if (cb) that.lambda(cb).call(that, r)
            }
            this.db.transaction(function(t){ t.executeSql(sql, [], win, fail) })
            return this
        },

        exists: function (key, cb) {
            var is = "SELECT * FROM " + this.name + " WHERE id = ?"
            ,   that = this
            ,   win = function(xxx, results) { if (cb) that.fn('exists', cb).call(that, (results.rows.length > 0)) }
            this.db.transaction(function(t){ t.executeSql(is, [key], win, fail) })
            return this
        },

        all: function (callback) {
            var that = this
            ,   all  = "SELECT * FROM " + this.name
            ,   r    = []
            ,   cb   = this.fn(this.name, callback) || undefined
            ,   win  = function (xxx, results) {
                if (results.rows.length != 0) {
                    for (var i = 0, l = results.rows.length; i < l; i++) {
                        var obj = JSON.parse(results.rows.item(i).value)
                        obj.key = results.rows.item(i).id
                        r.push(obj)
                    }
                }
                if (cb) cb.call(that, r)
            }

            this.db.transaction(function (t) {
                t.executeSql(all, [], win, fail)
            })
            return this
        },

        remove: function (keyOrObj, cb) {
            var that = this
            ,   key  = typeof keyOrObj === 'string' ? keyOrObj : keyOrObj.key
            ,   del  = "DELETE FROM " + this.name + " WHERE id = ?"
            ,   win  = function () { if (cb) that.lambda(cb).call(that) }

            this.db.transaction( function (t) {
                t.executeSql(del, [key], win, fail);
            });

            return this;
        },

        nuke: function (cb) {
            var nuke = "DELETE FROM " + this.name
            ,   that = this
            ,   win  = cb ? function() { that.lambda(cb).call(that) } : function(){}
                this.db.transaction(function (t) {
                t.executeSql(nuke, [], win, fail)
            })
            return this
        }
//////
}})());
window.LawnchairIEUserdata = Lawnchair.adapter('ie-userdata', {
  valid: function () {
    return typeof(document.body.addBehavior) != 'undefined';
  },
    init:function(){
        var s = document.createElement('span');
        s.style.behavior = 'url(\'#default#userData\')';
        s.style.position = 'absolute';
        s.style.left = 10000;
        document.body.appendChild(s);
        this.storage = s;
        this.storage.load('lawnchair');
    },

    get:function(key, callback){

        var obj = JSON.parse(this.storage.getAttribute(key) || 'null');
            if (obj) {
                obj.key = key;

            }
            if (callback)
                    callback(obj);
    },

    save:function(obj, callback){
        var id = obj.key || 'lc' + this.uuid();
            delete obj.key;
        this.storage.setAttribute(id, JSON.stringify(obj));
        this.storage.save('lawnchair');
        if (callback){
            obj.key = id;
            callback(obj);
            }
    },

    all:function(callback){
        var cb = this.terseToVerboseCallback(callback);
        var ca = this.storage.XMLDocument.firstChild.attributes;
        var yar = [];
        var v,o;
        // yo ho yo ho a pirates life for me
        for (var i = 0, l = ca.length; i < l; i++) {
            v = ca[i];
            o = JSON.parse(v.nodeValue || 'null');
            if (o) {
                o.key = v.nodeName;
                yar.push(o);
            }
        }
        if (cb)
            cb(yar);
    },
    remove:function(keyOrObj,callback) {
        var key = (typeof keyOrObj == 'string') ?  keyOrObj : keyOrObj.key;
        this.storage.removeAttribute(key);
        this.storage.save('lawnchair');
        if(callback)
          callback();
    },
    nuke:function(callback) {
        var that = this;
        this.all(function(r){
            for (var i = 0, l = r.length; i < l; i++) {
                if (r[i].key)
                    that.remove(r[i].key);
            }
            if(callback)
                callback();
        });
    }
});
Lawnchair.plugin({

    // count of rows in the lawnchair collection with property
    count: function (property, callback) {
        // if only one arg we count the collection
        if ([].slice.call(arguments).length === 1) {
            callback = property
            property = 'key'
        }
        var c = 0;
        this.each(function(e){
            if (e[property]) c++
        })
        this.fn('count', callback).call(this, c)
    },

    // adds up property and returns sum
    sum: function (property, callback) {
        var sum = 0
        this.each(function(e){
            if (e[property]) sum += e[property]
        })
        this.fn('sum', callback).call(this, sum)
    },

    // averages a property
    avg: function (property, callback) {
        this.sum(property, function (sum) {
            this.count(property, function (count) {
                this.fn('avg', callback).call(this, sum/count)
            })
        })
    },

    // lowest number
    min: function (property, callback) {
        this._minOrMax('min', property, callback)
    },

    // highest number
    max: function (property, callback) {
        this._minOrMax('max', property, callback)
    },

    // helper for min/max
    _minOrMax: function (m, p, c) {
        var r, all
        this.all(function(a){
            all = a.map(function(e){ return e[p] })
            r = Math[m].apply(Math, all)
        })
        this.fn(m, c).call(this, r)
    }
// --
});
// I would mark my relationship with javascript as 'its complicated'
Lawnchair.plugin((function(){

    // methods we want to augment with before/after callback registery capability
    var methods = 'save batch get remove nuke'.split(' ')
    ,   registry = {before:{}, after:{}}

    // fill in the blanks
    for (var i = 0, l = methods.length; i < l; i++) {
        registry.before[methods[i]] = []
        registry.after[methods[i]] = []
    }

    return {
    // start of module

        // roll thru each method we with to augment
        init: function () {
            for (var i = 0, l = methods.length; i < l; i++) {
                this.evented(methods[i])
            }
        },
        // TODO make private?
        // rewrites a method with before/after callback capability
        evented: function (methodName) {
            var oldy = this[methodName], self = this
            // overwrite the orig method
            this[methodName] = function() {
                var args              = [].slice.call(arguments)
                ,   beforeObj         = args[0]
                ,   oldCallback       = args[args.length - 1]
                ,   overwroteCallback = false

                // call before with obj
                this.fire('before', methodName, beforeObj)

                if (typeof oldCallback === 'function') {
                    // overwrite final callback with after method injection
                    args[args.length - 1] = function(record) {
                        oldCallback.call(self, record)
                        self.fire('after', methodName, record)
                    }
                    overwroteCallback = true
                }

                // finally call the orig method
                oldy.apply(self, args)

                // if there was no callback to override for after we invoke here
                if (!overwroteCallback)
                    self.fire('after', methodName, beforeObj)
            }
        },

        // TODO definitely make private method
        // for invoking callbacks
        fire: function (when, methodName, record) {
            var callbacks = registry[when][methodName]
            for (var i = 0, l = callbacks.length; i < l; i++) {
                callbacks[i].call(this, record)
            }
        },

        // TODO cleanup duplication that starts here..
        clearBefore: function(methodName) {
            registry.before[methodName] = []
        },

        clearAfter: function(methodName) {
            registry.after[methodName] = []
        },

        // register before callback for methodName
        before: function (methodName, callback) {
            registry.before[methodName].push(callback)
        },

        // register after callback for methodName
        after: function (methodName, callback) {
            registry.after[methodName].push(callback)
        }

    // end module
    }
})())
Lawnchair.plugin({

    page: function (page, callback) {
        // some defaults
        var objs  = []
        ,   count = 5 // TODO make this configurable
        ,   cur   = ~~page || 1
        ,   next  = cur + 1
        ,   prev  = cur - 1
        ,   start = cur == 1 ? 0 : prev*count
        ,   end   = start >= count ? start+count : count

        // grab all the records
        // FIXME if this was core we could use this.__results for faster queries
        this.all(function(r){
            objs = r
        })

        // grab the metadata
        var max  = Math.ceil(objs.length/count)
        ,   page = { max: max
                   , next: next > max ? max : next
                   , prev: prev == 0 ? 1 : prev
                   }

        // reassign to the working resultset
        this.__results = page[this.name] = objs.slice(start, end)

        // callback / chain
        if (callback) this.fn('page', callback).call(this, page)
        return this
    }
});
Lawnchair.plugin((function(){
    //
    var interpolate = function(template, args) {
        var parts = template.split('?').filter(function(i) { return i != ''})
        ,   query = ''

        for (var i = 0, l = parts.length; i < l; i++) {
            query += parts[i] + args[i]
        }
        return query
    }

    var sorter = function(p) {
        return function(a, b) {
            if (a[p] < b[p]) return -1
            if (a[p] > b[p]) return 1
            return 0
        }
    }
    //
    return {
        // query the storage obj
        where: function() {
            // ever notice we do this sort thing lots?
            var args = [].slice.call(arguments)
            ,   tmpl = args.shift()
            ,   last = args[args.length - 1]
            ,   qs   = tmpl.match(/\?/g)
            ,   q    = qs && qs.length > 0 ? interpolate(tmpl, args.slice(0, qs.length)) : tmpl
            ,   is   = new Function(this.record, 'return !!(' + q + ')')
            ,   r    = []
            ,   cb
            // iterate the entire collection
            // TODO should we allow for chained where() to filter __results? (I'm thinking no b/c creates funny behvaiors w/ callbacks)
            this.all(function(all){
                for (var i = 0, l = all.length; i < l; i++) {
                    if (is(all[i])) r.push(all[i])
                }
            })
            // overwrite working results
            this.__results = r
            // callback / chain
            if (args.length === 1) this.fn(this.name, last).call(this, this.__results)
            return this
        },

        // FIXME should be able to call without this.__results
        // ascending sort the working storage obj on a property (or nested property)
        asc: function(property, callback) {
            this.fn(this.name, callback).call(this, this.__results.sort(sorter(property)))
            return this
        },

        // descending sort on working storage object on a property
        desc: function(property, callback) {
            this.fn(this.name, callback).call(this, this.__results.sort(sorter(property)).reverse())
            return this
        }
    }
/////
})());