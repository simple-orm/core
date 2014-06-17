var orm = require('../../../../orm');
var model = Object.create(orm.baseModel.create());

model.define('Validate', 'ORM_test', 'v_a_l_i_d_a_t_e', {
  id: {
    column: 'id',
    type: 'number',
    primaryKey: true,
    autoIncrement: true
  },
  notEmpty: {
    column: 'not_Empty',
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
    column: '__min_Value__',
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
    column: 'minlength',
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
    column: 'MATCH',
    type: 'string',
    validate: {
      match: {
        criteria: ['match']
      }
    }
  }
});

model.plugin(require('simple-orm-validate'));

var repository = Object.create(orm.baseRepository.create(model));

repository.plugin(require('simple-orm-find-by-primary-key'));

module.exports = {
  repository: repository,
};
