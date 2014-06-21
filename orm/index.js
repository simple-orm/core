module.exports = {
  baseModel: require('./base-model'),
  baseRepository: require('./base-repository'),
  collection: {
    create:  require('./collection')
  },
  dataAdapterManager: require('./data-adapter-manager'),
  dataLayer: {
    create:  require('./data-layer')
  }
};
