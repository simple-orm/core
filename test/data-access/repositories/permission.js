var mysqlAdapter = require('simple-orm-mysql-adapter')(require('../../mysql-connection'));
var orm = require('../../../orm');

var model = Object.create(orm.baseModel());

model.define('Permission', 'OrmTest', 'Permissions', {
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

var repository = Object.create(orm.baseRepository(model, mysqlAdapter));

module.exports = {
  repository: repository,
  setupRelationships: function(repositories) {
    model.hasMany(repositories.user, {
      through: repositories.userPermissionMap
    });
  }
};
