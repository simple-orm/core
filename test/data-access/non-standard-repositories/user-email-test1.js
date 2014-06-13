var mysqlAdapter = require('simple-orm-mysql-adapter')(require('../../mysql-connection'));
var orm = require('../../../orm');

var model = Object.create(orm.baseModel());

model.define('UserEmailTest1', 'ORM_test', 'useremails__Test1', {
  id: {
    column: 'I__D',
    type: 'number',
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    column: '__u_s_e_r_i_d__',
    type: 'number'
  },
  email: {
    column: 'email',
    type: 'string'
  }
});

var repository = Object.create(orm.baseRepository(model, mysqlAdapter));

module.exports = {
  repository: repository,
  setupRelationships: function(repositories) {
    model.belongsTo(repositories.user, {
      as: 'User',
      relationProperty: '__u_s_e_r_i_d__'
    });
  }
};
