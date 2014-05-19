require('string-format-js');
var _ = require('lodash');
var bluebird = require('bluebird');
var queryHelper = require('./query-helper');
var objectToArray = require('./object-to-array');

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
      var params = objectToArray(data);

      queryHelper.getRow((queryHelper.buildSelectStatement(model._selectFields) + " FROM %s " + queryHelper.buildWhereStatement(data)).format(model.table), params).then(function(results) {
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
      var params = objectToArray(data);

      queryHelper.getAll((queryHelper.buildSelectStatement(model._selectFields) + " FROM %s " + queryHelper.buildWhereStatement(data)).format(model.table), params).then(function(results) {
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