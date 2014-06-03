var mysqlAdapter = require('simple-orm-mysql-adapter')(require('../mysql-connection'));
var orm = require('../../orm');

var baseValidateModel = Object.create(orm.baseModel());

//add functionality to all user model instances to baseUserModel object

var validateModel = Object.create(baseValidateModel);

validateModel.define('Validate', 'Validate', {
  id: {
    column: 'id',
    type: 'number',
    primaryKey: true,
    autoIncrement: true
  },
  notEmpty: {
    column: 'notEmpty',
    type: 'number',
    validate: {
      notEmpty: {}
    }
  },
  email: {
    column: 'email',
    type: 'string',
    validate: {
      email: {}
    }
  },
  minValue: {
    column: 'minValue',
    type: 'number',
    validate: {
      minValue: {
        criteria: [1]
      }
    }
  },
  maxValue: {
    column: 'maxValue',
    type: 'number',
    validate: {
      maxValue: {
        criteria: [12]
      }
    }
  },
  rangeValue: {
    column: 'rangeValue',
    type: 'number',
    validate: {
      rangeValue: {
        criteria: [1, 12]
      }
    }
  },
  minLength: {
    column: 'minLength',
    type: 'string',
    validate: {
      minLength: {
        criteria: [1]
      }
    }
  },
  maxLength: {
    column: 'maxLength',
    type: 'string',
    validate: {
      maxLength: {
        criteria: [12]
      }
    }
  },
  rangeLength: {
    column: 'rangeLength',
    type: 'string',
    validate: {
      rangeLength: {
        criteria: [1, 12]
      }
    }
  },
  match: {
    column: 'match',
    type: 'string',
    validate: {
      match: {
        criteria: ['match']
      }
    }
  }
});

validateModel.plugin(require('simple-orm-validate'));

var validateRepository = Object.create(orm.baseRepository(validateModel, mysqlAdapter));

validateRepository.plugin(require('simple-orm-find-by-primary-key'));

//add functionality specific to the user repository here

module.exports = {
  repository: validateRepository,
};