var dataLayer = require('../data-access/index.non-standard');
var dataAdapter = require('simple-orm-mysql-adapter')(require('../mysql-connection'));

describe('non-standard naming database', function() {
  require('../tests/plugins/validate.js')(dataLayer, dataAdapter);
});
