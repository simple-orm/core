module.exports = require('../../../orm/index').dataLayer.create(__dirname + '/non-standard-repositories', [
  'user',
  'user2',
  'user-detail',
  'user-detail-test1',
  'user-email',
  'user-email-test1',
  'user-email-custom-getter',
  'user-email-custom-setter',
  'permission',
  'permission-hook',
  'user-permission-map',
  'validate'
]);
