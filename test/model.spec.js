var dataLayer = require('./index');
var simpleOrm = require('../orm/index');
var mysqlAdapter = require('simple-orm-mysql-adapter')(require('./mysql-connection'));
var expect = require('chai').expect;
var testUserValues = require('./test-user-values');
var moment = require('moment');

describe('instance', function() {
  beforeEach(function*(){
    //mysqlAdapter.enableDebug();
    yield mysqlAdapter.startTransaction();
  });

  afterEach(function*(){
    mysqlAdapter.disableDebug();
    yield mysqlAdapter.rollbackTransaction();
  });

  describe('status', function() {
    it('should be `new` with new instance', function*() {
      var model = dataLayer.user.create();

      expect(model._status).to.equal('new');
    });

    it('should be `new` when modify data of a new instance', function*() {
      var model = dataLayer.user.create();

      model.firstName = 'test';

      expect(model._status).to.equal('new');
    });

    it('should be `loaded` with new instance', function*() {
      var model = yield dataLayer.user.find({
        where: {
          id: 3
        }
      });

      expect(model._status).to.equal('loaded');
    });

    it('should be `dirty` with instance that has unchanged data', function*() {
      var model = yield dataLayer.user.find({
        where: {
          id: 3
        }
      });

      model.firstName = 'test';

      expect(model._status).to.equal('dirty');
    });

    it('should be `loaded` with new instance after is save', function*() {

      var model = dataLayer.user.create({
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
      var model = yield dataLayer.user.find({
        where: {
          id: 3
        }
      });

      model.firstName = 'test';
      yield model.save();

      expect(model._status).to.equal('loaded');
    });
  });

  describe('data management', function() {
    it('should be able to create a new instance', function*() {
      var model = dataLayer.user.create({
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password'
      });

      yield model.save();

      testUserValues(model, {
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

      var modelFromDatabase = yield dataLayer.user.find({
        where: {
          id: model.id
        }
      });

      testUserValues(modelFromDatabase, {
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

      var model = yield dataLayer.user.find({
        where: {
          id: 3
        }
      });

      model.requirePasswordChangeFlag = true;
      model.save();

      testUserValues(model, {
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

      var modelFromDatabase = yield dataLayer.user.find({
        where: {
          id: model.id
        }
      });

      testUserValues(modelFromDatabase, {
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
      var model = yield dataLayer.user.find({
        where: {
          id: 3
        }
      });

      expect(yield model.remove()).to.be.true;

      var model = yield dataLayer.user.find({
        where: {
          id: 3
        }
      });

      expect(model).to.be.null;
    });

    it('should be able to define a custom property getter', function*() {
      var model = yield dataLayer.userEmailCustomGetter.find({
        where: {
          id: 3
        }
      });

      //should work when getting in regular way
      expect(model.email).to.equal('getter-three@example.com');

      //should work when exporting to JSON
      expect(model.toJSON()).to.deep.equal({
        id: 3,
        userId: 3,
        email: 'getter-three@example.com'
      });
    });

    it('should be able to define a custom property setter', function*() {
      var model = yield dataLayer.userEmailCustomSetter.find({
        where: {
          id: 3
        }
      });

      model.email = 'test@example.com';

      //should properly set the value
      expect(model.email).to.equal('setter-test@example.com');

      yield model.save();

      var freshModel = yield dataLayer.userEmailCustomSetter.find({
        where: {
          id: 3
        }
      });

      //should properly save to the database
      expect(freshModel.email).to.equal('setter-test@example.com');
    });
  });

  describe('relationships', function() {
    it('should be able to define a hasOne relationship', function*() {
      var model = yield dataLayer.user.find({
        where: {
          id: 1
        }
      });

      var relationalModel = yield model.getUserDetail();

      expect(relationalModel.id).to.equal(1);
      expect(relationalModel.userId).to.equal(1);
      expect(relationalModel.details).to.equal('one');
    });

    it('should be able to define belongsTo relationships', function*() {
      var model = yield dataLayer.userDetail.find({
        where: {
          id: 1
        }
      });

      var relationalModel = yield model.getUser();

      testUserValues(relationalModel, {
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

    it('should be able to define hasMany relationships', function*() {
      var model = yield dataLayer.user.find({
        where: {
          id: 1
        }
      });

      var relationalModels = yield model.getUserEmails();

      expect(relationalModels[0].id).to.equal(1);
      expect(relationalModels[0].userId).to.equal(1);
      expect(relationalModels[0].email).to.equal('one@example.com');

      expect(relationalModels[1].id).to.equal(5);
      expect(relationalModels[1].userId).to.equal(1);
      expect(relationalModels[1].email).to.equal('five@example.com');
    });

    it('should be able to define hasMany relationships with through model', function*() {
      var model = yield dataLayer.user.find({
        where: {
          id: 3
        }
      });

      var relationalModels = yield model.getPermissions();

      expect(relationalModels[0].id).to.equal(1);
      expect(relationalModels[0].title).to.equal('user.create');

      expect(relationalModels[1].id).to.equal(2);
      expect(relationalModels[1].title).to.equal('user.read');

      expect(relationalModels[2].id).to.equal(3);
      expect(relationalModels[2].title).to.equal('user.update');

      expect(relationalModels[3].id).to.equal(4);
      expect(relationalModels[3].title).to.equal('user.delete');
    });

    it('should be able to define hasMany relationship with through model defining fields', function*() {
      var model = yield dataLayer.user2.find({
        where: {
          id: 3
        }
      });

      //TODO: research: switch this to test for error but test error that are throw from a generator does not seem to be working and this functionality could
      //TODO: break while this test might still pass
      /*var err = "Error: ER_BAD_FIELD_ERROR: Unknown column 'UserPermissionMap.test' in 'on clause'";

      expect(function*() {
        yield model.getPermissions();
      }).to.throw(err);*/

      var relationalModels = yield model.getPermissions();

      expect(relationalModels[0].id).to.equal(1);
      expect(relationalModels[0].title).to.equal('user.create');

      expect(relationalModels[1].id).to.equal(2);
      expect(relationalModels[1].title).to.equal('user.read');

      expect(relationalModels[2].id).to.equal(3);
      expect(relationalModels[2].title).to.equal('user.update');

      expect(relationalModels[3].id).to.equal(4);
      expect(relationalModels[3].title).to.equal('user.delete');
    });
  });

  describe('utilities', function() {
    it('should be able to convert to simple JSON', function*() {
      var model = dataLayer.user.create({
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
      var model = dataLayer.user.create();

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
      var model = yield dataLayer.user.find({
        where: {
          id: 3
        }
      });

      expect(model.getPrimaryKeyData()).to.deep.equal({
        id: 3
      });
    });

    it('should be able to get all sql values', function*() {
      var model = dataLayer.user.create({
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
      var model = dataLayer.user.create({
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
      var model = dataLayer.user.create({
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
      var model = dataLayer.user.create();

      model.lastPasswordChangeDate = '0000-00-00';
      model.createdTimestamp = '0000-00-00 00:00:00';

      expect(model.lastPasswordChangeDate).to.be.null;
      expect(model.createdTimestamp).to.be.null;
    });
  });
});