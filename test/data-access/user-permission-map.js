var mysqlAdapter = require('simple-orm-mysql-adapter')(require('../mysql-connection'));
var orm = require('../../orm');

var baseUserPermissionMapModel = Object.create(orm.baseModel(mysqlAdapter));

//add functionality to all user model instances to baseUserModel object

var userPermissionMapModel = Object.create(baseUserPermissionMapModel);

userPermissionMapModel.define('UserPermissionMap', 'UserPermissionMap', {
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

var userPermissionRepository = Object.create(orm.baseRepository(userPermissionMapModel, mysqlAdapter));

//add functionality specific to the user repository here

module.exports = {
  repository: userPermissionRepository,
  setupRelationships: function(models) {
    userPermissionMapModel.belongsTo(models.user);
    userPermissionMapModel.belongsTo(models.permission);
  }
};