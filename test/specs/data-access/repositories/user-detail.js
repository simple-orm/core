var orm = require('../../../../orm');
var model = Object.create(orm.baseModel.create());

model.define('UserDetail', 'OrmTest', 'UserDetails', {
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
      relationProperty: 'userId'
    });
  }
};
