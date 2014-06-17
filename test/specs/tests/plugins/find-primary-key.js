var expect = require('chai').expect;

module.exports = function() {
  it('should be able find a single model by primary key', function*() {
    var model = yield this.dataLayer.user.find(3);

    this.testUserValues(model, {
      id: 3,
      firstName: 'John',
      lastName: 'Doe2',
      email: 'john.doe2@example.com',
      username: 'john.doe2',
      password: 'password',
      createdTimestamp: '2014-05-17T19:51:49.000Z',
      updatedTimestamp: null,
      lastPasswordChangeDate: null,
      requirePasswordChangeFlag: false,
      status: 'active'
    });
  });
};
