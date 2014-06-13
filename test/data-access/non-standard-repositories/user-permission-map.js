var mysqlAdapter = require('simple-orm-mysql-adapter')(require('../../mysql-connection'));
var orm = require('../../../orm');

var model = Object.create(orm.baseModel());

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

var repository = Object.create(orm.baseRepository(model, mysqlAdapter));

module.exports = {
  repository: repository,
  setupRelationships: function(repositories) {
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
