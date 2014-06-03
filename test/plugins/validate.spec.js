var dataLayer = require('../index');
var dataAdapter = require('simple-orm-mysql-adapter')(require('../mysql-connection'));
var expect = require('chai').expect;

describe('(PLUGIN) validate', function() {
  beforeEach(function*(){
    //dataAdapter.enableDebug();
    yield dataAdapter.startTransaction();
  });

  afterEach(function*(){
    dataAdapter.disableDebug();
    yield dataAdapter.rollbackTransaction();
  });

  describe('type', function() {
    it('notEmpty', function*() {
      var model = yield dataLayer.validate.find(1);

      model.notEmpty = '';

      var validationResults = model.validate();

      expect(validationResults.notEmpty.length).to.equal(1);
      expect(validationResults.notEmpty).to.include("can not be empty");
    });

    it('email', function*() {
      var model = yield dataLayer.validate.find(1);

      model.email = 'test';

      var validationResults = model.validate();

      expect(validationResults.email.length).to.equal(1);
      expect(validationResults.email).to.include("'test' is not a valid email address");
    });

    it('minValue', function*() {
      var model = yield dataLayer.validate.find(1);

      model.minValue = 0;

      var validationResults = model.validate();

      expect(validationResults.minValue.length).to.equal(1);
      expect(validationResults.minValue).to.include("'0' must be at least '1'");
    });

    it('maxValue', function*() {
      var model = yield dataLayer.validate.find(1);

      model.maxValue = 13;

      var validationResults = model.validate();

      expect(validationResults.maxValue.length).to.equal(1);
      expect(validationResults.maxValue).to.include("'13' can not exceed '12'");
    });

    it('rangeValue', function*() {
      var model = yield dataLayer.validate.find(1);

      model.rangeValue = 0;

      var validationResults = model.validate();

      expect(validationResults.rangeValue.length).to.equal(1);
      expect(validationResults.rangeValue).to.include("'0' must be between '1' and '12'");
    });

    it('minLength', function*() {
      var model = yield dataLayer.validate.find(1);

      model.minLength = '';

      var validationResults = model.validate();

      expect(validationResults.minLength.length).to.equal(1);
      expect(validationResults.minLength).to.include("'' must have at least '1' characters");
    });

    it('maxLength', function*() {
      var model = yield dataLayer.validate.find(1);

      model.maxLength = 'testtesttestt';

      var validationResults = model.validate();

      expect(validationResults.maxLength.length).to.equal(1);
      expect(validationResults.maxLength).to.include("'testtesttestt' can not have more than '12' characters");
    });

    it('rangeLength', function*() {
      var model = yield dataLayer.validate.find(1);

      model.rangeLength = '';

      var validationResults = model.validate();

      expect(validationResults.rangeLength.length).to.equal(1);
      expect(validationResults.rangeLength).to.include("'' must contain between '1' and '12' characters");
    });

    it('match', function*() {
      var model = yield dataLayer.validate.find(1);

      model.match = 'test';

      var validationResults = model.validate();

      expect(validationResults.match.length).to.equal(1);
      expect(validationResults.match).to.include("'test' must match 'match'");
    });
  });

  it('should allow to validate a single property against one ore more validations', function*() {
    var model = yield dataLayer.user.find(3);

    model.firstName = 'te';
    model.email = '';

    var validationResults = model.validate();

    expect(validationResults.firstName.length).to.equal(1);
    expect(validationResults.firstName).to.include("'te' must contain between '3' and '100' characters");

    expect(validationResults.email.length).to.equal(2);
    expect(validationResults.email).to.include("put something here!!!");
    expect(validationResults.email).to.include("'' is not a valid email address");
  });

  it('should return true if validations passes', function*() {
    var model = yield dataLayer.user.find(3);

    expect(model.validate()).to.be.true;
  });

  it('should return validate results on failure when attempt to save', function*() {
    var model = yield dataLayer.user.find(3);

    model.firstName = 'te';
    model.email = '';

    var validationResults = yield model.save();

    expect(validationResults.firstName.length).to.equal(1);
    expect(validationResults.firstName).to.include("'te' must contain between '3' and '100' characters");

    expect(validationResults.email.length).to.equal(2);
    expect(validationResults.email).to.include("put something here!!!");
    expect(validationResults.email).to.include("'' is not a valid email address");
  });
});