var orm = require('../../../../orm');
var model = Object.create(orm.baseModel.create());

model.define('UserPermissionMap', 'OrmTest', 'UserPermissionMap', {
  userId: {
    column: 'userId',
    type: 'number',
    primaryKey: true
  },
  permissionId: {
    column: 'permissionId',
    type: 'number',
    primaryKey: true
  }
});

var repository = Object.create(orm.baseRepository.create(model));

module.exports = {
  repository: repository,
  finalize: function(repositories) {
    model.belongsTo(repositories.user);
    model.belongsTo(repositories.permission);
  }
};
