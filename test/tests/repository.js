var simpleOrm = require('../../orm/index');
var expect = require('chai').expect;
var testUserValues = require('../test-user-values');

module.exports = function(dataLayer, dataAdapter, userIdField, userEmailUserIdField) {
  describe('repository', function() {
    beforeEach(function*(){
      //dataAdapter.enableDebug();
      yield dataAdapter.startTransaction();
    });

    afterEach(function*(){
      dataAdapter.disableDebug();
      yield dataAdapter.rollbackTransaction();
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
          id: undefined,
          firstName: 'test',
          lastName: 'user',
          email: 'test.user@example.com',
          username: 'test.user',
          password: 'password',
          createdTimestamp: undefined,
          updatedTimestamp: null,
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: false,
          status: 'registered'
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

      it('should be able find a multiple models', function*() {
        var models = yield dataLayer.user.findAll({
          where: {
            firstName: 'John'
          }
        });

        expect(models.length).to.equal(2);
        testUserValues(models[0], {
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

        testUserValues(models[1], {
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

          expect(models).to.be.null;
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
        var join = [{
          repository: dataLayer.userEmail,
          on: {}
        }];
        join[0].on[dataLayer.user._model._table + '.' + userIdField] = {
          value: dataLayer.userEmail._model._table + '.' + userEmailUserIdField,
          valueType: 'field'
        };
        join[0].on[dataLayer.userEmail._model._table + '.email'] = {
          comparison: '!=',
          value: "one@example.'com"
        };
        var models = yield dataLayer.user.findAll({
          join: join
        });

        expect(models.length).to.equal(4);
      });
    });

    describe('hooks', function() {
      beforeEach(function() {
        dataLayer.user.removeHook('beforeFind[test]');
        dataLayer.user.removeHook('beforeFind[test2]');
        dataLayer.user.removeHook('afterFind[test]');
        dataLayer.user.removeHook('beforeFindAll[test]');
        dataLayer.user.removeHook('beforeFindAll[test2]');
        dataLayer.user.removeHook('afterFindAll[test]');
      });

      describe('types', function() {
        describe('beforeFind', function() {
          it('single', function*() {
            dataLayer.user.hook('beforeFind[test]', function(repository, data) {
              data.criteria.where.firstName += 'n';
            });
            var model = yield dataLayer.user.find({
              where: {
                firstName: 'Joh'
              }
            });
            dataLayer.user.removeHook('beforeFind[test]');

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
          });

          it('should not allow other hooks to be called if the abort callback is executed', function*() {
            dataLayer.user.hook('beforeFind[test]', function(repository, data, abort) {
              data.criteria.where.firstName += 'n';
              abort();
            });

            dataLayer.user.hook('beforeFind[test2]', function(repository, data, abort) {
              expect(false).to.be.true;
            });

            var model = yield dataLayer.user.find({
              where: {
                firstName: 'Joh'
              }
            });
            dataLayer.user.removeHook('beforeFind[test]');
            dataLayer.user.removeHook('beforeFind[test2]');

            expect(model).to.be.false;
          });

          it('should abort action if hook calls the abort callback', function*() {
            dataLayer.user.hook('beforeFind[test]', function(repository, data, abort) {
              data.criteria.where.firstName += 'n';
              abort();
            });
            var model = yield dataLayer.user.find({
              where: {
                firstName: 'Joh'
              }
            });
            dataLayer.user.removeHook('beforeFind[test]');

            expect(model).to.be.false;
          });

          it('should allow hook to pass back a custom value if action is aborted', function*() {
            dataLayer.user.hook('beforeFind[test]', function(repository, data, abort) {
              data.criteria.where.firstName += 'n';
              abort('test');
            });
            var model = yield dataLayer.user.find({
              where: {
                firstName: 'Joh'
              }
            });
            dataLayer.user.removeHook('beforeFind[test]');

            expect(model).to.equal('test');
          });
        });

        describe('afterFind', function() {
          it('single', function*() {
            dataLayer.user.hook('afterFind[test]', function(repository, model) {
              model.firstName = 'John-after';
            });
            var model = yield dataLayer.user.find({
              where: {
                firstName: 'John'
              }
            });
            dataLayer.user.removeHook('afterFind[test]');

            testUserValues(model, {
              id: 1,
              firstName: 'John-after',
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
        });

        describe('beforeFindAll', function() {
          it('single', function*() {
            dataLayer.user.hook('beforeFindAll[test]', function(repository, data) {
              data.criteria.where.firstName += 'n';
            });
            var models = yield dataLayer.user.findAll({
              where: {
                firstName: 'Joh'
              }
            });
            dataLayer.user.removeHook('beforeFindAll[test]');

            testUserValues(models[0], {
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

            testUserValues(models[1], {
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

          it('should not allow other hooks to be called if the abort callback is executed', function*() {
            dataLayer.user.hook('beforeFindAll[test]', function(repository, data, abort) {
              data.criteria.where.firstName += 'n';
              abort();
            });

            dataLayer.user.hook('beforeFindAll[test2]', function(repository, data, abort) {
              expect(false).to.be.true;
            });

            var models = yield dataLayer.user.findAll({
              where: {
                firstName: 'Joh'
              }
            });

            dataLayer.user.removeHook('beforeFindAll[test]');
            dataLayer.user.removeHook('beforeFindAll[test2]');

            expect(models).to.be.false;
          });

          it('should abort action if hook calls the abort callback', function*() {
            dataLayer.user.hook('beforeFindAll[test]', function(repository, data, abort) {
              data.criteria.where.firstName += 'n';
              abort();
            });
            var models = yield dataLayer.user.findAll({
              where: {
                firstName: 'Joh'
              }
            });
            dataLayer.user.removeHook('beforeFindAll[test]');

            expect(models).to.be.false;
          });

          it('should allow hook to pass back a custom value if action is aborted', function*() {
            dataLayer.user.hook('beforeFindAll[test]', function(repository, data, abort) {
              data.criteria.where.firstName += 'n';
              abort('test');
            });
            var models = yield dataLayer.user.findAll({
              where: {
                firstName: 'Joh'
              }
            });
            dataLayer.user.removeHook('beforeFindAll[test]');

            expect(models).to.equal('test');
          });
        });

        describe('afterFindAll', function() {
          it('single', function*() {
            dataLayer.user.hook('afterFindAll[test]', function(repository, models) {
              models.splice(1, 1);
            });
            var models = yield dataLayer.user.findAll({
              where: {
                firstName: 'John'
              }
            });
            dataLayer.user.removeHook('afterFindAll[test]');

            expect(models.length).to.equal(1);
            testUserValues(models[0], {
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
          simpleOrm.baseRepository({}, {});
        }).to.throw(err);
      });
    });
  });
}
