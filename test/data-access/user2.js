var mysqlAdapter = require('simple-orm-mysql-adapter')(require('../mysql-connection'));
var orm = require('../../orm');

var baseUserModel = Object.create(orm.baseModel(mysqlAdapter));

//add functionality to all user model instances to baseUserModel object

var userModel = Object.create(baseUserModel);

userModel.define('User2', 'Users', {
  id: {
    column: 'id',
    type: 'number',
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    column: 'firstName',
    type: 'string'
  },
  lastName: {
    column: 'lastName',
    type: 'string',
    exclude: 'update'
  },
  email: {
    column: 'email',
    type: 'string'
  },
  username: {
    column: 'username',
    type: 'string'
  },
  password: {
    column: 'password',
    type: 'string'
  },
  createdTimestamp: {
    column: 'createdTimestamp',
    type: 'datetime',
    exclude: 'always'
  },
  updatedTimestamp: {
    column: 'updatedTimestamp',
    type: 'datetime',
    allowNull: true,
    defaultValue: null,
    exclude: 'insert'
  },
  lastPasswordChangeDate: {
    column: 'lastPasswordChangeDate',
    type: 'date',
    allowNull: true,
    defaultValue: null
  },
  requirePasswordChangeFlag: {
    column: 'requirePasswordChangeFlag',
    type: 'boolean',
    defaultValue: false
  },
  status: {
    column: 'status',
    type: 'enum',
    values: [
      'active',
      'inactive',
      'banned',
      'registered'
    ],
    defaultValue: 'registered'
  }
});

var userRepository = Object.create(orm.baseRepository(userModel));

//add functionality specific to the user repository here

module.exports = {
  repository: userRepository,
  setupRelationships: function(models) {
    userModel.hasOne(models.userDetail);
    userModel.hasMany(models.userEmail);
    userModel.hasMany(models.permission, {
      through: models.userPermissionMap,
      property: 'userId',
      relationProperty: 'permissionId'
    });
  }
};