var _ = require('lodash');
var instances = {};

module.exports = {
  createInstance: function(name, dataAdapter, connection) {
    //release the current instance if it already exists
    if(instances[name]) {
      instances[name].releaseConnection();
      instances[name] = undefined;
    }

    instances[name] = dataAdapter.create();
    instances[name].setConnection(connection);

    return instances[name];
  },

  getInstance: function(name) {
    if(!instances[name]) {
      throw "Data adapter instance does not exist with name of '" + name + "'";
    }

    return instances[name];
  },

  releaseInstance: function(name) {
    if(instances[name]) {
      instances[name].releaseConnection();
      instances[name] = undefined;
    }
  },

  releaseAllInstances: function() {
    _.forEach(instances, function(instance, name) {
      this.releaseInstance(name);
    }, this);
  }
};
