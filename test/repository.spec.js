var testModels = require('./index');
var mysqlAdapter = require('simple-orm-mysql-adapter')(require('./mysql-connection'));
var expect = require('chai').expect;
var testModelValues = require('./test-model-values');

describe('repository', function() {
  beforeEach(function*(){
    yield mysqlAdapter.startTransaction();
  });

  afterEach(function*(){
    yield mysqlAdapter.rollbackTransaction();
  });

  describe('create', function() {
    it('should be able create a new instance', function*() {
      var model = testModels.User.create({
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password'
      });

      testModelValues(model, {
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
      var model = yield testModels.User.find({firstName: 'John'});

      testModelValues(model, {
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
      var models = yield testModels.User.findAll({firstName: 'John'});

      testModelValues(models[0], {
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

      testModelValues(models[1], {
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