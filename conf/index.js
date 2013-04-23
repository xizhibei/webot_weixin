module.exports = {
  PORT: 5000,
  hostname: '127.0.0.1',
  memcached: {
    hosts: '127.0.0.1:11211',
    options: {
      retries: 2
    }
  },
  users: {
    admin: {
      passwd: 'admin'
    }
  },
  salt: 'hirobot',
  mixpanel: 'keyboardcat',
  WX_TOKEN: 'jfiuoenfeohaosduif'
};
var environ = process.env.NODE_ENV || 'development';
try {
  var localConf = require('./' + environ);
  for (var i in localConf) {
    module.exports[i] = localConf[i];
  }
} catch (e) {}