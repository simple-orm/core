var mysql = require('mysql');
var configuration = require('../configurations/data.json');

module.exports = {
  connection: mysql.createConnection({
    host: configuration.host,
    user: configuration.username,
    password: configuration.password,
    port: configuration.port
  })
};
