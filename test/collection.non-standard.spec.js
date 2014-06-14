var dataLayer = require('./data-access/index.non-standard');

describe('non-standard naming database', function() {
  require('./tests/collection.js')(dataLayer);
});
