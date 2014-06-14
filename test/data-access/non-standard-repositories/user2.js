var mysqlAdapter = require('simple-orm-mysql-adapter')(require('../../mysql-connection'));
var orm = require('../../../orm');

var model = Object.create(orm.baseModel());

model.define('User2', 'ORM_test', 'sresu', {
  id: {
    column: 'id',
    type: 'number',
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    column: 'firstName',
    type: 'string',
    validate: {
      rangeLength: {
        criteria: [3, 100]
      }
    }
  },
  lastName: {
    column: 'lastName',
    type: 'string',
    excludeSave: 'update'
  },
  email: {
    column: 'email',
    type: 'string',
    validate: {
      email: {},
      notEmpty: {
        message: 'put something here!!!'
      }
    }
  },
  username: {
    column: 'username',
    type: 'string'
  },
  password: {
    column: 'password',
    type: 'string',
    excludeJson: true
  },
  createdTimestamp: {
    column: 'createdTimestamp',
    type: 'datetime',
    excludeSave: 'always'
  },
  updatedTimestamp: {
    column: 'updatedTimestamp',
    type: 'datetime',
    allowNull: true,
    defaultValue: null,
    excludeSave: 'insert'
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

model.plugin(require('simple-orm-validate'));

var repository = Object.create(orm.baseRepository(model, mysqlAdapter));

repository.plugin(require('simple-orm-find-by-primary-key'));

module.exports = {
  repository: repository,
  setupRelationships: function(repositories) {
    model.hasOne(repositories.userDetail, {
      as: 'UserDetail',
      property: 'i_d'
    });
    model.hasMany(repositories.userEmail, {
      as: 'UserEmails',
      property: 'userid'
    });
    model.hasMany(repositories.permission, {
      as: 'Permissions',
      through: repositories.userPermissionMap,
      property: '__user_Id__',
      relationProperty: 'PER_mission_iD'
    });
  }
};
