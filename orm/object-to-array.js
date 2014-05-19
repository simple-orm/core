var _ = require('lodash');

module.exports = function(obj) {
  var data = [];

  _.forEach(obj, function(value, key) {
    data.push(key);
    data.push(value);
  });

  return data;
};