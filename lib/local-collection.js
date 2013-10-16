var local = window.localStorage;
var eventy = require('eventy');
var toString = Object.prototype.toString;

module.exports = function LocalCollection(name) {
  var records = [];

  var collection = function () {
    return this;
  }.call(eventy(Object.create(records)));

  function error(e) {
    e.name = name;
    throw e;
  }

  function match(record, selector) {
    for (var k in selector) {
      if (record[k] !== selector[k]) return false;
    }

    return true;
  }

  function isEmptyObject(object) {
    for (var k in object) {
      if (Object.prototype.hasOwnProperty.call(object, k)) return false;
    }

    return true;
  }

  function extractModifier(query) {
    var modifier = {};

    for (var k in query) {
      if (k.indexOf('$') === 0) {
        modifier[k] = query[k];
      }
    }

    return modifier;
  }

  function extractSelecter(query) {
    var selecter = {};

    for (var k in query) {
      if (k.indexOf('$') === 0) continue;
      selecter[k] = query[k];
    }

    return selecter;
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
      Add event engine to a single record instance
    */
    eventy(record);

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
        var record = records.splice(i, 1)[0];

        record.trigger('remove');
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

    record.trigger('update');
    this.trigger('update', record.id);
    this.save();
    return record;
  }

  /*
    Alias of collection.update()
  */
  collection.set = collection.update;

  collection.first = function () {
    return this.item(0);
  }

  collection.last = function () {
    return this.item(this.count() - 1);
  }

  collection.item = function (index) {
    return records[index];
  }

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

    var data;

    try {
      data = JSON.parse(local[name] || '[]');
    } catch (e) {
      onError(e);
    }

    if (toString.call(data) !== '[object Array]') {
      return onError(new Error("conflicts local data"));
    }

    for (var i in data) {
      var record = data[i];

      /*
        Add event engine
      */
      eventy(record);
      records.push(record);
    }

    this.trigger('load', records);
    return records;
  }

  /*
    Search one record which match query first
    @arguments Object query
    @return Mix id
  */
  collection.one = function (query) {
    var selector = extractSelecter(query);

    for (var i in records) {
      if (match(records[i], selector)) return records[i].id;
    }

    return null;
  }

  /*
    Search all the records which match query
    @arguments [Object query]
    @return Array ids
  */
  collection.all = function (query) {
    var modifier = extractModifier(query);
    var selector = extractSelecter(query);
    var result = [];

    if (isEmptyObject(selector)) {
      /*
        Return all records when no selecter is assigned
      */
      result = records.slice();
    } else {
      this.each(function (record, index) {
        if (match(record, selector)) result.push(record);
      });
    }

    if (result.length === 0) return result;

    /*
      Change result order based on modifier
    */
    if (modifier.$ascend) {
      records.sort(function (a, b) {
        if (a[modifier.$ascend] > b[modifier.$ascend]) return 1;
        if (a[modifier.$ascend] < b[modifier.$ascend]) return -1;
        return 0;
      });
    }

    if (modifier.$descend) {
      records.sort(function (a, b) {
        if (a[modifier.$descend] > b[modifier.$descend]) return -1;
        if (a[modifier.$descend] < b[modifier.$descend]) return 1;
        return 0;
      });
    }

    /*
      Change result length based on modifier
    */
    if (modifier.$limit) {
      if (records.length > modifier.$limit) records.length = modifier.$limit;
    }

    return records.map(function (item, index, array) {
      return item.id;
    });
  }

  /*
    Looping through all records
    @arguments Function callback
    @callback Object record, Number index
  */
  collection.each = function (callback) {
    var clone = records.slice();

    for (var i in clone) {
      callback.call(clone[i], clone[i], i);
    }
  }

  collection.clear = function () {
    this.each(function (record, index) {
      collection.remove(record.id);
    });

    this.save();
    this.trigger('clear');
  }

  return collection;
}
