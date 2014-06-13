var mysqlAdapter = require('simple-orm-mysql-adapter')(require('../../mysql-connection'));
var orm = require('../../../orm');

var model = Object.create(orm.baseModel());

model.define('UserEmailCustomGetter', 'ORM_test', 'user_email', {
  id: {
    column: 'Id',
    type: 'number',
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    column: 'userid',
    type: 'number'
  },
  email: {
    column: 'email',
    type: 'string',
    getter: function(value) {
      return 'getter-' + value;
    }
  }
});

var repository = Object.create(orm.baseRepository(model, mysqlAdapter));

module.exports = {
  repository: repository,
  setupRelationships: function(repositories) {
    model.belongsTo(repositories.user, {
      as: 'User',
      relationProperty: 'userid'
    });
  }
};
