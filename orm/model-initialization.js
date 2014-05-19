var _ = require('lodash');
var moment = require('moment');

var getFunctions = {
  generic: function(key) {
    return this._values[key];
  },
  date: function(key) {
    if(!this._values[key]) {
      return this._values[key];
    }

    return this._values[key].format('YYYY-MM-DD');
  },
  datetime: function(key) {
    if(!this._values[key]) {
      return this._values[key];
    }

    return this._values[key].toISOString();
  },
  boolean: function(key) {
    return !!this._values[key];
  }
};

var setFunctions = {
  generic: function(key, value) {
    return this._values[key] = value;
  },
  date: function(key, value) {
    if(!value) {
      return this._values[key] = value;
    }

    return this._values[key] = moment(new Date(value));
  },
  datetime: function(key, value) {
    if(!value) {
      return this._values[key] = value;
    }

    return this._values[key] = moment(new Date(value));
  }
};

module.exports = function(schema) {
  this._primaryKeys = [];
  this._values = {};
  var properties = [];

  _.forEach(schema, function(value, key) {
    var getAccessorType = (value.type && getFunctions[value.type]) ? value.type : 'generic';
    var setAccessorType = (value.type && setFunctions[value.type]) ? value.type : 'generic';

    properties[key] = {
      get: function() {
        return getFunctions[getAccessorType].apply(this, [key]);
      },
      set: function(value) {
        if(this._status === 'loaded') {
          this._status = 'dirty';
        }

        return setFunctions[setAccessorType].apply(this, [key, value]);
      }
    };

    if(value.defaultValue !== undefined) {
      this._values[key] = value.defaultValue;
    } else {
      this._values[key] = null;
    }

    if(value.primaryKey === true) {
      this._primaryKeys.push(key);
    }
  }, this);

  Object.defineProperties(this, properties);
};