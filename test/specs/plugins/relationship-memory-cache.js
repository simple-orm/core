describe('relationship memory cache', function() {
  before(function*() {
    this.simpleOrm = require('../../../orm/index');
    this.dataAdapterManager = this.simpleOrm.dataAdapterManager;
    this.dataLayer;
    this.testUserValues = require('../../test-user-values');
    this.sinon = require('sinon');
    this.relationshipMemoryCache = require('simple-orm-relationship-memory-cache');
  });

  beforeEach(function*() {
    yield this.dataAdapterManager.getInstance('instance1').startTransaction();
  });

  afterEach(function*() {
    yield this.dataAdapterManager.getInstance('instance1').rollbackTransaction();
  });

  describe('standard database naming', function() {
    before(function*() {
      this.dataLayer = require('../data-access/index').create(this.dataAdapterManager.getInstance('instance1'));
    });

    require('../tests/plugins/relationship-memory-cache')();
  });

  describe('non-standard database naming', function() {
    before(function*() {
      this.dataLayer = require('../data-access/index.non-standard').create(this.dataAdapterManager.getInstance('instance1'));
    });

    require('../tests/plugins/relationship-memory-cache')();
  });
});
