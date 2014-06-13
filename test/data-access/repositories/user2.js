var mysqlAdapter = require('simple-orm-mysql-adapter')(require('../../mysql-connection'));
var orm = require('../../../orm');

var model = Object.create(orm.baseModel());

model.define('User2', 'OrmTest', 'Users', {
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
    exclude: 'update'
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

model.plugin(require('simple-orm-validate'));

var repository = Object.create(orm.baseRepository(model, mysqlAdapter));

repository.plugin(require('simple-orm-find-by-primary-key'));

module.exports = {
  repository: repository,
  setupRelationships: function(repositories) {
    model.hasOne(repositories.userDetail);
    model.hasMany(repositories.userEmail);
    model.hasMany(repositories.permission, {
      through: repositories.userPermissionMap,
      property: 'userId',
      relationProperty: 'permissionId'
    });
  }
};
