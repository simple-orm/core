var orm = require('../../../../orm');
var model = Object.create(orm.baseModel.create());

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

var repository = Object.create(orm.baseRepository.create(model));

module.exports = {
  repository: repository,
  finalize: function(repositories) {
    model.hasMany(repositories.user, {
      through: repositories.userPermissionMap
    });
  }
};
