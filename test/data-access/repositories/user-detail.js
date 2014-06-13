var mysqlAdapter = require('simple-orm-mysql-adapter')(require('../../mysql-connection'));
var orm = require('../../../orm');

var model = Object.create(orm.baseModel());

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

var repository = Object.create(orm.baseRepository(model, mysqlAdapter));

module.exports = {
  repository: repository,
  setupRelationships: function(repositories) {
    model.belongsTo(repositories.user, {
      relationProperty: 'userId'
    });
  }
};
