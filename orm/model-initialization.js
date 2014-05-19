var _ = require('lodash');
var moment = require('moment');

var getFunctions = {
  generic: function(key) {
    return this.values[key];
  },
  date: function(key) {
    if(!this.values[key]) {
      return this.values[key];
    }

    return this.values[key].format('YYYY-MM-DD');
  },
  datetime: function(key) {
    if(!this.values[key]) {
      return this.values[key];
    }

    return this.values[key].toISOString();
  },
  boolean: function(key) {
    return !!this.values[key];
  }
};

var setFunctions = {
  generic: function(key, value) {
    return this.values[key] = value;
  },
  date: function(key, value) {
    if(!value) {
      return this.values[key] = value;
    }

    return this.values[key] = moment(new Date(value));
  },
  datetime: function(key, value) {
    if(!value) {
      return this.values[key] = value;
    }

    return this.values[key] = moment(new Date(value));
  }
};

module.exports = function(schema) {
  this._primaryKeys = [];
  this.values = {};
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
      this.values[key] = value.defaultValue;
    } else {
      this.values[key] = null;
    }

    if(value.primaryKey === true) {
      this._primaryKeys.push(key);
    }
  }, this);

  Object.defineProperties(this, properties);
};