describe('data adapter manager', function() {
  before(function*() {
    this.simpleOrm = require('../../orm/index');
    this.dataAdapterManager = this.simpleOrm.dataAdapterManager;
    this.sinon = require('sinon');
  });

  describe('mysql', function() {
    require('./tests/data-adapter-manager')();
  });
});
