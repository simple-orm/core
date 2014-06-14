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
    _relationships: {},
    define: function(modelName, database, table, schema) {
      this._primaryKeys = {};
      this._modelName = modelName;
      this._table = table;
      this._database = database;
      this._schema = schema;
      this._selectColumns = {};
      this._insertIdProperty;

      _.forEach(this._schema, function(value, key) {
        //this._selectColumns.push(value.column);
        this._selectColumns[value.column] = key;

        if(value.primaryKey === true) {
          this._primaryKeys[value.column] = key;

          if(value.autoIncrement === true) {
            this._insertIdProperty = key;
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

        throw 'error to prevent other hooks from executing';
      };

      try {
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
      } catch(exception) {
        //any other execption needs to bubble up, this exception is expected
        if(exception !== 'error to prevent other hooks from executing') {
          throw exception;
        }
      }

      if(abort === true) {
        defer.resolve(abortValue);
      }

      return defer.promise;
    },

    remove: function() {
      var defer = bluebird.defer();
      var abort = false;
      var abortValue = false;
      var abortSaveCallback = function(returnValue) {
        abort = true;

        if(returnValue) {
          abortValue = returnValue;
        }

        throw 'error to prevent other hooks from executing';
      };

      try {
        this.runHooks('beforeRemove', [this, abortSaveCallback]);

        if(abort === false) {
          this._dataAdapter.remove(this).then((function() {
            this.runHooks('afterRemove', [this]);
            defer.resolve(true);
          }).bind(this), function(error) {
            defer.reject(error);
          });
        }
      } catch(exception) {
        //any other execption needs to bubble up, this exception is expected
        if(exception !== 'error to prevent other hooks from executing') {
          throw exception;
        }
      }

      if(abort === true) {
        defer.resolve(abortValue);
      }

      return defer.promise;
    },

    toJSON: function() {
      var json = {};

      _.forEach(this._schema, function(value, key) {
        if(value.excludeJson !== true) {
          json[key] = this[key];
        }
      }, this);

      return json;
    },

    toJSONWithRelationships: function(relationships) {
      if(_.isString(relationships)) {
        relationships = Array.prototype.slice.call(arguments, 0);
      }

      var json = this.toJSON();
      var defer = bluebird.defer();

      //figure out what relationships need to be parsed
      if(_.isArray(relationships) && relationships.length > 0) {
        var relationshipsToParse = {};

        _.forEach(this._relationships, function(data, relationshipName) {
          if(relationships.indexOf(relationshipName) !== -1) {
            relationshipsToParse[relationshipName] = data;
          }
        })
      } else {
        var relationshipsToParse = this._relationships;
      }

      var callsLeft = Object.keys(relationshipsToParse).length;

      _.forEach(relationshipsToParse, function(options) {
        var nameToParse = options.options.as;
        var relationshipName = nameToParse.substr(0, 1).toLowerCase() + nameToParse.substr(1);

        this[options.functionCall]().then(function(results) {
          //usng this weird syntax in order to make sure arrays of models are properly serialized=
          var relationshipJson = JSON.parse(JSON.stringify(results));

          if(_.isArray(options.options.jsonProperties) && options.options.jsonProperties.length > 0) {
            var parsedData = _.isArray(relationshipJson) ? [] : {};

            if(options.options.jsonProperties.length === 1) {
              if(_.isArray(relationshipJson)) {
                relationshipJson.forEach(function(modelJson) {
                  parsedData.push(modelJson[options.options.jsonProperties[0]]);
                });
              } else {
                parsedData = relationshipJson[options.options.jsonProperties[0]];
              }
            } else {
              if(_.isArray(relationshipJson)) {
                relationshipJson.forEach(function(modelJson) {
                  var parsedModel = {};

                  options.options.jsonProperties.forEach(function(property) {
                    parsedModel[property] = modelJson[property];
                  });

                  parsedData.push(parsedModel);
                });
              } else {
                options.options.jsonProperties.forEach(function(property) {
                  parsedData[property] = relationshipJson[property];
                });
              }
            }

            relationshipJson = parsedData;
          }

          json[relationshipName] = relationshipJson;
          callsLeft -= 1;

          if(callsLeft === 0) {
            defer.resolve(json);
          }
        }, function(error) {
          defer.reject(error);
        });
      }, this);

      return defer.promise;
    },

    loadData: function(data) {
      if(data && _.isObject(data)) {
        _.forEach(this._schema, function(value, key) {
          if(data[value.column] !== undefined) {
            this[key] = data[value.column];
          }
        }, this);
      }
    },

    _getDataStoreValues: function(dataConverters) {
      dataConverters = dataConverters || {};
      dataConverters = _.extend(defaultDataConverters, dataConverters);
      var dataStoreValues = {};

      _.forEach(this._schema, function(value, key) {
        var accessorType = (value.type && dataConverters[value.type]) ? value.type : 'generic';
        dataStoreValues[value.column] = dataConverters[accessorType].apply(null, [this._values[key]]);
      }, this);

      return dataStoreValues;
    },

    _getInsertDataStoreValues: function(dataConverters) {
      var dataStoreValues = this._getDataStoreValues(dataConverters);

      _.forEach(this._schema, function(value, key) {
        if(value.excludeSave === 'always' || value.excludeSave === 'insert' || value.autoIncrement === true) {
          delete dataStoreValues[value.column];
        }
      }, this);

      return dataStoreValues;
    },

    _getUpdateDataStoreValues: function(dataConverters) {
      var dataStoreValues = this._getDataStoreValues(dataConverters);

      _.forEach(this._schema, function(value, key) {
        if(value.excludeSave === 'always' || value.excludeSave === 'update' || value.autoIncrement === true) {
          delete dataStoreValues[value.column];
        }
      }, this);

      return dataStoreValues;
    },

    _getPrimaryKeyData: function(dataConverters) {
      var dataStoreValues = this._getDataStoreValues(dataConverters);
      var data = {};

      _.forEach(this._primaryKeys, function(value, key) {
        data[key] = dataStoreValues[key];
      });

      return data;
    },

    belongsTo: function(repository, options) {
      options = options || {};

      if(!options.as) {
        options.as = repository._model._modelName
      };

      var functionName = 'get' + options.as;
      this._relationships[options.as] = {
        functionCall: functionName,
        options: options
      };

      this[functionName] = function() {
        var defer = bluebird.defer();
        var abort = false;
        var abortValue = false;
        var abortSaveCallback = function(returnValue) {
          abort = true;

          if(returnValue) {
            abortValue = returnValue;
          }

          throw 'error to prevent other hooks from executing';
        };
        var valueField = options.relationProperty || decapitalize(repository._model._modelName) + 'Id';

        try {
          this.runHooks('beforeGetRelationship', [this, 'belongsTo', repository._model._modelName, abortSaveCallback])

          if(abort === false) {
            //this adds support for relationships that are nullable
            if(!this[valueField]) {
              defer.resolve(null);
              return defer.promise;
            }

            var criteria = {
              where: {}
            };

            criteria.where['id'] = this[valueField];

            repository.find(criteria).then((function(results) {
              this.runHooks('afterGetRelationship', [this, 'belongsTo', repository._model._modelName, results]);
              defer.resolve(results);
            }).bind(this), function(error) {
              defer.reject(error);
            });
          }
        } catch(exception) {
          //any other execption needs to bubble up, this exception is expected
          if(exception !== 'error to prevent other hooks from executing') {
            throw exception;
          }
        }

        if(abort === true) {
          defer.resolve(abortValue);
        }

        return defer.promise;
      };
    },

    hasOne: function(repository, options) {
      options = options || {};

      if(!options.as) {
        options.as = repository._model._modelName
      };

      var functionName = 'get' + options.as;
      this._relationships[options.as] = {
        functionCall: functionName,
        options: options
      };

      this[functionName] = function() {
        var defer = bluebird.defer();
        var abort = false;
        var abortValue = false;
        var abortSaveCallback = function(returnValue) {
          abort = true;

          if(returnValue) {
            abortValue = returnValue;
          }

          throw 'error to prevent other hooks from executing';
        };
        var valueField = options.property || decapitalize(this._modelName) + 'Id';

        try {
          this.runHooks('beforeGetRelationship', [this, 'hasOne', repository._model._modelName, abortSaveCallback]);

          if(abort === false) {
            var criteria = {
              where: {}
            };

            criteria.where[valueField] = this.id;

            repository.find(criteria).then((function(results) {
              this.runHooks('afterGetRelationship', [this, 'hasOne', repository._model._modelName, results]);
              defer.resolve(results);
            }).bind(this), function(error) {
              defer.reject(error);
            });
          }
        } catch(exception) {
          //any other execption needs to bubble up, this exception is expected
          if(exception !== 'error to prevent other hooks from executing') {
            throw exception;
          }
        }

        if(abort === true) {
          defer.resolve(abortValue);
        }

        return defer.promise;
      };
    },

    hasMany: function(repository, options) {
      options = options || {};

      if(!options.as) {
        options.as = repository._model._table
      };

      var functionName = 'get' + options.as;
      var throughRepository = (options.through) ? options.through : null;
      this._relationships[options.as] = {
        functionCall: functionName,
        options: options
      };

      this[functionName] = function() {
        var defer = bluebird.defer();
        var abort = false;
        var abortValue = false;
        var abortSaveCallback = function(returnValue) {
          abort = true;

          if(returnValue) {
            abortValue = returnValue;
          }

          throw 'error to prevent other hooks from executing';
        };

        try {
          this.runHooks('beforeGetRelationship', [this, 'hasMany', repository._model._modelName, abortSaveCallback]);

          if(abort === false) {
            var criteria = {};
            var selfField = options.property || decapitalize(this._modelName) + 'Id';

            if(throughRepository) {
              var relationField = options.relationProperty || decapitalize(repository._model._modelName) + 'Id';
              var on = {};

              on[throughRepository._model._table + '.' + selfField] = this.id;
              on[throughRepository._model._table + '.' + relationField] = {
                value: repository._model._table + '.' + Object.keys(repository._model._primaryKeys)[0],
                valueType: 'field'
              };

              criteria.join = [{
                repository: throughRepository,
                on: on
              }];
            } else {
              criteria.where = {};
              criteria.where[selfField] = this.id;
            }

            repository.findAll(criteria).then((function(results) {
              this.runHooks('afterGetRelationship', [this, 'hasMany', repository._model._modelName, results]);
              defer.resolve(results);
            }).bind(this), function(error) {
              defer.reject(error);
            });
          }
        } catch(exception) {
          //any other execption needs to bubble up, this exception is expected
          if(exception !== 'error to prevent other hooks from executing') {
            throw exception;
          }
        }

        if(abort === true) {
          defer.resolve(abortValue);
        }

        return defer.promise;
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
