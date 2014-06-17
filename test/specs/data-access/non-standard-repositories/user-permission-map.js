var orm = require('../../../../orm');
var model = Object.create(orm.baseModel.create());

model.define('UserPermissionMap', 'ORM_test', 'UsErPeRmIsSiOnMaP', {
  userId: {
    column: '__user_Id__',
    type: 'number',
    primaryKey: true
  },
  permissionId: {
    column: 'PER_mission_iD',
    type: 'number',
    primaryKey: true
  }
});

var repository = Object.create(orm.baseRepository.create(model));

module.exports = {
  repository: repository,
  finalize: function(repositories) {
    model.belongsTo(repositories.user, {
      as: 'User',
      relationProperty: '__user_Id__'
    });
    model.belongsTo(repositories.permission, {
      as: 'Permissions',
      relationProperty: 'PER_mission_iD'
    });
  }
};
