var mysqlAdapter = require('simple-orm-mysql-adapter')(require('../mysql-connection'));
var orm = require('../../orm');

var basePermissionModel = Object.create(orm.baseModel(mysqlAdapter));

//add functionality to all user model instances to baseUserModel object

var permissionModel = Object.create(basePermissionModel);

permissionModel.define('Permissions', {
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

var permissionRepository = Object.create(orm.baseRepository(permissionModel));

//add functionality specific to the user repository here

module.exports = permissionRepository;