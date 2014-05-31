var mysqlAdapter = require('simple-orm-mysql-adapter')(require('../mysql-connection'));
var orm = require('../../orm');

var basePermissionModel = Object.create(orm.baseModel());

basePermissionModel.hook('beforeSave[test]', function(model, saveType) {
  model.title = 'before-' + model.title;
});

//add functionality to all user model instances to baseUserModel object

var permissionModel = Object.create(basePermissionModel);

permissionModel.define('PermissionHook', 'Permissions', {
  id: {
    column: 'id',
    type: 'number',
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    column: 'title',
    type: 'string'
  }
});

var permissionRepository = Object.create(orm.baseRepository(permissionModel, mysqlAdapter));

//add functionality specific to the user repository here

module.exports = {
  repository: permissionRepository,
  setupRelationships: function(models) {
    permissionModel.hasMany(models.user, {
      through: models.userPermissionMap
    });
  }
};