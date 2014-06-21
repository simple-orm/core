var expect = require('chai').expect;

module.exports = function(userIdField, userEmailUserIdField) {
  describe('create', function() {
    it('should be able create a new instance', function*() {
      var model = this.dataLayer.user.create({
        firstName: 'test',
        lastName: 'user',
        email: 'test.user@example.com',
        username: 'test.user',
        password: 'password'
      });

      this.testUserValues(model, {
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
      var model = yield this.dataLayer.user.find({
        where: {
          firstName: 'John'
        }
      });

      this.testUserValues(model, {
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
      var models = yield this.dataLayer.user.findAll({
        where: {
          firstName: 'John'
        }
      });

      expect(models.length).to.equal(2);
      this.testUserValues(models.getByIndex(0), {
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

      this.testUserValues(models.getByIndex(1), {
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
        var models = yield this.dataLayer.user.findAll({
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
        var models = yield this.dataLayer.user.findAll({
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
        var models = yield this.dataLayer.user.findAll({
          where: {
            id: {
              comparison: 'IS NULL'
            }
          }
        });

        expect(models.length).to.equal(0);
      });

      it('should support between valued', function*() {
        var models = yield this.dataLayer.user.findAll({
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
        repository: this.dataLayer.userEmail,
        on: {}
      }];
      join[0].on[this.dataLayer.user._model._table + '.' + userIdField] = {
        value: this.dataLayer.userEmail._model._table + '.' + userEmailUserIdField,
        valueType: 'field'
      };
      join[0].on[this.dataLayer.userEmail._model._table + '.email'] = {
        comparison: '!=',
        value: "one@example.'com"
      };
      var models = yield this.dataLayer.user.findAll({
        join: join
      });

      expect(models.length).to.equal(4);
    });
  });

  describe('utilities', function() {
    it('should be able to attach a plugin globally', function*() {
      expect(this.dataLayer.user.gp()).to.equal('this is a global repository plugin');
    });
  });

  describe('hooks', function() {
    beforeEach(function() {
      this.dataLayer.user.removeHook('beforeFind[test]');
      this.dataLayer.user.removeHook('beforeFind[test2]');
      this.dataLayer.user.removeHook('afterFind[test]');
      this.dataLayer.user.removeHook('beforeFindAll[test]');
      this.dataLayer.user.removeHook('beforeFindAll[test2]');
      this.dataLayer.user.removeHook('afterFindAll[test]');
    });

    describe('types', function() {
      describe('beforeFind', function() {
        it('single', function*() {
          this.dataLayer.user.hook('beforeFind[test]', function(repository, data) {
            data.criteria.where.firstName += 'n';
          });
          var model = yield this.dataLayer.user.find({
            where: {
              firstName: 'Joh'
            }
          });
          this.dataLayer.user.removeHook('beforeFind[test]');

          this.testUserValues(model, {
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
          this.dataLayer.user.hook('beforeFind[test]', function(repository, data, abort) {
            data.criteria.where.firstName += 'n';
            abort();
          });

          this.dataLayer.user.hook('beforeFind[test2]', function(repository, data, abort) {
            expect(false).to.be.true;
          });

          var model = yield this.dataLayer.user.find({
            where: {
              firstName: 'Joh'
            }
          });
          this.dataLayer.user.removeHook('beforeFind[test]');
          this.dataLayer.user.removeHook('beforeFind[test2]');

          expect(model).to.be.false;
        });

        it('should abort action if hook calls the abort callback', function*() {
          this.dataLayer.user.hook('beforeFind[test]', function(repository, data, abort) {
            data.criteria.where.firstName += 'n';
            abort();
          });
          var model = yield this.dataLayer.user.find({
            where: {
              firstName: 'Joh'
            }
          });
          this.dataLayer.user.removeHook('beforeFind[test]');

          expect(model).to.be.false;
        });

        it('should allow hook to pass back a custom value if action is aborted', function*() {
          this.dataLayer.user.hook('beforeFind[test]', function(repository, data, abort) {
            data.criteria.where.firstName += 'n';
            abort('test');
          });
          var model = yield this.dataLayer.user.find({
            where: {
              firstName: 'Joh'
            }
          });
          this.dataLayer.user.removeHook('beforeFind[test]');

          expect(model).to.equal('test');
        });
      });

      describe('afterFind', function() {
        it('single', function*() {
          this.dataLayer.user.hook('afterFind[test]', function(repository, model) {
            model.firstName = 'John-after';
          });
          var model = yield this.dataLayer.user.find({
            where: {
              firstName: 'John'
            }
          });
          this.dataLayer.user.removeHook('afterFind[test]');

          this.testUserValues(model, {
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
          this.dataLayer.user.hook('beforeFindAll[test]', function(repository, data) {
            data.criteria.where.firstName += 'n';
          });
          var models = yield this.dataLayer.user.findAll({
            where: {
              firstName: 'Joh'
            }
          });
          this.dataLayer.user.removeHook('beforeFindAll[test]');

          this.testUserValues(models.getByIndex(0), {
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

          this.testUserValues(models.getByIndex(1), {
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
          this.dataLayer.user.hook('beforeFindAll[test]', function(repository, data, abort) {
            data.criteria.where.firstName += 'n';
            abort();
          });

          this.dataLayer.user.hook('beforeFindAll[test2]', function(repository, data, abort) {
            expect(false).to.be.true;
          });

          var models = yield this.dataLayer.user.findAll({
            where: {
              firstName: 'Joh'
            }
          });

          this.dataLayer.user.removeHook('beforeFindAll[test]');
          this.dataLayer.user.removeHook('beforeFindAll[test2]');

          expect(models).to.be.false;
        });

        it('should abort action if hook calls the abort callback', function*() {
          this.dataLayer.user.hook('beforeFindAll[test]', function(repository, data, abort) {
            data.criteria.where.firstName += 'n';
            abort();
          });
          var models = yield this.dataLayer.user.findAll({
            where: {
              firstName: 'Joh'
            }
          });
          this.dataLayer.user.removeHook('beforeFindAll[test]');

          expect(models).to.be.false;
        });

        it('should allow hook to pass back a custom value if action is aborted', function*() {
          this.dataLayer.user.hook('beforeFindAll[test]', function(repository, data, abort) {
            data.criteria.where.firstName += 'n';
            abort('test');
          });
          var models = yield this.dataLayer.user.findAll({
            where: {
              firstName: 'Joh'
            }
          });
          this.dataLayer.user.removeHook('beforeFindAll[test]');

          expect(models).to.equal('test');
        });
      });

      describe('afterFindAll', function() {
        it('single', function*() {
          this.dataLayer.user.hook('afterFindAll[test]', function(repository, models) {
            models.remove(3);
          });
          var models = yield this.dataLayer.user.findAll({
            where: {
              firstName: 'John'
            }
          });
          this.dataLayer.user.removeHook('afterFindAll[test]');

          expect(models.length).to.equal(1);
          this.testUserValues(models.getByIndex(0), {
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
}
