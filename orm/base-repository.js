require('string-format-js');
var _ = require('lodash');
var bluebird = require('bluebird');

module.exports = function(model) {
  return {
    _model: model,
    create: function(data) {
      data = data || {};
      var returnObject = Object.create(model);
      returnObject.init(data);
      return returnObject;
    },

    find: function(criteria) {
      var defer = bluebird.defer();

      model._dataAdapter.find(model, criteria, this.create).then(function(results) {
        defer.resolve(results);
      }, function(error) {
        defer.reject(error);
      });

      return defer.promise;
    },

    findAll: function(criteria) {
      var defer = bluebird.defer();

      model._dataAdapter.findAll(model, criteria, this.create).then(function(results) {
        defer.resolve(results);
      }, function(error) {
        defer.reject(error);
      });

      return defer.promise;
    }
  }
};