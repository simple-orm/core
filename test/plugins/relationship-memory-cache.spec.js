var dataLayer = require('../index');
var dataAdapter = require('simple-orm-mysql-adapter')(require('../mysql-connection'));
var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect;
var sinonChai = require('sinon-chai');
var testUserValues = require('../test-user-values');
var relationshipMemoryCache = require('simple-orm-relationship-memory-cache');

chai.use(sinonChai);

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
      var model = yield dataLayer.userDetail.find({
        where: {
          id: 1
        }
      });
      model.plugin(relationshipMemoryCache);

      var spy = sinon.spy(dataAdapter, 'find');
      yield model.getUser();
      yield model.getUser();
      dataAdapter.find.restore();

      expect(spy).to.have.callCount(1);
    });

    it('should be able to clear all cache', function*() {
      var model = yield dataLayer.userDetail.find({
        where: {
          id: 1
        }
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
      var model = yield dataLayer.userDetail.find({
        where: {
          id: 1
        }
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
      var model = yield dataLayer.userDetail.find({
        where: {
          id: 1
        }
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
