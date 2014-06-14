var expect = require('chai').expect;

module.exports = function(model, expectedData) {
  if(expectedData.id !== undefined) {
    expect(model.id).to.equal(expectedData.id);
  }

  if(expectedData.createdTimestamp !== undefined) {
    expect(model.createdTimestamp).to.equal(expectedData.createdTimestamp);
  }

  if(expectedData.updatedTimestamp !== undefined) {
    expect(model.updatedTimestamp).to.equal(expectedData.updatedTimestamp);
  }

  expect(model.firstName).to.equal(expectedData.firstName);
  expect(model.lastName).to.equal(expectedData.lastName);
  expect(model.email).to.equal(expectedData.email);
  expect(model.username).to.equal(expectedData.username);
  expect(model.password).to.equal(expectedData.password);
  expect(model.lastPasswordChangeDate).to.equal(expectedData.lastPasswordChangeDate);
  expect(model.requirePasswordChangeFlag).to.equal(expectedData.requirePasswordChangeFlag);
  expect(model.status).to.equal(expectedData.status);
};