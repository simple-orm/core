var orm = require('../../../../orm');
var model = Object.create(orm.baseModel.create());

model.define('UserEmailCustomSetter', 'OrmTest', 'UserEmails', {
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

var repository = Object.create(orm.baseRepository.create(model));

module.exports = {
  repository: repository,
  finalize: function(repositories) {
    model.belongsTo(repositories.user);
  }
};
