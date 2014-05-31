var dataLayer = require('./index');
var mysqlAdapter = require('simple-orm-mysql-adapter')(require('./mysql-connection'));
var expect = require('chai').expect;
var testUserValues = require('./test-user-values');

describe('repository', function() {
  beforeEach(function*(){
    //mysqlAdapter.enableDebug();
    yield mysqlAdapter.startTransaction();
  });

  afterEach(function*(){
    mysqlAdapter.disableDebug();
    yield mysqlAdapter.rollbackTransaction();
  });

  describe('create', function() {
    it('should be able create a new instance', function*() {
      var model = dataLayer.user.create({
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password'
      });

      testUserValues(model, {
        id:  undefined,
        firstName:  'test',
        lastName:  'user',
        email:  'test.user@example.com',
        username:  'test.user',
        password:  'password',
        createdTimestamp:  undefined,
        updatedTimestamp:  null,
        lastPasswordChangeDate:  null,
        requirePasswordChangeFlag: false,
        status:  'registered'
      });
    });
  });

  describe('data retrieval', function() {
    it('should be able find a single model', function*() {
      var model = yield dataLayer.user.find({
        where: {
          firstName: 'John'
        }
      });

      testUserValues(model, {
        id:  1,
        firstName:  'John',
        lastName:  'Doe',
        email:  'john.doe@example.com',
        username:  'john.doe',
        password:  'password',
        createdTimestamp:  '2014-05-17T19:50:15.000Z',
        updatedTimestamp:  null,
        lastPasswordChangeDate:  null,
        requirePasswordChangeFlag: true,
        status:  'registered'
      });
    });

    it('should be able find a multiple models', function*() {
      var models = yield dataLayer.user.findAll({
        where: {
          firstName: 'John'
        }
      });

      testUserValues(models[0], {
        id:  1,
        firstName:  'John',
        lastName:  'Doe',
        email:  'john.doe@example.com',
        username:  'john.doe',
        password:  'password',
        createdTimestamp:  '2014-05-17T19:50:15.000Z',
        updatedTimestamp:  null,
        lastPasswordChangeDate:  null,
        requirePasswordChangeFlag: true,
        status:  'registered'
      });

      testUserValues(models[1], {
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

  describe('advance queries', function() {
    describe('comparison types', function() {
      it('should support single value', function*() {
        var models = yield dataLayer.user.findAll({
          where: {
            id: {
              comparison: '>',
              value: 1
            }
          }
        });

        expect(models.length).to.equal(3);
      });

      it('should support multiple valued', function*() {
        var models = yield dataLayer.user.findAll({
          where: {
            id: {
              comparison: 'not in',
              value: [
                2,
                4
              ]
            }
          }
        });

        expect(models.length).to.equal(2);
      });

      it('should support no value', function*() {
        var models = yield dataLayer.user.findAll({
          where: {
            id: {
              comparison: 'IS NULL'
            }
          }
        });

        expect(models.length).to.equal(0);
      });

      it('should support between valued', function*() {
        var models = yield dataLayer.user.findAll({
          where: {
            id: {
              comparison: 'between',
              value: [
                2,
                3
              ]
            }
          }
        });

        expect(models.length).to.equal(2);
      });
    });

    it('should be able to join with other models', function*() {
      var models = yield dataLayer.user.findAll({
        join: [{
          repository: dataLayer.userEmail,
          on: {
            'Users.id': {
              value: 'UserEmails.userId',
              valueType: 'field'
            },
            'UserEmails.email': {
              comparison: '!=',
              value: "one@example.'com"
            }
          }
        }]
      });

      expect(models.length).to.equal(4);
    });
  })
});