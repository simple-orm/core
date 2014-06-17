var expect = require('chai').expect;

module.exports = function() {
  describe('creation', function() {
    it('should be able to create empty collection', function*() {
      var myCollection = this.simpleOrm.collection.create();

      expect(myCollection.length).to.equal(0);
    });

    it('should be able to create collection with 1 model', function*() {
      var myCollection = this.simpleOrm.collection.create(this.model1);

      expect(myCollection.length).to.equal(1);
    });

    it('should be able to create collection with multiple models', function*() {
      var myCollection = this.simpleOrm.collection.create([
        this.model1,
        this.model2
      ]);

      expect(myCollection.length).to.equal(2);
    });
  });

  describe('data management', function() {
    it('should be able to add a single model', function*() {
      this.collection.add(this.model1);

      expect(this.collection.length).to.equal(1);
    });

    it('should be able to add a multiple models', function*() {
      this.collection.add([
        this.model1,
        this.model2
      ]);

      expect(this.collection.length).to.equal(2);
    });

    it('should be able to remove a single model', function*() {
      this.collection.add([
        this.model1,
        this.model2
      ]);

      this.collection.remove(2);

      expect(this.collection.length).to.equal(1);
      expect(this.collection.getByIndex(0).id).to.equal(1);
    });

    it('should be able to remove a multiple models', function*() {
      this.collection.add([
        this.model1,
        this.model2
      ]);

      this.collection.remove([
        1,
        2
      ]);

      expect(this.collection.length).to.equal(0);
    });

    it('should be able to remove models by model instance', function*() {
      this.collection.add([
        this.model1,
        this.model2
      ]);

      this.collection.remove([this.model2]);

      expect(this.collection.length).to.equal(1);
      expect(this.collection.getByIndex(0).id).to.equal(1);
    });

    it('should be able to clear data', function*() {
      this.collection.add([
        this.model1,
        this.model2
      ]);

      this.collection.clear();

      expect(this.collection.length).to.equal(0);
    });

    it('should be able to get model by index', function*() {
      this.collection.add([
        this.model1,
        this.model2
      ]);

      expect(this.collection.getByIndex(0).id).to.equal(1);
    });

    it('should be able to get model by primary key', function*() {
      this.collection.add([
        this.model1,
        this.model2
      ]);

      expect(this.collection.get(1).id).to.equal(1);
    });

    it('should return undefined if trying to get model by index and collection is empty', function*() {
      expect(this.collection.get(1));
    });

    it('should return undefined if trying to get model by primary key and collection is empty', function*() {
      expect(this.collection.get(1));
    });
  });

  describe('hooks', function() {
    var expectedOptions = {
      find: {}
    };

    before(function*() {
      expectedOptions.find[this.dataLayer.user._model._primaryKeyColumns[0]] = 1;
    });

    describe('beforeGetByPrimaryKey', function() {
      it('single', function*() {
        var dataLayer = this.dataLayer;
        this.collection.hook('beforeGetByPrimaryKey[test]', function(collection, options) {
          expect(options).to.deep.equal(expectedOptions);
          options.find[dataLayer.user._model._primaryKeyColumns[0]] = 2;
        });

        this.collection.add([
          this.model1,
          this.model2
        ]);

        expect(this.collection.get(1).id).to.equal(2);
      });
    });

    describe('afterGetByPrimaryKey', function() {
      it('single', function*() {
        var collection = this.collection
        this.collection.hook('afterGetByPrimaryKey[test]', function(collection, model) {
          expect(collection.length).to.equal(2);
          expect(model.id).to.equal(1);
        });

        this.collection.add([
          this.model1,
          this.model2
        ]);

        expect(this.collection.get(1).id).to.equal(1);
      });
    });
  });

  describe('utilities', function() {
    it('should be able to convert to JSON', function*() {
      this.collection.add([
        this.model1,
        this.model2
      ]);

      expect(this.collection.toJSON()).to.deep.equal([{
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
      expect(this.collection.toJSON()).to.be.null;
    });

    it('should be able to convert to JSON with relationships', function*() {
      this.collection.add([
        this.model1,
        this.model2
      ]);

      expect(yield this.collection.toJSONWithRelationships('Permissions')).to.deep.equal([{
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
      expect(yield this.collection.toJSONWithRelationships('Permissions')).to.be.null;
    });

    it('should have a length property', function*() {
      this.collection.add([
        this.model1,
        this.model2
      ]);

      expect(this.collection.length).to.equal(2);
    });

    it('should be able to convert collection to array', function*() {
      this.collection.add([
        this.model1,
        this.model2
      ]);
      var collectionArray = this.collection.toArray();

      expect(collectionArray.length).to.equal(2);
      expect(collectionArray[0].id).to.equal(1);
      expect(collectionArray[1].id).to.equal(2);
    });
  });
}
