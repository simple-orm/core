var baseModel = require('../../orm/base-model');
var baseRepository = require('../../orm/base-repository');

var baseUserModel = Object.create(baseModel);

//add functionality to all user model instances to baseUserModel object

var userModel = Object.create(baseUserModel);

userModel.define('Users', {
  id: {
    column: 'id',
    type: 'integer',
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

var userRepository = Object.create(baseRepository(userModel));

//add functionality specific to the user repository here

module.exports = userRepository;