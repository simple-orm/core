var configuration = require('../configurations/data.json');

module.exports = require('mysql-pool-connection-manager')({
  host: configuration.host,
  user: configuration.username,
  password: configuration.password,
  port: configuration.port
});
