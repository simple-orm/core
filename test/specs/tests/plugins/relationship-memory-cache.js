var expect = require('chai').expect;

module.exports = function() {
  it('should automatically happen when retrieving', function*() {
    var where = {};
    where[this.dataLayer.userDetail._model._primaryKeyColumns[0]]  = 1;
    var model = yield this.dataLayer.userDetail.find({
      where: where
    });
    model.plugin(this.relationshipMemoryCache);

    var spy = this.sinon.spy(this.dataAdapterManager.getInstance('instance1'), 'find');
    yield model.getUser();
    yield model.getUser();
    this.dataAdapterManager.getInstance('instance1').find.restore();

    expect(spy).to.have.callCount(1);
  });

  it('should be able to clear all cache', function*() {
    var where = {};
    where[this.dataLayer.userDetail._model._primaryKeyColumns[0]] = 1;
    var model = yield this.dataLayer.userDetail.find({
      where: where
    });
    model.plugin(this.relationshipMemoryCache);

    var spy = this.sinon.spy(this.dataAdapterManager.getInstance('instance1'), 'find');
    yield model.getUser();
    model.clearRelationshipCache();
    yield model.getUser();
    this.dataAdapterManager.getInstance('instance1').find.restore();

    expect(spy).to.have.callCount(2);
  });

  it('should be able to clear specific relationship cache', function*() {
    var where = {};
    where[this.dataLayer.userDetail._model._primaryKeyColumns[0]] = 1;
    var model = yield this.dataLayer.userDetail.find({
      where: where
    });
    model.plugin(this.relationshipMemoryCache);

    var spy = this.sinon.spy(this.dataAdapterManager.getInstance('instance1'), 'find');
    yield model.getUser();
    model.clearRelationshipCache('test');
    yield model.getUser();
    this.dataAdapterManager.getInstance('instance1').find.restore();

    expect(spy).to.have.callCount(1);
  });

  it('should automatically clear all cache when saving model', function*() {
    var where = {};
    where[this.dataLayer.userDetail._model._primaryKeyColumns[0]] = 1;
    var model = yield this.dataLayer.userDetail.find({
      where: where
    });
    model.plugin(this.relationshipMemoryCache);

    var spy = this.sinon.spy(this.dataAdapterManager.getInstance('instance1'), 'find');
    yield model.getUser();
    model.details = 'test';
    yield model.save();
    yield model.getUser();
    this.dataAdapterManager.getInstance('instance1').find.restore();

    expect(spy).to.have.callCount(2);
  });
};
