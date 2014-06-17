var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var sinonChai = require('sinon-chai');
var dataAdapterManager = require('../../orm/index').dataAdapterManager;
var dataAdapterSpy;
var mysqlConnectionSpy;

chai.use(sinonChai);

describe('', function() {
  before(function*() {
    dataAdapterManager.createInstance('instance1', require('simple-orm-mysql-adapter'), yield require('../mysql-connection-manager').getConnection());
    dataAdapterManager.createInstance('instance2', require('simple-orm-mysql-adapter'), yield require('../mysql-connection-manager').getConnection());
  });

  after(function*() {
    dataAdapterManager.releaseAllInstances();
  });

  var testFiles = [
    'transactions.js',
    'collection.js',
    'model.js',
    'repository.js',
    'hookable.js',
    'plugins/find-primary-key.js',
    'plugins/relationship-memory-cache.js',
    'plugins/validate.js',
    'data-adapter.js',
    'data-adapter-manager.js'
  ];

  testFiles.forEach(function(relativeFilePath) {
    require('./' + relativeFilePath);
  });
});
