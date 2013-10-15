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

    try {
      records = JSON.parse(local[name]);
    } catch (e) {
      onError(e);
    }

    this.trigger('load', records);
    return records;
  }

  collection.all = function () {
    return records;
  }

  /*
    Looping through all records
    @arguments Function callback
    @callback Object record, Number index
  */
  collection.each = function (callback) {
    for (var i in records) {
      callback.call(records[i], records[i], i);
    }
  }

  collection.clear = function () {
    this.each(function (record, index) {
      record.trigger('remove');
    });

    records = [];
    this.save();
    this.trigger('clear');
  }

  return collection;
}
