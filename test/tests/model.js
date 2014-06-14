var simpleOrm = require('../../orm/index');
var expect = require('chai').expect;
var testUserValues = require('../test-user-values');
var moment = require('moment');

module.exports = function(dataLayer, dataAdapter) {
  describe('model', function() {
    beforeEach(function*(){
      //dataAdapter.enableDebug();
      yield dataAdapter.startTransaction();
    });

    afterEach(function*(){
      dataAdapter.disableDebug();
      yield dataAdapter.rollbackTransaction();
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
        var where = {};
        where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 3;
        var model = yield dataLayer.user.find({
          where: where
        });

        expect(model._status).to.equal('loaded');
      });

      it('should be `dirty` with instance that has unchanged data', function*() {
        var where = {};
        where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 3;
        var model = yield dataLayer.user.find({
          where: where
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
      it('should be able to save a new instance', function*() {
        var model = dataLayer.user.create({
          firstName: 'test',
          lastName: 'user',
          email: 'test.user@example.com',
          username: 'test.user',
          password: 'password'
        });

        yield model.save();

        testUserValues(model, {
          firstName: 'test',
          lastName: 'user',
          email: 'test.user@example.com',
          username: 'test.user',
          password: 'password',
          updatedTimestamp: null,
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: false,
          status: 'registered'
        });

        var where = {};
        where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = model.id;
        var modelFromDatabase = yield dataLayer.user.find({
          where: where
        });

        testUserValues(modelFromDatabase, {
          firstName: 'test',
          lastName: 'user',
          email: 'test.user@example.com',
          username: 'test.user',
          password: 'password',
          updatedTimestamp: null,
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: false,
          status: 'registered'
        });

        expect(modelFromDatabase.id).to.be.at.least(5);
        expect(modelFromDatabase.createdTimestamp).to.not.be.undefined;
      });

      it('should be able to update an instance', function*() {
        var start = moment().format('X');

        var where = {};
        where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 3;
        var model = yield dataLayer.user.find({
          where: where
        });

        model.requirePasswordChangeFlag = true;
        yield model.save();

        testUserValues(model, {
          id: 3,
          firstName: 'John',
          lastName: 'Doe2',
          email: 'john.doe2@example.com',
          username: 'john.doe2',
          password: 'password',
          createdTimestamp: '2014-05-17T19:51:49.000Z',
          updatedTimestamp: null,
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: true,
          status: 'active'
        });

        var where = {};
        where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = model.id;
        var modelFromDatabase = yield dataLayer.user.find({
          where: where
        });

        testUserValues(modelFromDatabase, {
          id: 3,
          firstName: 'John',
          lastName: 'Doe2',
          email: 'john.doe2@example.com',
          username: 'john.doe2',
          password: 'password',
          createdTimestamp: '2014-05-17T19:51:49.000Z',
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: true,
          status: 'active'
        });

        expect(moment(modelFromDatabase.updatedTimestamp).format('X') >= start).to.be.true;
      });

      it('should be able to delete an instance', function*() {
        var where = {};
        where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 3;
        var model = yield dataLayer.user.find({
          where: where
        });

        expect(yield model.remove()).to.be.true;

        var where = {};
        where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 3;
        var model = yield dataLayer.user.find({
          where: where
        });

        expect(model).to.be.null;
      });

      it('should be able to load data in bulk', function*() {
        var model = dataLayer.user.create();

        model.loadData({
          firstName: 'test',
          lastName: 'user',
          email: 'test.user@example.com',
          username: 'test.user',
          password: 'password',
          updatedTimestamp: null,
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: false,
          status: 'registered'
        });

        testUserValues(model, {
          id: null,
          firstName: 'test',
          lastName: 'user',
          email: 'test.user@example.com',
          username: 'test.user',
          password: 'password',
          createdTimestamp: null,
          updatedTimestamp: null,
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: false,
          status: 'registered'
        });
      });

      it('should be able to define a custom property getter', function*() {
        var where = {};
        where[Object.keys(dataLayer.userEmailCustomGetter._model._primaryKeys)[0]] = 3;
        var model = yield dataLayer.userEmailCustomGetter.find({
          where: where
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
        var where = {};
        where[Object.keys(dataLayer.userEmailCustomSetter._model._primaryKeys)[0]] = 3;
        var model = yield dataLayer.userEmailCustomSetter.find({
          where: where
        });

        model.email = 'test@example.com';

        //should properly set the value
        expect(model.email).to.equal('setter-test@example.com');

        yield model.save();

        var where = {};
        where[Object.keys(dataLayer.userEmailCustomSetter._model._primaryKeys)[0]] = 3;
        var freshModel = yield dataLayer.userEmailCustomSetter.find({
          where: where
        });

        //should properly save to the database
        expect(freshModel.email).to.equal('setter-test@example.com');
      });

      it('should be able to reset when created with no data', function*() {
        var model = dataLayer.user.create();

        model.loadData({
          firstName: 'test',
          lastName: 'user',
          email: 'test.user@example.com',
          username: 'test.user',
          password: 'password',
          updatedTimestamp: null,
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: true,
          status: 'active'
        });

        model.reset();

        testUserValues(model, {
          id: null,
          firstName: null,
          lastName: null,
          email: null,
          username: null,
          password: null,
          createdTimestamp: null,
          updatedTimestamp: null,
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: false,
          status: 'registered'
        });
        expect(model._status).to.equal('new');
      });

      it('should be able to reset when created from data store', function*() {
        var model = yield dataLayer.user.find({
          where: {
            firstName: 'John'
          }
        });

        model.firstName = 'test';
        model.lastName = 'user';
        model.requirePasswordChangeFlag = true;

        model.reset();

        testUserValues(model, {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          username: 'john.doe',
          password: 'password',
          createdTimestamp: '2014-05-17T19:50:15.000Z',
          updatedTimestamp: null,
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: true,
          status: 'registered'
        });
        expect(model._status).to.equal('loaded');
      });
    });

    describe('relationships', function() {
      it('should be able to define a hasOne relationship', function*() {
        var where = {};
        where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 1;
        var model = yield dataLayer.user.find({
          where: where
        });

        var relationalModel = yield model.getUserDetail();

        expect(relationalModel.id).to.equal(1);
        expect(relationalModel.userId).to.equal(1);
        expect(relationalModel.details).to.equal('one');
      });

      it('should be able to define belongsTo relationships', function*() {
        var where = {};
        where[Object.keys(dataLayer.userDetail._model._primaryKeys)[0]] = 1;
        var model = yield dataLayer.userDetail.find({
          where: where
        });

        var relationalModel = yield model.getUser();

        testUserValues(relationalModel, {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          username: 'john.doe',
          password: 'password',
          createdTimestamp: '2014-05-17T19:50:15.000Z',
          updatedTimestamp: null,
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: true,
          status: 'registered'
        });
      });

      it('should be able to define hasMany relationships', function*() {
        var where = {};
        where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 1;
        var model = yield dataLayer.user.find({
          where: where
        });

        var relationalModels = yield model.getTestUserEmails();

        expect(relationalModels[0].id).to.equal(1);
        expect(relationalModels[0].userId).to.equal(1);
        expect(relationalModels[0].email).to.equal('one@example.com');

        expect(relationalModels[1].id).to.equal(5);
        expect(relationalModels[1].userId).to.equal(1);
        expect(relationalModels[1].email).to.equal('five@example.com');
      });

      it('should be able to define hasMany relationships with through model', function*() {
        var where = {};
        where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 3;
        var model = yield dataLayer.user.find({
          where: where
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
        var where = {};
        where[Object.keys(dataLayer.user2._model._primaryKeys)[0]] = 3;
        var model = yield dataLayer.user2.find({
          where: where
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

      it('should return null is a belongsTo does not link anyone (basically a "can belong to" type relationship)', function*() {
        var where = {};
        where[Object.keys(dataLayer.userDetail._model._primaryKeys)[0]] = 5;
        var model = yield dataLayer.userDetail.find({
          where: where
        });

        var relationalModel = yield model.getUser();

        expect(relationalModel).to.be.null;
      });

      it('should be able to convert to JSON with all relationship data', function*() {
        var where = {};
        where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 1;
        var model = yield dataLayer.user.find({
          where: where
        });
        expect(yield model.toJSONWithRelationships()).to.deep.equal({
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          username: 'john.doe',
          createdTimestamp: "2014-05-17T19:50:15.000Z",
          updatedTimestamp: null,
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: true,
          status: 'registered',
          userDetail: {
            id: 1,
            userId: 1,
            details: 'one'
          },
          userDetailTest1: {
            id: 1,
            details: 'one'
          },
          testUserEmailsTest1: [{
            id: 1,
            email: 'one@example.com'
          }, {
            id: 5,
            email: 'five@example.com'
          }],
          testUserEmails: [
            'one@example.com',
            'five@example.com'
          ],
          permissions: [
            'user.create'
          ]
        });
      });

      it('should be able to convert to JSON with specific relationship data', function*() {
        var where = {};
        where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 1;
        var model = yield dataLayer.user.find({
          where: where
        });
        expect(yield model.toJSONWithRelationships([
          'UserDetail',
          'TestUserEmailsTest1',
          'TestUserEmails'
        ])).to.deep.equal({
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          username: 'john.doe',
          createdTimestamp: "2014-05-17T19:50:15.000Z",
          updatedTimestamp: null,
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: true,
          status: 'registered',
          userDetail: {
            id: 1,
            userId: 1,
            details: 'one'
          },
          testUserEmailsTest1: [{
            id: 1,
            email: 'one@example.com'
          }, {
            id: 5,
            email: 'five@example.com'
          }],
          testUserEmails: [
            'one@example.com',
            'five@example.com'
          ]
        });
      });

      it('should be able to convert to JSON with 1 specific relationship data', function*() {
        var where = {};
        where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 1;
        var model = yield dataLayer.user.find({
          where: where
        });
        expect(yield model.toJSONWithRelationships([
          'UserDetail'
        ])).to.deep.equal({
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          username: 'john.doe',
          createdTimestamp: "2014-05-17T19:50:15.000Z",
          updatedTimestamp: null,
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: true,
          status: 'registered',
          userDetail: {
            id: 1,
            userId: 1,
            details: 'one'
          }
        });
      });

      it('should be able to convert to JSON with 1 specific relationship passed as string', function*() {
        var where = {};
        where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 1;
        var model = yield dataLayer.user.find({
          where: where
        });
        expect(yield model.toJSONWithRelationships('UserDetail')).to.deep.equal({
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          username: 'john.doe',
          createdTimestamp: "2014-05-17T19:50:15.000Z",
          updatedTimestamp: null,
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: true,
          status: 'registered',
          userDetail: {
            id: 1,
            userId: 1,
            details: 'one'
          }
        });
      });

      it('should be able to convert to JSON with specific relationship data passed as multiple strings', function*() {
        var where = {};
        where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 1;
        var model = yield dataLayer.user.find({
          where: where
        });
        expect(yield model.toJSONWithRelationships('UserDetail', 'TestUserEmailsTest1', 'TestUserEmails')).to.deep.equal({
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          username: 'john.doe',
          createdTimestamp: "2014-05-17T19:50:15.000Z",
          updatedTimestamp: null,
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: true,
          status: 'registered',
          userDetail: {
            id: 1,
            userId: 1,
            details: 'one'
          },
          testUserEmailsTest1: [{
            id: 1,
            email: 'one@example.com'
          }, {
            id: 5,
            email: 'five@example.com'
          }],
          testUserEmails: [
            'one@example.com',
            'five@example.com'
          ]
        });
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
          updatedTimestamp: null,
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: false,
          status: 'registered'
        });

        expect(model.toJSON()).to.deep.equal({
          id: null,
          firstName: 'test',
          lastName: 'user',
          email: 'test.user@example.com',
          username: 'test.user',
          createdTimestamp: null,
          updatedTimestamp: null,
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: false,
          status: 'registered'
        });
      });

      it('should be able to get primary key data', function*() {
        var where = {};
        where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 3;
        var model = yield dataLayer.user.find({
          where: where
        });

        expect(model._getPrimaryKeyData()).to.deep.equal({
          id: 3
        });
      });

      it('should be able to get all data store values', function*() {
        var model = dataLayer.user.create({
          firstName: 'test',
          lastName: 'user',
          email: 'test.user@example.com',
          username: 'test.user',
          password: 'password',
          updatedTimestamp: '13:24:35 12/23/10',
          lastPasswordChangeDate: '13:24:35 1/12/11',
          requirePasswordChangeFlag: false,
          status: 'registered'
        });

        expect(model._getDataStoreValues(dataAdapter._dataConverters)).to.deep.equal({
          id: null,
          firstName: 'test',
          lastName: 'user',
          email: 'test.user@example.com',
          username: 'test.user',
          password: 'password',
          createdTimestamp: null,
          updatedTimestamp: '2010-12-23 13:24:35',
          lastPasswordChangeDate: '2011-01-12',
          requirePasswordChangeFlag: 0,
          status: 'registered'
        });
      });

      it('should be able to get insert sql values', function*() {
        var model = dataLayer.user.create({
          firstName: 'test',
          lastName: 'user',
          email: 'test.user@example.com',
          username: 'test.user',
          password: 'password',
          updatedTimestamp: '13:24:35 12/23/10',
          lastPasswordChangeDate: '13:24:35 1/12/11',
          requirePasswordChangeFlag: false,
          status: 'registered'
        });

        expect(model._getInsertDataStoreValues(dataAdapter._dataConverters)).to.deep.equal({
          firstName: 'test',
          lastName: 'user',
          email: 'test.user@example.com',
          username: 'test.user',
          password: 'password',
          lastPasswordChangeDate: '2011-01-12',
          requirePasswordChangeFlag: 0,
          status: 'registered'
        });
      });

      it('should be able to get update sql values', function*() {
        var model = dataLayer.user.create({
          firstName: 'test',
          lastName: 'user',
          email: 'test.user@example.com',
          username: 'test.user',
          password: 'password',
          updatedTimestamp: '13:24:35 12/23/10',
          lastPasswordChangeDate: '13:24:35 1/12/11',
          requirePasswordChangeFlag: false,
          status: 'registered'
        });

        expect(model._getUpdateDataStoreValues(dataAdapter._dataConverters)).to.deep.equal({
          firstName: 'test',
          email: 'test.user@example.com',
          username: 'test.user',
          password: 'password',
          updatedTimestamp: '2010-12-23 13:24:35',
          lastPasswordChangeDate: '2011-01-12',
          requirePasswordChangeFlag: 0,
          status: 'registered'
        });
      });
    });

    describe('hooks', function() {
      describe('types', function() {
        describe('beforeSave (on insert)', function() {
          it('single', function*() {
            var model = dataLayer.user.create({
              firstName: 'test',
              lastName: 'user',
              email: 'test.user@example.com',
              username: 'test.user',
              password: 'password'
            });

            model.hook('beforeSave[test]', function(model, saveType) {
              expect(saveType).to.equal('insert');
              model.firstName = 'before-' + model.firstName;
            });
            yield model.save();

            testUserValues(model, {
              firstName: 'before-test',
              lastName: 'user',
              email: 'test.user@example.com',
              username: 'test.user',
              password: 'password',
              updatedTimestamp: null,
              lastPasswordChangeDate: null,
              requirePasswordChangeFlag: false,
              status: 'registered'
            });

            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = model.id;
            var modelFromDatabase = yield dataLayer.user.find({
              where: where
            });

            testUserValues(modelFromDatabase, {
              firstName: 'before-test',
              lastName: 'user',
              email: 'test.user@example.com',
              username: 'test.user',
              password: 'password',
              updatedTimestamp: null,
              lastPasswordChangeDate: null,
              requirePasswordChangeFlag: false,
              status: 'registered'
            });

            expect(modelFromDatabase.id).to.be.at.least(5);
            expect(modelFromDatabase.createdTimestamp).to.not.be.undefined;
          });

          it('should not allow other hooks to be called if the abort callback is executed', function*() {
            var model = dataLayer.user.create({
              firstName: 'test',
              lastName: 'user',
              email: 'test.user@example.com',
              username: 'test.user',
              password: 'password'
            });

            model.hook('beforeSave[test]', function(model, saveType, abort) {
              expect(saveType).to.equal('insert');
              abort();
            });

            //this should never be called since the first hook calls the abort callback
            model.hook('beforeSave[test2]', function(model, saveType, abort) {
              expect(false).to.be.true;
            });

            expect(yield model.save()).to.be.false;
          });

          it('should abort action if hook executes the abort callback', function*() {
            var model = dataLayer.user.create({
              firstName: 'test',
              lastName: 'user',
              email: 'test.user@example.com',
              username: 'test.user',
              password: 'password'
            });

            model.hook('beforeSave[test]', function(model, saveType, abort) {
              expect(saveType).to.equal('insert');
              model.firstName = 'before-' + model.firstName;
              abort();
            });
            expect(yield model.save()).to.be.false;

            testUserValues(model, {
              firstName: 'before-test',
              lastName: 'user',
              email: 'test.user@example.com',
              username: 'test.user',
              password: 'password',
              updatedTimestamp: null,
              lastPasswordChangeDate: null,
              requirePasswordChangeFlag: false,
              status: 'registered'
            });
            expect(model.id).to.null;
          });

          it('should allow hook to pass back a custom value if hook executes the abort callback', function*() {
            var model = dataLayer.user.create({
              firstName: 'test',
              lastName: 'user',
              email: 'test.user@example.com',
              username: 'test.user',
              password: 'password'
            });

            model.hook('beforeSave[test]', function(model, saveType, abort) {
              expect(saveType).to.equal('insert');
              model.firstName = 'before-' + model.firstName;
              abort('test');
            });
            expect(yield model.save()).to.equal('test')
          });
        });

        describe('afterSave (on insert)', function() {
          it('single', function*() {
            var model = dataLayer.user.create({
              firstName: 'test',
              lastName: 'user',
              email: 'test.user@example.com',
              username: 'test.user',
              password: 'password'
            });

            model.hook('afterSave[test]', function(model, saveType) {
              expect(saveType).to.equal('insert');
              model.firstName = 'after-' + model.firstName;
            });
            yield model.save();

            testUserValues(model, {
              firstName: 'after-test',
              lastName: 'user',
              email: 'test.user@example.com',
              username: 'test.user',
              password: 'password',
              updatedTimestamp: null,
              lastPasswordChangeDate: null,
              requirePasswordChangeFlag: false,
              status: 'registered'
            });

            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = model.id;
            var modelFromDatabase = yield dataLayer.user.find({
              where: where
            });

            testUserValues(modelFromDatabase, {
              firstName: 'test',
              lastName: 'user',
              email: 'test.user@example.com',
              username: 'test.user',
              password: 'password',
              updatedTimestamp: null,
              lastPasswordChangeDate: null,
              requirePasswordChangeFlag: false,
              status: 'registered'
            });

            expect(modelFromDatabase.id).to.be.at.least(5);
            expect(modelFromDatabase.createdTimestamp).to.not.be.undefined;
          });
        });

        describe('beforeSave (on update)', function() {
          it('single', function*() {
            var start = moment().format('X');

            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 3;
            var model = yield dataLayer.user.find({
              where: where
            });

            model.requirePasswordChangeFlag = true;
            model.hook('beforeSave[test]', function(model, saveType) {
              expect(saveType).to.equal('update');
              model.firstName = 'before-' + model.firstName;
            });
            yield model.save();

            testUserValues(model, {
              id: 3,
              firstName: 'before-John',
              lastName: 'Doe2',
              email: 'john.doe2@example.com',
              username: 'john.doe2',
              password: 'password',
              createdTimestamp: '2014-05-17T19:51:49.000Z',
              updatedTimestamp: null,
              lastPasswordChangeDate: null,
              requirePasswordChangeFlag: true,
              status: 'active'
            });

            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = model.id;
            var modelFromDatabase = yield dataLayer.user.find({
              where: where
            });

            testUserValues(modelFromDatabase, {
              id: 3,
              firstName: 'before-John',
              lastName: 'Doe2',
              email: 'john.doe2@example.com',
              username: 'john.doe2',
              password: 'password',
              createdTimestamp: '2014-05-17T19:51:49.000Z',
              lastPasswordChangeDate: null,
              requirePasswordChangeFlag: true,
              status: 'active'
            });

            expect(moment(modelFromDatabase.updatedTimestamp).format('X') >= start).to.be.true;
          });

          it('should not allow other hooks to be called if the abort callback is executed', function*() {
            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 3;
            var model = yield dataLayer.user.find({
              where: where
            });
            model.firstName = 'test';

            model.hook('beforeSave[test]', function(model, saveType, abort) {
              expect(saveType).to.equal('update');
              abort();
            });

            //this should never be called since the first hook calls the abort callback
            model.hook('beforeSave[test2]', function(model, saveType, abort) {
              expect(false).to.be.true;
            });

            expect(yield model.save()).to.be.false;
          });

          it('should abort action if hook executes the abort callback', function*() {
            var start = moment().format('X');

            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 3;
            var model = yield dataLayer.user.find({
              where: where
            });

            model.requirePasswordChangeFlag = true;
            model.hook('beforeSave[test]', function(model, saveType, abort) {
              expect(saveType).to.equal('update');
              model.firstName = 'before-' + model.firstName;
              abort();
            });
            expect(yield model.save()).to.be.false;

            testUserValues(model, {
              id: 3,
              firstName: 'before-John',
              lastName: 'Doe2',
              email: 'john.doe2@example.com',
              username: 'john.doe2',
              password: 'password',
              createdTimestamp: '2014-05-17T19:51:49.000Z',
              updatedTimestamp: null,
              lastPasswordChangeDate: null,
              requirePasswordChangeFlag: true,
              status: 'active'
            });

            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = model.id;
            var modelFromDatabase = yield dataLayer.user.find({
              where: where
            });

            testUserValues(modelFromDatabase, {
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

          it('should allow hook to pass back a custom value if action is aborted', function*() {
            var start = moment().format('X');

            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 3;
            var model = yield dataLayer.user.find({
              where: where
            });

            model.requirePasswordChangeFlag = true;
            model.hook('beforeSave[test]', function(model, saveType, abort) {
              expect(saveType).to.equal('update');
              model.firstName = 'before-' + model.firstName;
              abort('test');
            });
            expect(yield model.save()).to.equal('test');
          });
        });

        describe('afterSave (on update)', function() {
          it('single', function*() {
            var start = moment().format('X');

            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 3;
            var model = yield dataLayer.user.find({
              where: where
            });

            model.requirePasswordChangeFlag = true;
            model.hook('afterSave[test]', function(model, saveType) {
              expect(saveType).to.equal('update');
              model.firstName = 'after-' + model.firstName;
            });
            yield model.save();

            testUserValues(model, {
              id: 3,
              firstName: 'after-John',
              lastName: 'Doe2',
              email: 'john.doe2@example.com',
              username: 'john.doe2',
              password: 'password',
              createdTimestamp: '2014-05-17T19:51:49.000Z',
              updatedTimestamp: null,
              lastPasswordChangeDate: null,
              requirePasswordChangeFlag: true,
              status: 'active'
            });

            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = model.id;
            var modelFromDatabase = yield dataLayer.user.find({
              where: where
            });

            testUserValues(modelFromDatabase, {
              id: 3,
              firstName: 'John',
              lastName: 'Doe2',
              email: 'john.doe2@example.com',
              username: 'john.doe2',
              password: 'password',
              createdTimestamp: '2014-05-17T19:51:49.000Z',
              lastPasswordChangeDate: null,
              requirePasswordChangeFlag: true,
              status: 'active'
            });

            expect(moment(modelFromDatabase.updatedTimestamp).format('X') >= start).to.be.true;
          });
        });

        describe('beforeRemove', function() {
          it('single', function*() {
            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 3;
            var model = yield dataLayer.user.find({
              where: where
            });

            model.hook('beforeRemove[test]', function(model) {
              expect(model.id).to.equal(3);
            });
            expect(yield model.remove()).to.be.true;

            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 3;
            var model = yield dataLayer.user.find({
              where: where
            });

            expect(model).to.be.null;
          });

          it('should not allow other hooks to be called if the abort callback is executed', function*() {
            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 3;
            var model = yield dataLayer.user.find({
              where: where
            });

            model.hook('beforeRemove[test]', function(model, abort) {
              expect(model.id).to.equal(3);
              abort();
            });

            model.hook('beforeRemove[test2]', function(model, abort) {
              expect(false).to.be.true;
            });

            expect(yield model.remove()).to.be.false;
          });

          it('should abort action if hook executes the abort callback', function*() {
            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 3;
            var model = yield dataLayer.user.find({
              where: where
            });

            model.hook('beforeRemove[test]', function(model, abort) {
              expect(model.id).to.equal(3);
              abort();
            });

            expect(yield model.remove()).to.be.false;

            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 3;
            var model = yield dataLayer.user.find({
              where: where
            });

            expect(model.id).to.equal(3);
          });

          it('should allow hook to pass back a custom value if action is aborted', function*() {
            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 3;
            var model = yield dataLayer.user.find({
              where: where
            });

            model.hook('beforeRemove[test]', function(model, abort) {
              expect(model.id).to.equal(3);
              abort('before remove abort');
            });

            expect(yield model.remove()).to.equal('before remove abort');
          });
        });

        describe('afterRemove', function() {
          it('single', function*() {
            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 3;
            var model = yield dataLayer.user.find({
              where: where
            });

            model.hook('afterRemove[test]', function(model) {
              expect(model.id).to.equal(3);
            });
            expect(yield model.remove()).to.be.true;

            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 3;
            var model = yield dataLayer.user.find({
              where: where
            });

            expect(model).to.be.null;
          });
        });

        describe('beforeGetRelationship (belongsTo)', function() {
          it('single', function*() {
            var where = {};
            where[Object.keys(dataLayer.userDetail._model._primaryKeys)[0]] = 1;
            var model = yield dataLayer.userDetail.find({
              where: where
            });
            model.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName) {
              expect(relationshipType).to.equal('belongsTo');
              expect(relationshipModelName).to.equal('User');
            });

            expect((yield model.getUser()).id).to.equal(1);
          });

          it('should not allow other hooks to be called if the abort callback is executed', function*() {
            var where = {};
            where[Object.keys(dataLayer.userDetail._model._primaryKeys)[0]] = 1;
            var model = yield dataLayer.userDetail.find({
              where: where
            });

            model.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
              expect(relationshipType).to.equal('belongsTo');
              expect(relationshipModelName).to.equal('User');
              abort();
            });

            model.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
              expect(false).to.be.true;
            });

            expect(yield model.getUser()).to.be.false;
          });

          it('should abort action if hook executes the abort callback', function*() {
            var where = {};
            where[Object.keys(dataLayer.userDetail._model._primaryKeys)[0]] = 1;
            var model = yield dataLayer.userDetail.find({
              where: where
            });

            model.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
              expect(relationshipType).to.equal('belongsTo');
              expect(relationshipModelName).to.equal('User');
              abort();
            });

            expect(yield model.getUser()).to.be.false;
          });

          it('should allow hook to pass back a custom value if action is aborted', function*() {
            var where = {};
            where[Object.keys(dataLayer.userDetail._model._primaryKeys)[0]] = 1;
            var model = yield dataLayer.userDetail.find({
              where: where
            });

            model.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
              expect(relationshipType).to.equal('belongsTo');
              expect(relationshipModelName).to.equal('User');
              abort('before get relationship abort');
            });

            expect(yield model.getUser()).to.equal('before get relationship abort');
          });
        });

        describe('afterGetRelationship (belongsTo)', function() {
          it('single', function*() {
            var where = {};
            where[Object.keys(dataLayer.userDetail._model._primaryKeys)[0]] = 1;
            var model = yield dataLayer.userDetail.find({
              where: where
            });
            model.hook('afterGetRelationship[test]', function(model, relationshipType, relationshipModelName, relationalModel) {
              expect(relationshipType).to.equal('belongsTo');
              expect(relationshipModelName).to.equal('User');
              relationalModel.firstName = 'hook';
            });

            var relationalModel = yield model.getUser();

            expect(relationalModel.firstName).to.equal('hook');
          });
        });

        describe('beforeGetRelationship (hasOne)', function() {
          it('single', function*() {
            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 1;
            var model = yield dataLayer.user.find({
              where: where
            });

            model.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
              expect(relationshipType).to.equal('hasOne');
              expect(relationshipModelName).to.equal('UserDetail');
            });

            expect((yield model.getUserDetail()).id).to.equal(1);
          });

          it('should not allow other hooks to be called if the abort callback is executed', function*() {
            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 1;
            var model = yield dataLayer.user.find({
              where: where
            });

            model.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
              expect(relationshipType).to.equal('hasOne');
              expect(relationshipModelName).to.equal('UserDetail');
              abort();
            });

            model.hook('beforeGetRelationship[test2]', function(model, relationshipType, relationshipModelName, abort) {
              expect(false).to.be.true;
            });

            expect(yield model.getUserDetail()).to.false;
          });

          it('should abort action if hook executes the abort callback', function*() {
            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 1;
            var model = yield dataLayer.user.find({
              where: where
            });

            model.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
              expect(relationshipType).to.equal('hasOne');
              expect(relationshipModelName).to.equal('UserDetail');
              abort();
            });

            expect(yield model.getUserDetail()).to.be.false;
          });

          it('should allow hook to pass back a custom value if action is aborted', function*() {
            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 1;
            var model = yield dataLayer.user.find({
              where: where
            });

            model.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
              expect(relationshipType).to.equal('hasOne');
              expect(relationshipModelName).to.equal('UserDetail');
              abort('before get relationship abort');
            });

            expect(yield model.getUserDetail()).to.equal('before get relationship abort');
          });
        });

        describe('afterGetRelationship (hasOne)', function() {
          it('single', function*() {
            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 1;
            var model = yield dataLayer.user.find({
              where: where
            });

            model.hook('afterGetRelationship[test]', function(model, relationshipType, relationshipModelName, relationalModel) {
              expect(relationshipType).to.equal('hasOne');
              expect(relationshipModelName).to.equal('UserDetail');
              relationalModel.details = 'hook';
            });

            var relationalModel = yield model.getUserDetail();

            expect(relationalModel.details).to.equal('hook');
          });
        });

        describe('beforeGetRelationship (hasMany)', function() {
          it('single', function*() {
            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 1;
            var model = yield dataLayer.user.find({
              where: where
            });

            model.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
              expect(relationshipType).to.equal('hasMany');
              expect(relationshipModelName).to.equal('UserEmail');
            });

            expect((yield model.getTestUserEmails()).length).to.equal(2);
          });

          it('should not allow other hooks to be called if the abort callback is executed', function*() {
            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 1;
            var model = yield dataLayer.user.find({
              where: where
            });

            model.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
              expect(relationshipType).to.equal('hasMany');
              expect(relationshipModelName).to.equal('UserEmail');
              abort();
            });

            model.hook('beforeGetRelationship[test2]', function(model, relationshipType, relationshipModelName, abort) {
              expect(false).to.be.true;
            });

            expect(yield model.getTestUserEmails()).to.be.false;
          });

          it('should abort action if hook executes the abort callback', function*() {
            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 1;
            var model = yield dataLayer.user.find({
              where: where
            });

            model.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
              expect(relationshipType).to.equal('hasMany');
              expect(relationshipModelName).to.equal('UserEmail');
              abort();
            });

            expect(yield model.getTestUserEmails()).to.be.false;
          });

          it('should allow hook to pass back a custom value if action is aborted', function*() {
            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 1;
            var model = yield dataLayer.user.find({
              where: where
            });

            model.hook('beforeGetRelationship[test]', function(model, relationshipType, relationshipModelName, abort) {
              expect(relationshipType).to.equal('hasMany');
              expect(relationshipModelName).to.equal('UserEmail');
              abort('before get relationship abort');
            });

            expect(yield model.getTestUserEmails()).to.equal('before get relationship abort');
          });
        });

        describe('afterGetRelationship (hasMany)', function() {
          it('single', function*() {
            var where = {};
            where[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 1;
            var model = yield dataLayer.user.find({
              where: where
            });

            model.hook('afterGetRelationship[test]', function(model, relationshipType, relationshipModelName, relationalModels) {
              expect(relationshipType).to.equal('hasMany');
              expect(relationshipModelName).to.equal('UserEmail');
              relationalModels[0].email = 'hook';
            });

            var relationalModels = yield model.getTestUserEmails();

            expect(relationalModels[0].email).to.equal('hook');
          });
        });
      });

      it('should be attachable to the base model object and available in the model instances', function*() {
        var model = dataLayer.permissionHook.create({
          title: 'user.admin'
        });
        yield model.save();

        expect(model.id).to.be.at.least(5);
        expect(model.title).to.equal('before-user.admin');

        var where = {};
        where[Object.keys(dataLayer.permissionHook._model._primaryKeys)[0]] = model.id;
        var modelFromDatabase = yield dataLayer.permissionHook.find({
          where: where
        });

        expect(modelFromDatabase.id).to.be.at.least(5);
        expect(modelFromDatabase.title).to.equal('before-user.admin');
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

      it('each model should have it own _status', function*() {
        var model1 = dataLayer.user.create();
        var model2 = dataLayer.user.create();

        model2._status = 'loaded';

        expect(model1._status).to.equal('new');
        expect(model2._status).to.equal('loaded');
      });
    });
  });
}
