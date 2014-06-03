require('string-format');
var _ = require('lodash');
var moment = require('moment');
var modelInitialization = require('./model-initialization');
var bluebird = require('bluebird');
var hookable = require('./hookable');

var decapitalize = function(value) {
  return value.substr(0, 1).toLowerCase() + value.substr(1);
};

var defaultDataConverters = {
  generic: function(value) {
    return value;
  }
};

module.exports = function() {
  var baseModel = Object.create(hookable);

  _.extend(baseModel, {
    _hooks: {},
    define: function(modelName, table, schema) {
      this._primaryKeys = [];
      this._modelName = modelName;
      this._table = table;
      this._schema = schema;
      this._selectColumns = [];
      this._insertIdColumn;

      _.forEach(this._schema, function(value, key) {
        this._selectColumns.push(value.column);

        if(value.primaryKey === true) {
          this._primaryKeys.push(key);

          if(value.autoIncrement === true) {
            this._insertIdColumn = value.column;
          }
        }
      }, this);
    },

    init: function(data, dataAdapter) {
      modelInitialization.apply(this, [dataAdapter]);
      this.loadData(data);
    },

    save: function() {
      var defer = bluebird.defer();
      var abort = false;
      var abortValue = false;
      var abortSaveCallback = function(returnValue) {
        abort = true;

        if(returnValue) {
          abortValue = returnValue;
        }
      };

      if(this._status === 'new') {
        this.runHooks('beforeSave', [this, 'insert', abortSaveCallback]);

        if(abort === false) {
          this._dataAdapter.insert(this).then((function() {
            this.runHooks('afterSave', [this, 'insert']);
            defer.resolve(true);
          }).bind(this), function(error) {
            defer.reject(error);
          });
        }
      } else if(this._status === 'dirty') {
        this.runHooks('beforeSave', [this, 'update', abortSaveCallback]);

        if(abort === false) {
          this._dataAdapter.update(this).then((function() {
            this.runHooks('afterSave', [this, 'update']);
            defer.resolve(true);
          }).bind(this), function(error) {
            defer.reject(error);
          });
        }
      } else {
        defer.resolve(true);
      }

      if(abort === true) {
        defer.resolve(abortValue);
      }

      return defer.promise;
    },

    remove: function() {
      var defer = bluebird.defer();

      this.runHooks('beforeRemove', [this]);

      this._dataAdapter.remove(this).then((function() {
        this.runHooks('afterRemove', [this]);
        defer.resolve(true);
      }).bind(this), function(error) {
        defer.reject(error);
      });

      return defer.promise;
    },

    toJSON: function() {
      var json = {};

      _.forEach(this._schema, function(value, key) {
        json[key] = this[value.column];
      }, this);

      return json;
    },

    loadData: function(data) {
      if(data && _.isObject(data)) {
        _.forEach(this._schema, function(value, key) {
          if(data[key] !== undefined) {
            this[key] = data[key];
          }
        }, this);
      }
    },

    getDataStoreValues: function(dataConverters) {
      dataConverters = dataConverters || {};
      dataConverters = _.extend(defaultDataConverters, dataConverters);
      var dataStoreValues = {};

      _.forEach(this._schema, function(value, key) {
        var accessorType = (value.type && dataConverters[value.type]) ? value.type : 'generic';
        dataStoreValues[key] = dataConverters[accessorType].apply(null, [this._values[key]]);
      }, this);

      return dataStoreValues;
    },

    getInsertDataStoreValues: function(dataConverters) {
      var dataStoreValues = this.getDataStoreValues(dataConverters);

      _.forEach(this._schema, function(value, key) {
        if(value.exclude === 'always' || value.exclude === 'insert' || value.autoIncrement === true) {
          delete dataStoreValues[key];
        }
      }, this);

      return dataStoreValues;
    },

    getUpdateDataStoreValues: function(dataConverters) {
      var dataStoreValues = this.getDataStoreValues(dataConverters);

      _.forEach(this._schema, function(value, key) {
        if(value.exclude === 'always' || value.exclude === 'update' || value.autoIncrement === true) {
          delete dataStoreValues[key];
        }
      }, this);

      return dataStoreValues;
    },

    getPrimaryKeyData: function(dataConverters) {
      var dataStoreValues = this.getDataStoreValues(dataConverters);
      var data = {};

      _.forEach(this._primaryKeys, function(value) {
        data[value] = dataStoreValues[value];
      });

      return data;
    },

    belongsTo: function(repository, options) {
      options = options || {};

      this['get' + repository._model._modelName] = function() {
        var criteria = {
          where: {}
        };

        criteria.where['id'] = this[decapitalize(repository._model._modelName) + 'Id'];

        return repository.find(criteria);
      };
    },

    hasOne: function(repository, options) {
      options = options || {};

      this['get' + repository._model._modelName] = function() {
        var criteria = {
          where: {}
        };

        criteria.where[decapitalize(this._modelName) + 'Id'] = this.id;

        return repository.find(criteria);
      };
    },

    hasMany: function(repository, options) {
      options = options || {};
      var throughRepository = (options.through) ? options.through : null;

      this['get' + repository._model._table] = function() {
        var criteria = {};

        if(throughRepository) {
          var selfField = options.property || decapitalize(this._modelName) + 'Id';
          var relationField = options.relationProperty || decapitalize(repository._model._modelName) + 'Id';
          var on = {};

          on[throughRepository._model._table + '.' + selfField] = this.id;
          on[throughRepository._model._table + '.' + relationField] = {
            value: repository._model._table + '.id',
            valueType: 'field'
          };

          criteria.join = [{
            repository: throughRepository,
            on: on
          }];
        } else {
          criteria.where = {};
          criteria.where[decapitalize(this._modelName) + 'Id'] = this.id;
        }

        return repository.findAll(criteria);
      };
    },

    plugin: function(pluginFunction, options) {
      if(_.isFunction(pluginFunction)) {
        pluginFunction.apply(this, [options]);
      }
    }
  });

  return baseModel;
};