require('string-format-js');
var _ = require('lodash');
var moment = require('moment');
var modelInitialization = require('./model-initialization');
var bluebird = require('bluebird');

var dataConverters = {
  generic: function(value) {
    return value;
  },
  boolean: function(value) {
    return value === true ? 1 : 0;
  },
  date: function(value) {
    if(!value) {
      return null;
    }

    return value.format('YYYY-MM-DD');
  },
  datetime: function(value) {
    if(!value) {
      return null;
    }

    return value.format('YYYY-MM-DD HH:mm:ss');
  }
};

module.exports = function(dataAdapter) {
  return {
    _status: 'new',
    _dataAdapter: dataAdapter,

    define: function(table, schema) {
      this._table = table;
      this._schema = schema;
      this._selectColumns = [];
      this._insertIdColumn;

      _.forEach(this._schema, function(value) {
        this._selectColumns.push(value.column);

        if(value.primaryKey === true && value.autoIncrement === true) {
          this._insertIdColumn = value.column;
        }
      }, this);
    },

    init: function(data) {
      modelInitialization.apply(this, [this._schema]);
      this.loadData(data);
    },

    save: function() {
      var defer = bluebird.defer();

      if(this._status === 'new') {
        this._dataAdapter.insert(this).then(function() {
          defer.resolve(true);
        }, function(error) {
          defer.reject(error);
        });
      } else if(this._status === 'dirty') {
        this._dataAdapter.update(this).then(function() {
          defer.resolve(true);
        }, function(error) {
          defer.reject(error);
        });
      } else {
        defer.resolve(true);
      }

      return defer.promise;
    },

    remove: function() {
      var defer = bluebird.defer();

      this._dataAdapter.remove(this).then(function() {
        defer.resolve(true);
      }, function(error) {
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

    getAllSqlValues: function() {
      var sqlValues = {};

      _.forEach(this._schema, function(value, key) {
        var accessorType = (value.type && dataConverters[value.type]) ? value.type : 'generic';
        sqlValues[key] = dataConverters[accessorType].apply(null, [this._values[key]]);
      }, this);

      return sqlValues;
    },

    getInsertSqlValues: function() {
      var sqlValues = this.getAllSqlValues();

      _.forEach(this._schema, function(value, key) {
        if(value.exclude === 'always' || value.exclude === 'insert' || value.autoIncrement === true) {
          delete sqlValues[key];
        }
      }, this);

      return sqlValues;
    },

    getUpdateSqlValues: function() {
      var sqlValues = this.getAllSqlValues();

      _.forEach(this._schema, function(value, key) {
        if(value.exclude === 'always' || value.exclude === 'update' || value.autoIncrement === true) {
          delete sqlValues[key];
        }
      }, this);

      return sqlValues;
    },

    getPrimaryKeyData: function() {
      var sqlValues = this.getAllSqlValues();
      var data = {};

      _.forEach(this._primaryKeys, function(value) {
        data[value] = sqlValues[value];
      });

      return data;
    }
  };
};