var _ = require('lodash');
var S = require('string');

//new model just need to be added to this array, everything else is handled automatically
var dataModuleFiles = [
  'user',
  'user2',
  'user-detail',
  'user-detail-test1',
  'user-email',
  'user-email-test1',
  'user-email-custom-getter',
  'user-email-custom-setter',
  'permission',
  'permission-hook',
  'user-permission-map',
  'validate'
];

var rawDataModules = {};
var repositories = {};

dataModuleFiles.forEach(function(value) {
  var modelName = S(value).camelize().s;
  rawDataModules[modelName] = require('./repositories/' + value);

  repositories[modelName] = rawDataModules[modelName].repository;
});

//do relationship setup in second loop to ensure that all model are available which in needed in order to apply relationships
_.forEach(rawDataModules, function(rawModel) {
  if(rawModel.setupRelationships) {
    rawModel.setupRelationships(repositories);
  }
});

module.exports = repositories;
