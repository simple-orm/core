var _ = require('lodash');
var moment = require('moment');

var getFunctions = {
  generic: function(key) {
    return this._values[key];
  },
  date: function(key) {
    if(!this._values[key]) {
      return null;
    }

    var formattedValue = this._values[key].format('YYYY-MM-DD');

    if(formattedValue === 'Invalid date') {
      return null;
    }

    return formattedValue;
  },
  datetime: function(key) {
    if(!this._values[key]) {
      return null;
    }

    var formattedValue = this._values[key].toISOString();

    if(formattedValue === 'Invalid date') {
      return null;
    }

    return formattedValue;
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
  this._values = {};
  var properties = [];

  _.forEach(schema, function(value, key) {
    var getAccessorType = (value.type && getFunctions[value.type]) ? value.type : 'generic';
    var setAccessorType = (value.type && setFunctions[value.type]) ? value.type : 'generic';

    properties[key] = {
      get: function() {
        var propertyValue = getFunctions[getAccessorType].apply(this, [key]);

        if(_.isFunction(value.getter)) {
          propertyValue = value.getter(propertyValue);
        }

        return propertyValue;
      },
      set: function(newValue) {
        if(this._status === 'loaded') {
          this._status = 'dirty';
        }

        if(_.isFunction(value.setter)) {
          newValue = value.setter(newValue);
        }

        return setFunctions[setAccessorType].apply(this, [key, newValue]);
      }
    };

    if(value.defaultValue !== undefined) {
      this._values[key] = value.defaultValue;
    } else {
      this._values[key] = null;
    }
  }, this);

  Object.defineProperties(this, properties);
};