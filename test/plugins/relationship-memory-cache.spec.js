var dataLayer = require('../data-access/index');
var dataAdapter = require('simple-orm-mysql-adapter')(require('../mysql-connection'));

describe('standard naming database', function() {
  require('../tests/plugins/relationship-memory-cache.js')(dataLayer, dataAdapter);
});
