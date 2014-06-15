var simpleOrm = require('../../orm/index');
var expect = require('chai').expect;
var collection;
var model1;
var model2;

module.exports = function(dataLayer) {
  describe('collection', function() {
    beforeEach(function*() {
      //TODO: investigate: even though I don't need to do this on each test, I can't seem to you yield with describe() so have to do this here
      var where1 = {};
      where1[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 1;
      model1 = yield dataLayer.user.find({
        where: where1
      });

      var where2 = {};
      where2[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 2;
      model2 = yield dataLayer.user.find({
        where: where2
      });

      collection = simpleOrm.collection();
    });

    describe('creation', function() {
      it('should be able to create empty collection', function*() {
        var myCollection = simpleOrm.collection();

        expect(myCollection.length).to.equal(0);
      });

      it('should be able to create collection with 1 model', function*() {
        var myCollection = simpleOrm.collection(model1);

        expect(myCollection.length).to.equal(1);
      });

      it('should be able to create collection with multiple models', function*() {
        var myCollection = simpleOrm.collection([
          model1,
          model2
        ]);

        expect(myCollection.length).to.equal(2);
      });
    });

    describe('data management', function() {
      it('should be able to add a single model', function*() {
        collection.add(model1);

        expect(collection.length).to.equal(1);
      });

      it('should be able to add a multiple models', function*() {
        collection.add([
          model1,
          model2
        ]);

        expect(collection.length).to.equal(2);
      });

      it('should be able to remove a single model', function*() {
        collection.add([
          model1,
          model2
        ]);

        collection.remove(2);

        expect(collection.length).to.equal(1);
        expect(collection.getByIndex(0).id).to.equal(1);
      });

      it('should be able to remove a multiple models', function*() {
        collection.add([
          model1,
          model2
        ]);

        collection.remove([
          1,
          2
        ]);

        expect(collection.length).to.equal(0);
      });

      it('should be able to remove models by model instance', function*() {
        collection.add([
          model1,
          model2
        ]);

        collection.remove([model2]);

        expect(collection.length).to.equal(1);
        expect(collection.getByIndex(0).id).to.equal(1);
      });

      it('should be able to clear data', function*() {
        collection.add([
          model1,
          model2
        ]);

        collection.clear();

        expect(collection.length).to.equal(0);
      });

      it('should be able to get model by index', function*() {
        collection.add([
          model1,
          model2
        ]);

        expect(collection.getByIndex(0).id).to.equal(1);
      });

      it('should be able to get model by primary key', function*() {
        collection.add([
          model1,
          model2
        ]);

        expect(collection.get(1).id).to.equal(1);
      });

      it('should return undefined if trying to get model by index and collection is empty', function*() {
        expect(collection.get(1));
      });

      it('should return undefined if trying to get model by primary key and collection is empty', function*() {
        expect(collection.get(1));
      });
    });

    describe('hooks', function() {
      var expectedOptions = {
        find: {}
      };
      expectedOptions.find[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 1;

      describe('beforeGetByPrimaryKey', function() {
        it('single', function*() {
          collection.hook('beforeGetByPrimaryKey[test]', function(collection, options) {
            expect(options).to.deep.equal(expectedOptions);
            options.find[Object.keys(dataLayer.user._model._primaryKeys)[0]] = 2;
          });

          collection.add([
            model1,
            model2
          ]);

          expect(collection.get(1).id).to.equal(2);
        });
      });

      describe('afterGetByPrimaryKey', function() {
        it('single', function*() {
          collection.hook('afterGetByPrimaryKey[test]', function(collection, model) {
            expect(collection.length).to.equal(2);
            expect(model.id).to.equal(1);
          });

          collection.add([
            model1,
            model2
          ]);

          expect(collection.get(1).id).to.equal(1);
        });
      });
    });

    describe('utilities', function() {
      it('should be able to convert to JSON', function*() {
        collection.add([
          model1,
          model2
        ]);

        expect(collection.toJSON()).to.deep.equal([{
          createdTimestamp: "2014-05-17T19:50:15.000Z",
          email: "john.doe@example.com",
          firstName: "John",
          id: 1,
          lastName: "Doe",
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: true,
          status: "registered",
          updatedTimestamp: null,
          username: "john.doe"
        }, {
          createdTimestamp: "2014-05-17T19:50:49.000Z",
          email: "jane.doe@example.com",
          firstName: "Jane",
          id: 2,
          lastName: "Doe",
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: false,
          status: "inactive",
          updatedTimestamp: null,
          username: "jane.doe"
        }]);
      });

      it('should return null when convert empty collection to JSON', function*() {
        expect(collection.toJSON()).to.be.null;
      });

      it('should be able to convert to JSON with relationships', function*() {
        collection.add([
          model1,
          model2
        ]);

        expect(yield collection.toJSONWithRelationships('Permissions')).to.deep.equal([{
          createdTimestamp: "2014-05-17T19:50:15.000Z",
          email: "john.doe@example.com",
          firstName: "John",
          id: 1,
          lastName: "Doe",
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: true,
          status: "registered",
          updatedTimestamp: null,
          username: "john.doe",
          permissions: [
            'user.create'
          ]
        }, {
          createdTimestamp: "2014-05-17T19:50:49.000Z",
          email: "jane.doe@example.com",
          firstName: "Jane",
          id: 2,
          lastName: "Doe",
          lastPasswordChangeDate: null,
          requirePasswordChangeFlag: false,
          status: "inactive",
          updatedTimestamp: null,
          username: "jane.doe",
          permissions: [
            'user.create',
            'user.read',
            'user.update'
          ]
        }]);
      });

      it('should return null when convert empty collection to JSON with relationships', function*() {
        expect(yield collection.toJSONWithRelationships('Permissions')).to.be.null;
      });

      it('should have a length property', function*() {
        collection.add([
          model1,
          model2
        ]);

        expect(collection.length).to.equal(2);
      });
    });
  });
}