require('string-format-js');
var _ = require('lodash');
var bluebird = require('bluebird');

module.exports = function(model) {
  return {
    create: function(data) {
      data = data || {};
      var returnObject = Object.create(model);
      returnObject.init(data);
      return returnObject;
    },

    find: function(data) {
      var defer = bluebird.defer();

      model._dataAdapter.find(model, data, this.create).then(function(results) {
        defer.resolve(results);
      }, function(error) {
        defer.reject(error);
      });

      return defer.promise;
    },

    findAll: function(data) {
      var defer = bluebird.defer();

      model._dataAdapter.findAll(model, data, this.create).then(function(results) {
        defer.resolve(results);
      }, function(error) {
        defer.reject(error);
      });

      return defer.promise;
    }
  }
};