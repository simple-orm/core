var orm = require('../../../../orm');
var model = Object.create(orm.baseModel.create());

model.define('UserEmail', 'ORM_test', 'user_email', {
  id: {
    column: 'Id',
    type: 'number',
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    column: 'userid',
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
    model.belongsTo(repositories.user, {
      as: 'User',
      relationProperty: 'userid'
    });
  }
};
