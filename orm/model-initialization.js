require('string-format');
var _ = require('lodash');
var moment = require('moment');
var EventEmitter = require('events').EventEmitter;

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
  },
  boolean: function(key, value) {
    return this._values[key] = !!value;
  }
};

module.exports = function(dataAdapter) {
  var sharedHooks = this._hooks;

  this._dataAdapter = dataAdapter;

  if(!this._status) {
    this._status = 'new';
  }

  this._emitter = new EventEmitter();
  this._hooks = {};
  this._values = {};
  var properties = [];

  //we need to copy the hooks that are attachable to the base model object this this instance
  if(Object.keys(sharedHooks).length > 0) {
    _.forEach(sharedHooks, function(hooks, name) {
      _.forEach(hooks, function(fn, identifier) {
        this.hook('{0}[{1}]'.format(name, identifier), fn)
      }, this);
    }, this);
  }

  _.forEach(this._schema, function(value, key) {
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
