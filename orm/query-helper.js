var _ = require('lodash');
var bluebird = require('bluebird');
var mysql = require('mysql');
var configuration = require('../configurations/data.json');
var debug = false;

var connection = mysql.createConnection({
  host: configuration.host,
  user: configuration.username,
  password: configuration.password,
  port: configuration.port,
  database: configuration.database
});

module.exports = {
  startTransaction: function() {
    var defer = bluebird.defer();

    this.runQuery("START TRANSACTION").then(function(results) {
      defer.resolve(results);
    }, function(error) {
      defer.reject(error);
    });

    return defer.promise;
  },

  commitTransaction: function() {
    var defer = bluebird.defer();

    this.runQuery("COMMIT").then(function(results) {
      defer.resolve(results);
    }, function(error) {
      defer.reject(error);
    });

    return defer.promise;
  },

  rollbackTransaction: function() {
    var defer = bluebird.defer();

    this.runQuery("ROLLBACK").then(function(results) {
      defer.resolve(results);
    }, function(error) {
      defer.reject(error);
    });

    return defer.promise;
  },

  getOne: function(query, params) {
    var defer = bluebird.defer();

    this.runQuery(query, params).then(function(results) {
      defer.resolve(results[0][Object.keys(results[0])[0]]);
    }, function(error) {
      defer.reject(error);
    });

    return defer.promise;
  },

  getRow: function(query, params) {
    var defer = bluebird.defer();

    this.runQuery(query, params).then(function(results) {
      defer.resolve(results[0]);
    }, function(error) {
      defer.reject(error);
    });

    return defer.promise;
  },

  //must only select one property in query for guaranteed results
  getColumn: function(query, params) {
    var defer = bluebird.defer();

    this.runQuery(query, params).then(function(results) {
      defer.resolve(_.pluck(results, Object.keys(results[0])[0]));
    }, function(error) {
      defer.reject(error);
    });

    return defer.promise;
  },

  getAll: function(query, params) {
    var defer = bluebird.defer();

    this.runQuery(query, params).then(function(results) {
      defer.resolve(results);
    }, function(error) {
      defer.reject(error);
    });

    return defer.promise;
  },

  runQuery: function(query, params) {
    var defer = bluebird.defer();

    var sql = connection.query(query, params, function(error, results) {
      if(error) {
        defer.reject(error);
      }

      defer.resolve(results);
    });

    if(debug === true) {
      console.log('QUERY: ' + sql.sql);
    }

    return defer.promise;
  },

  buildWhereStatement: function(data) {
    var where = '';

    _.forEach(data, function(value, key) {
      if(where) {
        where += ' AND'
      }

      where += ' ?? = ?';
    });

    if(where) {
      where = 'WHERE' + where;
    }

    return where;
  },

  buildInsertData: function(data) {
    var fields = [];
    var values = [];

    _.forEach(data, function(value, field) {
      fields.push(field);
      values.push(value);
    });

    return [
      fields,
      values
    ];
  },

  buildSelectStatement: function(fields) {
    var select = 'SELECT';

    _.forEach(fields, function(value, key) {
      if(key > 0) {
        select += ',';
      }
      select += ' ' + value;
    });

    return select;
  }
};