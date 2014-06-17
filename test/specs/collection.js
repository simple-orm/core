describe('collection', function() {
  before(function*() {
    this.simpleOrm = require('../../orm/index');
    this.dataAdapterManager = this.simpleOrm.dataAdapterManager;
    expect = require('chai').expect;
    this.dataLayer;
    this.collection;
    this.model1;
    this.model2;
  });

  beforeEach(function*() {
    var where1 = {};
    where1[this.dataLayer.user._model._primaryKeyColumns[0]] = 1;
    this.model1 = yield this.dataLayer.user.find({
      where: where1
    });

    var where2 = {};
    where2[this.dataLayer.user._model._primaryKeyColumns[0]] = 2;
    this.model2 = yield this.dataLayer.user.find({
      where: where2
    });

    this.collection = this.simpleOrm.collection.create();
  });

  describe('standard database naming', function() {
    before(function*() {
      this.dataLayer = require('./data-access/index').create(this.dataAdapterManager.getInstance('instance1'));
    });

    require('./tests/collection')();
  });

  describe('standard database naming', function() {
    before(function*() {
      this.dataLayer = require('./data-access/index.non-standard').create(this.dataAdapterManager.getInstance('instance1'));
    });

    require('./tests/collection')();
  });
});
