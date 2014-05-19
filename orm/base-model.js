require('string-format-js');
var _ = require('lodash');
var moment = require('moment');
var modelInitialization = require('./model-initialization');
var bluebird = require('bluebird');
var squel = require("squel");

var sqlDataConverters = {
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

module.exports = function(sqlAdapter) {
  return {
    _status: 'new',
    _sqlAdapter: sqlAdapter,

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
      var self = this;
      var defer = bluebird.defer();

      if(this._status === 'new') {
        var query = squel
        .insert()
        .into(self._table)
        .setFields(this.getInsertSqlValues())
        .toParam();
      } else if(this._status === 'dirty') {
        var query = squel
        .update()
        .table(self._table)
        .setFields(this.getUpdateSqlValues())
        .where('id = ?', [this.id])
        .toParam();
      } else {
        return true;
      }

      self._sqlAdapter.runQuery(query.text, query.values).then(function(results) {
        //set the insert id so the next select with execute properly
        if(self._insertIdColumn && results['insertId'] != 0) {
          self[self._insertIdColumn] = results['insertId'];
        }

        //we want to load the data from the database in order to pull values that are set by the database
        var selectQuery = squel
        .select()
        .from(self._table);

        _.forEach(self._selectColumns, function(value) {
          selectQuery.field(value);
        });

        var primaryKeyData = self.getPrimaryKeyData();

        _.forEach(primaryKeyData, function(value, key) {
          selectQuery.where('%s = ?'.format(key), value)
        });

        selectQuery = selectQuery.toParam();

        self._sqlAdapter.getRow(selectQuery.text, selectQuery.values).then(function(data) {
          self.loadData(data);
          self._status = 'loaded';
          defer.resolve(true);
        }, function(error) {
          defer.reject(error);
        });
      }, function(error) {
        defer.reject(error);
      });

      return defer.promise;
    },

    remove: function() {
      var self = this;
      var defer = bluebird.defer();
      var primaryKeyData = this.getPrimaryKeyData();
      var query = squel
      .delete()
      .from(self._table);

      _.forEach(primaryKeyData, function(value, key) {
        query.where('%s = ?'.format(key), value)
      });

      query = query.toParam();

      self._sqlAdapter.runQuery(query.text, query.values).then(function(results) {
        defer.resolve(true);
      }, function(error) {
        defer.reject(error);
      });

      return defer.promise;
    },

    toJSON: function() {
      return this._values;
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
        var accessorType = (value.type && sqlDataConverters[value.type]) ? value.type : 'generic';
        sqlValues[key] = sqlDataConverters[accessorType].apply(null, [this._values[key]]);
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