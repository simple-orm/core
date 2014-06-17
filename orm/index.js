module.exports = {
  baseModel: {
    create: require('./base-model')
  },
  baseRepository:{
    create:  require('./base-repository')
  },
  collection:{
    create:  require('./collection')
  },
  dataAdapterManager: require('./data-adapter-manager'),
  dataLayer:{
    create:  require('./data-layer')
  }
};
