var orm = require('../../../../orm');
var model = Object.create(orm.baseModel.create());

model.define('UserEmailTest1', 'OrmTest', 'UserEmailsTest1', {
  id: {
    column: 'id',
    type: 'number',
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    column: 'userId',
    type: 'number'
  },
  email: {
    column: 'email',
    type: 'string'
  }
});

var repository = Object.create(orm.baseRepository.create(model));

module.exports = {
  repository: repository,
  finalize: function(repositories) {
    model.belongsTo(repositories.user);
  }
};
