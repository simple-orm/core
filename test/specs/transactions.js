describe('transactions', function() {
  before(function*() {
    this.simpleOrm = require('../../orm/index');
    this.dataAdapterManager = this.simpleOrm.dataAdapterManager;
    this.dataLayer;
    this.dataLayer2;
  });

  beforeEach(function*() {
    yield this.dataAdapterManager.getInstance('instance1').startTransaction();
    yield this.dataAdapterManager.getInstance('instance2').startTransaction();
  });

  afterEach(function*() {
    yield this.dataAdapterManager.getInstance('instance1').rollbackTransaction();
    yield this.dataAdapterManager.getInstance('instance2').rollbackTransaction();
  });

  describe('standard database naming', function() {
    before(function*() {
      this.dataLayer = require('./data-access/index').create(this.dataAdapterManager.getInstance('instance1'));
      this.dataLayer2 = require('./data-access/index').create(this.dataAdapterManager.getInstance('instance2'));
    });

    require('./tests/transactions')();
  });

  describe('non-standard database naming', function() {
    before(function*() {
      this.dataLayer = require('./data-access/index.non-standard').create(this.dataAdapterManager.getInstance('instance1'));
      this.dataLayer2 = require('./data-access/index.non-standard').create(this.dataAdapterManager.getInstance('instance2'));
    });

    require('./tests/transactions')();
  });
});
