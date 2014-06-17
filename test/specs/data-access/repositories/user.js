var orm = require('../../../../orm');
var model = Object.create(orm.baseModel.create());

model.define('User', 'OrmTest', 'Users', {
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

var repository = Object.create(orm.baseRepository.create(model));

repository.plugin(require('simple-orm-find-by-primary-key'));

module.exports = {
  repository: repository,
  finalize: function(repositories) {
    model.hasOne(repositories.userDetail);
    model.hasOne(repositories.userDetailTest1, {
      jsonProperties: [
        'id',
        'details'
      ],
      property: 'userId'
    });
    model.hasMany(repositories.userEmailTest1, {
      as: 'TestUserEmailsTest1',
      jsonProperties: [
        'id',
        'email'
      ]
    });
    model.hasMany(repositories.userEmail, {
      as: 'TestUserEmails',
      jsonProperties: [
        'email'
      ]
    });
    model.hasMany(repositories.permission, {
      through: repositories.userPermissionMap,
      jsonProperties: [
        'title'
      ],
      property: 'userId',
      relationProperty: 'permissionId'
    });
  }
};
