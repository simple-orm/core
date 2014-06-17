var expect = require('chai').expect;

module.exports = function() {
  it('should be supported', function*() {
    var model = yield this.dataLayer.permission.find({
      where: {
        id: 1
      }
    });

    model.title = 'updated';
    yield model.save();

    var model2 = yield this.dataLayer2.permission.find({
      where: {
        id: 1
      }
    });

    //dataLayer2 uses it own connection so it should be it own value
    expect(model2.title).to.equal('user.create');

    var model3 = yield this.dataLayer.permission.find({
      where: {
        id: 1
      }
    });

    //verify that the data was properly save to the data store
    expect(model3.title).to.equal('updated');
  });
};
