var expect = require('chai').expect;
var testUserValues = require('../../test-user-values');

module.exports = function(dataLayer, dataAdapter) {
  describe('(PLUGIN) find by primary key', function() {
    beforeEach(function*(){
      //dataAdapter.enableDebug();
      yield dataAdapter.startTransaction();
    });

    afterEach(function*(){
      dataAdapter.disableDebug();
      yield dataAdapter.rollbackTransaction();
    });

    describe('data retrieval', function() {
      it('should be able find a single model by primary key', function*() {
        var model = yield dataLayer.user.find(3);

        testUserValues(model, {
          id:  3,
          firstName:  'John',
          lastName:  'Doe2',
          email:  'john.doe2@example.com',
          username:  'john.doe2',
          password:  'password',
          createdTimestamp:  '2014-05-17T19:51:49.000Z',
          updatedTimestamp:  null,
          lastPasswordChangeDate:  null,
          requirePasswordChangeFlag: false,
          status:  'active'
        });
      });
    });
  });
};
