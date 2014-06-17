var _ = require('lodash');
var S = require('string');

module.exports = function(baseDirectory, dataModuleFiles) {
  var dataModules = {};
  var repositories = {};

  dataModuleFiles.forEach(function(value) {
    var modelName = S(value).camelize().s;

    dataModules[modelName] = require(baseDirectory + '/' + value);
    repositories[modelName] = dataModules[modelName].repository;
  });

  return {
    create: function(dataAdapter) {
      var instance = {};

      _.forEach(repositories, function(repository, key) {
        instance[key] = Object.create(repository);
        instance[key].setDataAdapter(dataAdapter);
      });

      //do relationship setup in second loop to ensure that all model are available which in needed in order to apply relationships
      _.forEach(dataModules, function(rawModel) {
        if(rawModel.finalize) {
          rawModel.finalize(instance);
        }
      });

      return instance;
    }
  };
};
