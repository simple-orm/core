require('string-format');
var _ = require('lodash');
var bluebird = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var hookable = require('./hookable');
var interfaceChecker = require('interface-checker');

interfaceChecker.define('SimpleOrmDataAdapter', [
  'insert:1',
  'update:1',
  'remove:1',
  'find:3',
  'findAll:3',
  'startTransaction',
  'commitTransaction',
  'rollbackTransaction'//,
  /* since need to figure out the API for these methods
   'getOne',
   'getColumn',
   'getRow',
   'getAll',
   'runQuery'*/
]);

module.exports = function(model, dataAdapter) {
  var interfaceCheck = interfaceChecker.has(dataAdapter, 'SimpleOrmDataAdapter');

  if(interfaceCheck !== true) {
    var errorMessage = "The passed in data adapter has the following issue:";

    if(interfaceCheck.missingMethods) {
      interfaceCheck.missingMethods.forEach(function(value) {
        errorMessage += "\nMissing {0} method".format(value);
      });
    }

    if(interfaceCheck.missingProperties) {
      interfaceCheck.missingProperties.forEach(function(value) {
        errorMessage += "\nMissing {0} property".format(value);
      });
    }

    if(interfaceCheck.parameterMismatch) {
      interfaceCheck.parameterMismatch.forEach(function(value) {
        errorMessage += "\n" + value;
      });
    }

    if(interfaceCheck.invalidType) {
      _.forEach(interfaceCheck.invalidType, function(expectedPropertyType, propertyName) {
        errorMessage += "\nExpected {0} to be a {1}".format(propertyName, expectedPropertyType);
      });
    }

    throw new Error(errorMessage);
    return;
  }

  var baseRepository = Object.create(hookable);

  _.extend(baseRepository, {
    _emitter: new EventEmitter(),
    _hooks: {},
    _model: model,
    _dataAdapter: dataAdapter,
    create: function(data) {
      data = data || {};
      var returnObject = Object.create(model);
      returnObject.init(data, dataAdapter);
      return returnObject;
    },

    find: function(criteria) {
      var defer = bluebird.defer();
      var abort = false;
      var abortValue = false;
      //making this object in order to allow the beforeFind hook to be able to easily modify the criteria data
      var options = {
        criteria: criteria
      };

      this.runHooks('beforeFind', [this, options, function(returnValue) {
        abort = true;

        if(returnValue) {
          abortValue = returnValue;
        }
      }]);

      if(abort === false) {
        this._dataAdapter.find(model, options.criteria, this.create).then((function(results) {
          this.runHooks('afterFind', [this, results]);
          defer.resolve(results);
        }).bind(this), function(error) {
          defer.reject(error);
        });
      }

      if(abort === true) {
        defer.resolve(abortValue);
      }

      return defer.promise;
    },

    findAll: function(criteria) {
      var defer = bluebird.defer();
      var abort = false;
      var abortValue = false;
      //making this object in order to allow the beforeFindAll hook to be able to easily modify the criteria data
      var options = {
        criteria: criteria
      };

      this.runHooks('beforeFindAll', [this, options, function(returnValue) {
        abort = true;

        if(returnValue) {
          abortValue = returnValue;
        }
      }]);

      if(abort === false) {
        this._dataAdapter.findAll(model, options.criteria, this.create).then((function(results) {
          this.runHooks('afterFindAll', [this, results]);
          defer.resolve(results);
        }).bind(this), function(error) {
          defer.reject(error);
        });
      }

      if(abort === true) {
        defer.resolve(abortValue);
      }

      return defer.promise;
    },

    plugin: function(pluginFunction, options) {
      if(_.isFunction(pluginFunction)) {
        pluginFunction.apply(this, [options]);
      }
    }
  });

  return baseRepository;
};