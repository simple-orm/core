var expect = require('chai').expect;

describe('data adapter', function() {
  it('should throw error if data adapter does not pass interface checker', function*() {
    var err = "The passed in data adapter has the following issue:"
    + "\nMissing insert method"
    + "\nMissing bulkInsert method"
    + "\nMissing update method"
    + "\nMissing remove method"
    + "\nMissing bulkRemove method"
    + "\nMissing find method"
    + "\nMissing findAll method"
    + "\nMissing startTransaction method"
    + "\nMissing commitTransaction method"
    + "\nMissing rollbackTransaction method";

    expect(function() {
      require('./data-access/index').create({});
    }).to.throw(err);
  });
});
