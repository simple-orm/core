describe('model', function() {
  before(function*() {
    this.simpleOrm = require('../../orm/index');
    this.dataAdapterManager = this.simpleOrm.dataAdapterManager;
    this.dataLayer;
    this.testUserValues = require('../test-user-values');
  });

  beforeEach(function*() {
    yield this.dataAdapterManager.getInstance('instance1').startTransaction();
  });

  afterEach(function*() {
    yield this.dataAdapterManager.getInstance('instance1').rollbackTransaction();
  });

  describe('standard database naming', function() {
    before(function*() {
      this.dataLayer = require('./data-access/index').create(this.dataAdapterManager.getInstance('instance1'));
    });

    require('./tests/model')({
      userPermissionMapUserField: 'userId',
      userPermissionMapPermissionField: 'permissionId'
    });
  });

  describe('non-standard database naming', function() {
    before(function*() {
      this.dataLayer = require('./data-access/index.non-standard').create(this.dataAdapterManager.getInstance('instance1'));
    });

    require('./tests/model')({
      userPermissionMapUserField: '__user_Id__',
      userPermissionMapPermissionField: 'PER_mission_iD'
    });
  });
});
