
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("polyfill-Array.prototype.map/component.js", function(exports, require, module){
require('./Array.prototype.map');

});
require.register("polyfill-Array.prototype.map/Array.prototype.map.js", function(exports, require, module){
// @from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.com/#x15.4.4.19
if (!Array.prototype.map) {
  Array.prototype.map = function(callback, thisArg) {

    var T, A, k;

    if (this == null) {
      throw new TypeError(" this is null or not defined");
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + " is not a function");
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (thisArg) {
      T = thisArg;
    }

    // 6. Let A be a new array created as if by the expression new Array(len) where Array is
    // the standard built-in constructor with that name and len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while(k < len) {

      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[ k ];

        // ii. Let mappedValue be the result of calling the Call internal method of callback
        // with T as the this value and argument list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor {Value: mappedValue, : true, Enumerable: true, Configurable: true},
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });

        // For best browser support, use the following:
        A[ k ] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };      
}

});
require.register("shallker-array-forEach-shim/index.js", function(exports, require, module){
/*
  @from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
*/
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (fn, scope) {
        'use strict';
        var i, len;
        for (i = 0, len = this.length; i < len; ++i) {
            if (i in this) {
                fn.call(scope, this[i], i, this);
            }
        }
    };
}

});
require.register("shallker-wang-dever/component.js", function(exports, require, module){
require('Array.prototype.map');
require('array-foreach-shim');

exports = module.exports = require('./util/dever');

exports.version = '2.0.1';

});
require.register("shallker-wang-dever/util/dever.js", function(exports, require, module){
/* Log level */
/*
  0 EMERGENCY system is unusable
  1 ALERT action must be taken immediately
  2 CRITICAL the system is in critical condition
  3 ERROR error condition
  4 WARNING warning condition
  5 NOTICE a normal but significant condition
  6 INFO a purely informational message
  7 DEBUG messages to debug an application
*/

var slice = Array.prototype.slice,
    dev,
    pro,
    config,
    level = {
      "0": "EMERGENCY",
      "1": "ALERT",
      "2": "CRITICAL",
      "3": "ERROR",
      "4": "WARNING",
      "5": "NOTICE",
      "6": "INFO",
      "7": "DEBUG"
    };

function readFileJSON(path) {
  var json = require('fs').readFileSync(path, {encoding: 'utf8'});
  return JSON.parse(json);
}

function loadConfig(name) {
  return readFileJSON(process.env.PWD + '/' + name);
}

function defaultConfig() {
  return {
    "output": {
      "EMERGENCY": false,
      "ALERT": false,
      "CRITICAL": false,
      "ERROR": false,
      "WARNING": true,
      "NOTICE": true,
      "INFO": true,
      "DEBUG": false 
    },
    "throw": false
  }
}

try { dev = loadConfig('dev.json'); } catch (e) {}
try { pro = loadConfig('pro.json'); } catch (e) {}

config = dev || pro || defaultConfig();

function log() {
  console.log.apply(console, slice.call(arguments));
}

function debug() {
  var args = slice.call(arguments)
  args.unshift('[Debug]');
  if (console.debug) {
    console.debug.apply(console, args);
  } else {
    console.log.apply(console, args);
  }
}

function info() {
  var args = slice.call(arguments)
  args.unshift('[Info]');
  if (console.info) {
    console.info.apply(console, args)
  } else {
    console.log.apply(console, args)
  }
}

function notice() {
  var args = slice.call(arguments)
  args.unshift('[Notice]');
  if (console.notice) {
    console.notice.apply(console, args);
  } else {
    console.log.apply(console, args);
  }
}

function warn() {
  var args = slice.call(arguments)
  args.unshift('[Warn]');
  if (console.warn) {
    console.warn.apply(console, args);
  } else {
    console.log.apply(console, args);
  }
}

function error(err) {
  if (config["throw"]) {
    /* remove first line trace which is from here */
    err.stack = err.stack.replace(/\n\s*at\s*\S*/, '');
    throw err;
  } else {
    var args = ['[Error]'];
    err.name && (err.name += ':') && (args.push(err.name));
    args.push(err.message);
    console.log.apply(console, args);
  }
  return false;
}

exports.config = function(json) {
  config = json;
}

exports.debug = function(froms) {
  froms = slice.call(arguments).map(function(from) {
    return '[' + from + ']';
  });

  function exDebug() {
    if (!config.output['DEBUG']) return;
    return debug.apply({}, froms.concat(slice.call(arguments)));
  }

  exDebug.off = function() {
    return function() {}
  }

  return exDebug;
}

exports.info = function(froms) {
  froms = slice.call(arguments).map(function(from) {
    return '[' + from + ']';
  });

  function exInfo() {
    if (!config.output['INFO']) return;
    return info.apply({}, froms.concat(slice.call(arguments)));
  }

  exInfo.off = function() {
    return function() {}
  }

  return exInfo;
}

exports.notice = function(froms) {
  froms = slice.call(arguments).map(function(from) {
    return '[' + from + ']';
  });

  function exNotice() {
    if (!config.output['NOTICE']) return;
    return notice.apply({}, froms.concat(slice.call(arguments)));
  }

  exNotice.off = function() {
    return function() {}
  }

  return exNotice;
}

exports.warn = function(froms) {
  froms = slice.call(arguments).map(function(from) {
    return '[' + from + ']';
  });

  function exWarn() {
    if (!config.output['WARNING']) return;
    return warn.apply({}, froms.concat(slice.call(arguments)));
  }

  exWarn.off = function() {
    return function() {}
  }

  return exWarn;
}

exports.error = function(froms) {
  froms = slice.call(arguments).map(function(from) {
    return '[' + from + ']';
  });

  function exError() {
    var err;
    if (!config.output['ERROR']) return false;
    err = new Error(slice.call(arguments).join(' '));
    err.name = froms.join(' ');
    return error(err);
  }

  exError.off = function() {
    return function() {}
  }

  return exError;
}

});
require.register("shallker-wang-eventy/index.js", function(exports, require, module){
module.exports = exports = require('./lib/eventy');

exports.version = '1.1.3';

});
require.register("shallker-wang-eventy/lib/eventy.js", function(exports, require, module){
var debug = require('dever').debug('Eventy'),
    error = require('dever').error('Eventy'),
    warn = require('dever').warn('Eventy');


module.exports = function Eventy(object) {
  function Event() {

    var self = this,
        events = {},
        slice = Array.prototype.slice,
        toString = Object.prototype.toString;

    /* Check if this is the first time binding an event */
    function isRegisteredEvent(name) {
      return events[name] ? true : false;
    }

    /**
     * Take a position in the event stack.
     * @param {String} name
     * @return {Array} event callback list
     */
    function registerEvent(name) {
      debug('register', name);
      return events[name] || (events[name] = []);
    }

    /* Remove event from event stack */
    function unregisterEvent(name) {
      return delete events[name];
    }

    /* Append a listener into event callback list */
    function appendEventListener(name, callback) {
      // debug('appendEventListener', name, callback);
      return events[name].push(callback);
    }

    /* Delete one callback from event callback list */
    function deleteEventListener(name, listener) {
      var callbacks = getEventCallbacks(name);
      callbacks.forEach(function(callback, index) {
        if (callback === listener) {
          callbacks.splice(index, 1);
        }
      })
      return resetEventCallbacks(name, callbacks);
    }

    /* Return the callback list of the event */
    function getEventCallbacks(name) {
      return events[name] ? events[name] : [];
    }

    /* Overwrite event callback list */
    function resetEventCallbacks(name, callbacks) {
      return events[name] = callbacks;
    }

    /**
     * Append a listener into event's callback list
     * @param {String} name
     * @param {Function} callback
     * @return {Object} event object itself
     */
    this.on = function(name, callback) {
      if (toString.call(callback) !== '[object Function]') {
        return error('event ' + name + ' callback is not a function');
      }
      if (!isRegisteredEvent(name)) {
        registerEvent(name);
      }
      appendEventListener(name, callback);
      return this;
    }

    /**
     * Remove one callback from event callback list
     * @param {String} name
     * @param {Function} callback
     * @return {Boolean} result of the deletion of the event callback
     */
    this.off = function(name, callback) {
      if (!isRegisteredEvent(name)) {
        warn('unregistered event', name);
        return this;
      }
      if (typeof callback === 'undefined') {
        warn('no callback given');
        return this;
      }
      deleteEventListener(name, callback);
      return this;
    }

    /**
     * Calling every listeners of the event.
     * @param {String} name
     * @param {Array} callbackArguments
     * @return {Object} event object itself
     */
    this.trigger = function(name, values) {
      values = slice.call(arguments);
      name = values.shift()
      if (!isRegisteredEvent(name)) {
        return this;
      }
      debug('trigger', name);
      getEventCallbacks(name).forEach(function(callback, index) {
        setTimeout(function() {
          callback.apply(object, values);
        }, 1);
      })
      return this;
    }

    return this;
  }

  if (object) {
    return Event.call(object);
  } else {
    return Event.call({});
  }
}

});
require.register("local-collection/index.js", function(exports, require, module){
module.exports = require('./lib/local-collection');

});
require.register("local-collection/lib/local-collection.js", function(exports, require, module){
var local = window.localStorage;
var eventy = require('eventy');

module.exports = function LocalCollection(name) {
  local[name] = local[name] || '[]';

  var records = JSON.parse(local[name]);

  var collection = function () {
    return this;
  }.call(eventy(Object.create(records)));

  function error(e) {
    e.name = name;
    throw e;
  }

  function generateId(offset) {
    offset = offset || 0;

    var id = collection.count() + offset + 1;

    if (collection.has(id)) id = generateId(offset + 1);
    return id;
  }

  collection.add = function (record, onError) {
    onError = onError || error;

    /*
      Give new record a local id if no id attached with
    */
    if (typeof record.id === 'undefined') {
      record.id = generateId();
    }

    /*
      Add new record with an existed id is not allowed
    */
    if (this.exists(record.id)) return onError(new Error('existed id'));      

    /*
      Save data to records object
    */
    records.push(record);

    /*
      Stringify records object to local storage
    */
    this.save();

    this.trigger('add', record);
    return record;
  }

  collection.exists = function (id) {
    for (var i in records) {
      if (records[i].id === id) return true;
    }

    return false;
  };

  /*
    Alias of collection.exists()
  */
  collection.has = collection.exists;

  /*
    Return a record by id
  */
  collection.get = function (id, onError) {
    onError = onError || error;

    /*
      Return error if record doesn't exist
    */
    if (!this.has(id)) return onError(new Error("record doesn't exist"));

    for (var i in records) {
      if (records[i].id === id) return records[i];
    }
  }

  /*
    Remove a record by id
    @return Boolean
  */
  collection.remove = function (id, onError) {
    onError = onError || error;

    /*
      Return error if record doesn't exist
    */
    if (!this.has(id)) return onError(new Error("record doesn't exist"));

    /*
      Delete data from records object, and save to localStorage
    */
    for (var i in records) {
      if (records[i].id === id) {
        records.splice(i, 1);
        break;
      }
    }

    this.save();
    this.trigger('remove', id);
    return true;
  }

  /*
    Alias of collection.remove()
  */
  collection.del = collection.remove;

  collection.update = function (id, data, onError) {
    onError = onError || error;

    /*
      Return error if record doesn't exist
    */
    if (!this.has(id)) return onError(new Error("record doesn't exist"));

    var record = this.get(id);

    for (var k in data) {
      /*
        Updating id field has conflict with other record is not allowed
      */
      if (k === 'id' && data['id'] !== record.id && this.has(data['id'])) {
        return onError(new Error("other record with the same id existed"));
      }

      record[k] = data[k];
    }

    this.save();
    return record;
  }

  /*
    Alias of collection.update()
  */
  collection.set = collection.update;

  /*
    Return the total number of existed records
  */
  collection.count = function () {
    return records.length;
  }

  /*
    Stringify records object to localStorage
  */
  collection.save = function () {
    local[name] = JSON.stringify(records);
    this.trigger('save');
  }

  /*
    Load data from localStorage, asign it to records object and return records
  */
  collection.load = function (onError) {
    onError = onError || error;

    try {
      records = JSON.parse(local[name]);
    } catch (e) {
      onError(e);
    }

    this.trigger('load', records);
    return records;
  }

  collection.destroy = function () {
    records = [];
    this.save();
    this.trigger('destroy');
  }

  return collection;
}

});


require.alias("shallker-wang-eventy/index.js", "local-collection/deps/eventy/index.js");
require.alias("shallker-wang-eventy/lib/eventy.js", "local-collection/deps/eventy/lib/eventy.js");
require.alias("shallker-wang-eventy/index.js", "local-collection/deps/eventy/index.js");
require.alias("shallker-wang-eventy/index.js", "eventy/index.js");
require.alias("shallker-wang-dever/component.js", "shallker-wang-eventy/deps/dever/component.js");
require.alias("shallker-wang-dever/util/dever.js", "shallker-wang-eventy/deps/dever/util/dever.js");
require.alias("shallker-wang-dever/component.js", "shallker-wang-eventy/deps/dever/index.js");
require.alias("polyfill-Array.prototype.map/component.js", "shallker-wang-dever/deps/Array.prototype.map/component.js");
require.alias("polyfill-Array.prototype.map/Array.prototype.map.js", "shallker-wang-dever/deps/Array.prototype.map/Array.prototype.map.js");
require.alias("polyfill-Array.prototype.map/component.js", "shallker-wang-dever/deps/Array.prototype.map/index.js");
require.alias("polyfill-Array.prototype.map/component.js", "polyfill-Array.prototype.map/index.js");
require.alias("shallker-array-forEach-shim/index.js", "shallker-wang-dever/deps/array-foreach-shim/index.js");
require.alias("shallker-array-forEach-shim/index.js", "shallker-wang-dever/deps/array-foreach-shim/index.js");
require.alias("shallker-array-forEach-shim/index.js", "shallker-array-forEach-shim/index.js");
require.alias("shallker-wang-dever/component.js", "shallker-wang-dever/index.js");
require.alias("shallker-wang-eventy/index.js", "shallker-wang-eventy/index.js");
require.alias("local-collection/index.js", "local-collection/index.js");