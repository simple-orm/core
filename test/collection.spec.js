var dataLayer = require('./data-access/index');

describe('standard naming database', function() {
  require('./tests/collection.js')(dataLayer);
});
