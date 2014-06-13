var mysqlAdapter = require('simple-orm-mysql-adapter')(require('../../mysql-connection'));
var orm = require('../../../orm');

var model = Object.create(orm.baseModel());

model.define('UserEmailCustomSetter', 'ORM_test', 'user_email', {
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
    setter: function(value) {
      if(value.substr(0, 7) !== 'setter-') {
        value = 'setter-' + value;
      }

      return value;
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
