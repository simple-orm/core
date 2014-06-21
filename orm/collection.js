var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var hookable = require('./hookable');
var bluebird = require('bluebird');
var buildFindObject = function(value) {
  var find = {};

  if(this._data.length > 0) {
    if(_.isObject(value)) {
      find = value._getDataStorePrimaryKeyData();
    } else {
      find[this._data[0]._primaryKeyColumns[0]] = value;
    }
  }

  return find;
};
var collection = Object.create(hookable);

_.extend(collection, {
  add: function(models) {
    if(_.isFunction(models.toArray)) {
      models = models.toArray();
    }

    if(!_.isArray(models)) {
      models = [models];
    }

    this._data = this._data.concat(models);
  },

  remove: function(values) {
    if(this._data.length > 0) {
      if(!_.isArray(values)) {
        values = [values];
      }

      values.forEach((function(value) {
        var find = buildFindObject.apply(this, [value]);

        var modelIndex = _.indexOf(this._data, _.find(this._data, find));

        if(modelIndex !== -1) {
          this._data.splice(modelIndex, modelIndex + 1);
        }
      }).bind(this));
    }
  },

  getByIndex: function(index) {
    if(this._data.length > 0) {
      return this._data[index];
    }

    return undefined;
  },

  get: function(value) {
    if(this._data.length > 0) {
      var find = buildFindObject.apply(this, [value]);
      var options = {
        find: find
      };

      this.runHooks('beforeGetByPrimaryKey', [this, options]);

      var model = _.find(this._data, options.find);

      this.runHooks('afterGetByPrimaryKey', [this, model]);

      return model;
    }

    return undefined;
  },

  clear: function() {
    this._data = [];
  },

  toJSON: function(options) {
    var json = null;

    if(this._data.length > 0) {
      json = [];

      this._data.forEach(function(value, key) {
        json.push(value.toJSON(options));
      });
    }

    return json;
  },

  toJSONWithRelationships: function() {
    var defer = bluebird.defer();
    var json = null;
    var applyArguments = Array.prototype.slice.call(arguments, 0);
    var callsLeft = this._data.length;

    if(this._data.length > 0) {
      json = [];

      this._data.forEach(function(value, key) {
        value.toJSONWithRelationships.apply(value, applyArguments).then(function(results) {
          json.push(results);

          callsLeft -= 1;

          if(callsLeft === 0) {
            defer.resolve(json);
          }
        }, function(error) {
          defer.reject(error);
        });
      });
    } else {
      defer.resolve(json);
    }

    return defer.promise;
  },

  toArray: function() {
    return this._data;
  }
});

Object.defineProperties(collection, {
  length: {
    get: function() {
      return this._data.length;
    }
  }
});

module.exports = function(models) {
  var newCollection = Object.create(collection);
  newCollection._emitter = new EventEmitter();
  newCollection._hooks = {};
  newCollection._data = [];

  if(models) {
    newCollection.add(models);
  }

  return newCollection;
};
