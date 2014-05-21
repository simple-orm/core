var testModels = require('./index');
var simpleOrm = require('../orm/index');
var mysqlAdapter = require('simple-orm-mysql-adapter')(require('./mysql-connection'));
var expect = require('chai').expect;
var testModelValues = require('./test-model-values');
var moment = require('moment');

describe('instance', function() {
  beforeEach(function*(){
    yield mysqlAdapter.startTransaction();
  });

  afterEach(function*(){
    yield mysqlAdapter.rollbackTransaction();
  });

  describe('status', function() {
    it('should be `new` with new instance', function*() {
      var model = testModels.User.create();

      expect(model._status).to.equal('new');
    });

    it('should be `new` when modify data of a new instance', function*() {
      var model = testModels.User.create();

      model.firstName = 'test';

      expect(model._status).to.equal('new');
    });

    it('should be `loaded` with new instance', function*() {
      var model = yield testModels.User.find({id: 3});

      expect(model._status).to.equal('loaded');
    });

    it('should be `dirty` with instance that has unchanged data', function*() {
      var model = yield testModels.User.find({id: 3});

      model.firstName = 'test';

      expect(model._status).to.equal('dirty');
    });

    it('should be `loaded` with new instance after is save', function*() {

      var model = testModels.User.create({
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password'
      });

      yield model.save();

      expect(model._status).to.equal('loaded');
    });

    it('should be `loaded` with exist instance after is save', function*() {
      var model = yield testModels.User.find({id: 3});

      model.firstName = 'test';
      yield model.save();

      expect(model._status).to.equal('loaded');
    });
  });

  describe('data management', function() {
    it('should be able to create a new instance', function*() {
      var model = testModels.User.create({
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password'
      });

      yield model.save();

      testModelValues(model, {
        firstName:  'test',
        lastName:  'user',
        email:  'test.user@example.com',
        username:  'test.user',
        password:  'password',
        updatedTimestamp:  null,
        lastPasswordChangeDate:  null,
        requirePasswordChangeFlag: false,
        status:  'registered'
      });

      var modelFromDatabase = yield testModels.User.find({id: model.id});

      testModelValues(modelFromDatabase, {
        firstName:  'test',
        lastName:  'user',
        email:  'test.user@example.com',
        username:  'test.user',
        password:  'password',
        updatedTimestamp:  null,
        lastPasswordChangeDate:  null,
        requirePasswordChangeFlag: false,
        status:  'registered'
      });

      expect(modelFromDatabase.id).to.be.at.least(5);
      expect(modelFromDatabase.createdTimestamp).to.not.be.undefined;
    });

    it('should be able to update an instance', function*() {
      var start = moment().format('X');

      var model = yield testModels.User.find({id: 3});

      model.requirePasswordChangeFlag = true;
      model.save();

      testModelValues(model, {
        id: 3,
        firstName:  'John',
        lastName:  'Doe2',
        email:  'john.doe2@example.com',
        username:  'john.doe2',
        password:  'password',
        createdTimestamp:  '2014-05-17T19:51:49.000Z',
        updatedTimestamp:  null,
        lastPasswordChangeDate:  null,
        requirePasswordChangeFlag: true,
        status:  'active'
      });

      var modelFromDatabase = yield testModels.User.find({id: model.id});

      testModelValues(modelFromDatabase, {
        id: 3,
        firstName:  'John',
        lastName:  'Doe2',
        email:  'john.doe2@example.com',
        username:  'john.doe2',
        password:  'password',
        createdTimestamp:  '2014-05-17T19:51:49.000Z',
        lastPasswordChangeDate:  null,
        requirePasswordChangeFlag: true,
        status:  'active'
      });

      expect(moment(modelFromDatabase.updatedTimestamp).format('X') >= start).to.be.true;
    });

    it('should be able to delete an instance', function*() {
      var model = yield testModels.User.find({id: 3});

      expect(yield model.remove()).to.be.true;

      var model = yield testModels.User.find({id: 3});

      expect(model).to.be.null;
    });
  });

  describe('utilities', function() {
    it('should be able to convert to simple JSON', function*() {
      var model = testModels.User.create({
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password',
        updatedTimestamp:  null,
        lastPasswordChangeDate:  null,
        requirePasswordChangeFlag: false,
        status:  'registered'
      });

      expect(model.toJSON()).to.deep.equal({
        id: null,
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password',
        createdTimestamp:  null,
        updatedTimestamp:  null,
        lastPasswordChangeDate:  null,
        requirePasswordChangeFlag: false,
        status:  'registered'
      });
    });

    it('should be able to convert to load data in bulk', function*() {
      var model = testModels.User.create();

      model.loadData({
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password',
        updatedTimestamp:  null,
        lastPasswordChangeDate:  null,
        requirePasswordChangeFlag: false,
        status:  'registered'
      });

      expect(model.toJSON()).to.deep.equal({
        id: null,
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password',
        createdTimestamp:  null,
        updatedTimestamp:  null,
        lastPasswordChangeDate:  null,
        requirePasswordChangeFlag: false,
        status:  'registered'
      });
    });

    it('should be able to get primary key data', function*() {
      var model = yield testModels.User.find({id: 3});

      expect(model.getPrimaryKeyData()).to.deep.equal({
        id: 3
      });
    });

    it('should be able to get all sql values', function*() {
      var model = testModels.User.create({
        firstName:  'test',
        lastName:  'user',
        email:  'test.user@example.com',
        username:  'test.user',
        password:  'password',
        updatedTimestamp:  '13:24:35 12/23/10',
        lastPasswordChangeDate: '13:24:35 1/12/11',
        requirePasswordChangeFlag: false,
        status:  'registered'
      });

      expect(model.getAllSqlValues()).to.deep.equal({
        id: null,
        firstName:  'test',
        lastName:  'user',
        email:  'test.user@example.com',
        username:  'test.user',
        password:  'password',
        createdTimestamp:  null,
        updatedTimestamp:  '2010-12-23 13:24:35',
        lastPasswordChangeDate:  '2011-01-12',
        requirePasswordChangeFlag: 0,
        status:  'registered'
      });
    });

    it('should be able to get insert sql values', function*() {
      var model = testModels.User.create({
        firstName:  'test',
        lastName:  'user',
        email:  'test.user@example.com',
        username:  'test.user',
        password:  'password',
        updatedTimestamp:  '13:24:35 12/23/10',
        lastPasswordChangeDate:  '13:24:35 1/12/11',
        requirePasswordChangeFlag: false,
        status:  'registered'
      });

      expect(model.getInsertSqlValues()).to.deep.equal({
        firstName:  'test',
        lastName:  'user',
        email:  'test.user@example.com',
        username:  'test.user',
        password:  'password',
        lastPasswordChangeDate:  '2011-01-12',
        requirePasswordChangeFlag: 0,
        status:  'registered'
      });
    });

    it('should be able to get update sql values', function*() {
      var model = testModels.User.create({
        firstName:  'test',
        lastName:  'user',
        email:  'test.user@example.com',
        username:  'test.user',
        password:  'password',
        updatedTimestamp:  '13:24:35 12/23/10',
        lastPasswordChangeDate:  '13:24:35 1/12/11',
        requirePasswordChangeFlag: false,
        status:  'registered'
      });

      expect(model.getUpdateSqlValues()).to.deep.equal({
        firstName:  'test',
        email:  'test.user@example.com',
        username:  'test.user',
        password:  'password',
        updatedTimestamp:  '2010-12-23 13:24:35',
        lastPasswordChangeDate:  '2011-01-12',
        requirePasswordChangeFlag: 0,
        status:  'registered'
      });
    });
  });

  describe('data adapter', function() {
    it('should throw error if data adapter does not pass interface checker', function*() {
      var err = "The passed in data adapter has the following issue:"
      + "\nMissing insert method"
      + "\nMissing update method"
      + "\nMissing remove method"
      + "\nMissing find method"
      + "\nMissing findAll method"
      + "\nMissing startTransaction method"
      + "\nMissing commitTransaction method"
      + "\nMissing rollbackTransaction method";

      expect(function() {
        simpleOrm.baseModel({});
      }).to.throw(err);
    });
  });

  describe('bug cases', function() {
    it('invalid date/datetime should return as null', function*() {
      var model = testModels.User.create();

      model.lastPasswordChangeDate = '0000-00-00';
      model.createdTimestamp = '0000-00-00 00:00:00';

      expect(model.lastPasswordChangeDate).to.be.null;
      expect(model.createdTimestamp).to.be.null;
    });
  });
});