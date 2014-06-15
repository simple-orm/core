var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var sinonChai = require('sinon-chai');
var testUserValues = require('../../test-user-values');
var relationshipMemoryCache = require('simple-orm-relationship-memory-cache');

chai.use(sinonChai);

module.exports = function(dataLayer, dataAdapter) {
  describe('(PLUGIN) relationship memory caching', function() {
    beforeEach(function*(){
      //dataAdapter.enableDebug();
      yield dataAdapter.startTransaction();
    });

    afterEach(function*(){
      dataAdapter.disableDebug();
      yield dataAdapter.rollbackTransaction();
    });

    describe('caching', function() {
      it('should automatically happen when retrieving', function*() {
        var where = {};
        where[dataLayer.userDetail._model._primaryKeyColumns[0]]  = 1;
        var model = yield dataLayer.userDetail.find({
          where: where
        });
        model.plugin(relationshipMemoryCache);

        var spy = sinon.spy(dataAdapter, 'find');
        yield model.getUser();
        yield model.getUser();
        dataAdapter.find.restore();

        expect(spy).to.have.callCount(1);
      });

      it('should be able to clear all cache', function*() {
        var where = {};
        where[dataLayer.userDetail._model._primaryKeyColumns[0]] = 1;
        var model = yield dataLayer.userDetail.find({
          where: where
        });
        model.plugin(relationshipMemoryCache);

        var spy = sinon.spy(dataAdapter, 'find');
        yield model.getUser();
        model.clearRelationshipCache();
        yield model.getUser();
        dataAdapter.find.restore();

        expect(spy).to.have.callCount(2);
      });

      it('should be able to clear specific relationship cache', function*() {
        var where = {};
        where[dataLayer.userDetail._model._primaryKeyColumns[0]] = 1;
        var model = yield dataLayer.userDetail.find({
          where: where
        });
        model.plugin(relationshipMemoryCache);

        var spy = sinon.spy(dataAdapter, 'find');
        yield model.getUser();
        model.clearRelationshipCache('test');
        yield model.getUser();
        dataAdapter.find.restore();

        expect(spy).to.have.callCount(1);
      });

      it('should automatically clear all cache when saving model', function*() {
        var where = {};
        where[dataLayer.userDetail._model._primaryKeyColumns[0]] = 1;
        var model = yield dataLayer.userDetail.find({
          where: where
        });
        model.plugin(relationshipMemoryCache);

        var spy = sinon.spy(dataAdapter, 'find');
        yield model.getUser();
        model.details = 'test';
        yield model.save();
        yield model.getUser();
        dataAdapter.find.restore();

        expect(spy).to.have.callCount(2);
      });
    });
  });
};
