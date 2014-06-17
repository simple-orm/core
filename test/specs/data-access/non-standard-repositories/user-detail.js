var orm = require('../../../../orm');
var model = Object.create(orm.baseModel.create());

model.define('UserDetail', 'ORM_test', 'userDetails', {
  id: {
    column: 'i_d',
    type: 'number',
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    column: 'USER_ID',
    type: 'number'
  },
  details: {
    column: 'details',
    type: 'string'
  }
});

var repository = Object.create(orm.baseRepository.create(model));

module.exports = {
  repository: repository,
  finalize: function(repositories) {
    model.belongsTo(repositories.user, {
      as: 'User',
      relationProperty: 'userId'
    });
  }
};
