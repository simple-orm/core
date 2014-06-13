var mysqlAdapter = require('simple-orm-mysql-adapter')(require('../../mysql-connection'));
var orm = require('../../../orm');

var model = Object.create(orm.baseModel());

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

var repository = Object.create(orm.baseRepository(model, mysqlAdapter));

module.exports = {
  repository: repository,
  setupRelationships: function(repositories) {
    model.belongsTo(repositories.user);
    model.belongsTo(repositories.permission);
  }
};
