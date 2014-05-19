require('string-format-js');
var _ = require('lodash');
var moment = require('moment');
var modelInitialization = require('./model-initialization');
var bluebird = require('bluebird');
var queryHelper = require('./query-helper');
var objectToArray = require('./object-to-array');

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

module.exports = {
  _status: 'new',
  define: function(table, schema) {
    this.table = table;
    this.schema = schema;
    this._selectFields = [];

    _.forEach(this.schema, function(value) {
      this._selectFields.push(value.column);
    }, this);
  },
  init: function(data) {
    modelInitialization.apply(this, [this.schema]);
    this.loadData(data);
  },
  save: function() {
    var self = this;
    var defer = bluebird.defer();

    if(this._status === 'new') {
      var sqlData = this.getInsertSqlValues();
      var data = queryHelper.buildInsertData(sqlData);
      var query = ("INSERT INTO %s(??) VALUES(?)").format(self.table);
    } else if(this._status === 'dirty') {
      var sqlData = this.getUpdateSqlValues();
      var query = ("UPDATE %s SET").format(self.table);
      var data = [];

      _.forEach(sqlData, function(value, field) {
        if(data.length > 0) {
          query += ',';
        }

        query += ' ?? = ?';
        data.push(field);
        data.push(value);
      });

      query += ' WHERE `id` = ?';
      data.push(this.id);
    } else {
      return true;
    }

    queryHelper.runQuery(query, data).then(function(results) {
      //we want to load the data from the database in order to pull values that are set by the database
      //TODO: what about updates where insertId is empty?
      queryHelper.getRow((queryHelper.buildSelectStatement(self._selectFields) + " FROM %s WHERE `id` = ?").format(self.table), [results['insertId']]).then(function(data) {
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
  delete: function() {
    var self = this;
    var defer = bluebird.defer();
    var primaryKeyData = this.getPrimaryKeyData();
    var query = ("DELETE FROM %s " + queryHelper.buildWhereStatement(primaryKeyData)).format(self.table);
    var params = objectToArray(primaryKeyData);

    queryHelper.runQuery(query, params).then(function(results) {
      defer.resolve(true);
    }, function(error) {
      defer.reject(error);
    });

    return defer.promise;
  },
  toJSON: function() {
    return this.values;
  },
  loadData: function(data) {
    if(data && _.isObject(data)) {
      _.forEach(this.schema, function(value, key) {
        if(data[key] !== undefined) {
          this[key] = data[key];
        }
      }, this);
    }
  },
  getAllSqlValues: function() {
    var sqlValues = {};

    _.forEach(this.schema, function(value, key) {
      var accessorType = (value.type && sqlDataConverters[value.type]) ? value.type : 'generic';
      sqlValues[key] = sqlDataConverters[accessorType].apply(null, [this.values[key]]);
    }, this);

    return sqlValues;
  },
  getInsertSqlValues: function() {
    var sqlValues = this.getAllSqlValues();

    _.forEach(this.schema, function(value, key) {
      if(value.exclude === 'always' || value.exclude === 'insert' || value.autoIncrement === true) {
        delete sqlValues[key];
      }
    }, this);

    return sqlValues;
  },
  getUpdateSqlValues: function() {
    var sqlValues = this.getAllSqlValues();

    _.forEach(this.schema, function(value, key) {
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