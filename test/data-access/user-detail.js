var mysqlAdapter = require('simple-orm-mysql-adapter')(require('../mysql-connection'));
var orm = require('../../orm');

var baseUserDetailModel = Object.create(orm.baseModel(mysqlAdapter));

//add functionality to all user model instances to baseUserModel object

var userDetailModel = Object.create(baseUserDetailModel);

userDetailModel.define('UserDetail', 'UserDetails', {
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

var userDetailRepository = Object.create(orm.baseRepository(userDetailModel, mysqlAdapter));

//add functionality specific to the user repository here

module.exports = {
  repository: userDetailRepository,
  setupRelationships: function(models) {
    userDetailModel.belongsTo(models.user);
  }
};