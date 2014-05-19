require('string-format-js');
var _ = require('lodash');
var bluebird = require('bluebird');
var squel = require("squel");

module.exports = function(model) {
  return {
    create: function(data) {
      data = data || {};
      var returnObject = Object.create(model);
      returnObject.init(data);
      return returnObject;
    },

    find: function(data) {
      var self = this;
      var defer = bluebird.defer();
      var query = squel
      .select()
      .from(model._table);

      _.forEach(model._selectColumns, function(value) {
        query.field(value);
      });

      _.forEach(data, function(value, key) {
        query.where('%s = ?'.format(key), value);
      });

      query = query.toParam();

      model._sqlAdapter.getRow(query.text, query.values).then(function(results) {
        var returnObject;

        if(!results) {
          returnObject = null
        } else {
          returnObject = self.create(results);
          returnObject._status = 'loaded';
        }

        defer.resolve(returnObject);
      }, function(error) {
        defer.reject(error);
      });

      return defer.promise;
    },

    findAll: function(data) {
      var self = this;
      var defer = bluebird.defer();
      var query = squel
      .select()
      .from(model._table);

      _.forEach(model._selectColumns, function(value) {
        query.field(value);
      });

      _.forEach(data, function(value, key) {
        query.where('%s = ?'.format(key), value);
      });

      query = query.toParam();

      model._sqlAdapter.getAll(query.text, query.values).then(function(results) {
        var collection = [];

        if(results) {
          _.forEach(results, function(row) {
            var newObject = self.create(row);
            newObject._status = 'loaded';
            collection.push(newObject);
          });
        }

        defer.resolve(collection);
      }, function(error) {
        defer.reject(error);
      });

      return defer.promise;
    }
  }
};