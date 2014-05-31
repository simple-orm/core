require('string-format-js');
var _ = require('lodash');
var bluebird = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var hookable = require('./hookable');

module.exports = function(model, dataAdapter) {
  var baseRepository = Object.create(hookable);

  _.extend(baseRepository, {
    _emitter: new EventEmitter(),
    _hooks: {},
    _model: model,
    _dataAdapter: dataAdapter,
    create: function(data) {
      data = data || {};
      var returnObject = Object.create(model);
      returnObject.init(data);
      return returnObject;
    },

    find: function(criteria) {
      var defer = bluebird.defer();

      this.runHooks('beforeFind', [criteria]);

      this._dataAdapter.find(model, criteria, this.create).then((function(results) {
        this.runHooks('afterFind', [results]);
        defer.resolve(results);
      }).bind(this), function(error) {
        defer.reject(error);
      });

      return defer.promise;
    },

    findAll: function(criteria) {
      var defer = bluebird.defer();

      this.runHooks('beforeFindAll', [criteria]);

      this._dataAdapter.findAll(model, criteria, this.create).then((function(results) {
        this.runHooks('afterFindAll', [results]);
        defer.resolve(results);
      }).bind(this), function(error) {
        defer.reject(error);
      });

      return defer.promise;
    }
  });

  return baseRepository;
};