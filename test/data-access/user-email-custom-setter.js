var mysqlAdapter = require('simple-orm-mysql-adapter')(require('../mysql-connection'));
var orm = require('../../orm');

var baseUserEmailModel = Object.create(orm.baseModel(mysqlAdapter));

//add functionality to all user model instances to baseUserModel object

var userEmailModel = Object.create(baseUserEmailModel);

userEmailModel.define('UserEmailCustomSetter', 'UserEmails', {
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

var userEmailRepository = Object.create(orm.baseRepository(userEmailModel));

//add functionality specific to the user repository here

module.exports = {
  repository: userEmailRepository,
  setupRelationships: function(models) {
    userEmailModel.belongsTo(models.user);
  }
};