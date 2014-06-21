var _ = require('lodash');

var getHookParts = function(hookName) {
  var hookNameParts = hookName.split('[');

  if(!hookNameParts[1]) {
    throw new Error('You must provide an identifier for your hook');
  }

  return {
    name: hookNameParts[0],
    identifier: hookNameParts[1].substr(0, hookNameParts[1].length -1)
  }
};

module.exports = {
  runHooks: function(hookName, args) {
    if(this._emitter) {
      this._emitter.emit.apply(this._emitter, [hookName].concat(args));
    }
  },

  hook: function(hookName, hookFunction) {
    var hookParts = getHookParts(hookName);

    if(!this._hooks[hookParts.name]) {
      this._hooks[hookParts.name] = {};
    }

    if(_.isFunction(this._hooks[hookParts.name][hookParts.identifier])) {
      throw new Error("There is already a hooks for '" + hookParts.name + "' with the identifier of '" + hookParts.identifier + "'")
    }

    this._hooks[hookParts.name][hookParts.identifier] = hookFunction;

    if(this._emitter) {
      this._emitter.on(hookParts.name, hookFunction);
    }
  },

  removeHook: function(hookName) {
    var hookParts = getHookParts(hookName);

    if(this._hooks[hookParts.name] && this._hooks[hookParts.name][hookParts.identifier]) {

      if(this._emitter) {
        this._emitter.removeListener(hookParts.name, this._hooks[hookParts.name][hookParts.identifier]);
      }

      delete this._hooks[hookParts.name][hookParts.identifier];
    }
  },

  removeAllHooks: function() {
    _.forEach(this._hooks, function(hooks, hookName) {
      _.forEach(hooks, function(hook, hookIdentifier) {
        this.removeHook(hookName + '[' + hookIdentifier + ']');
      }, this);
    }, this);

    this._hooks = {};
  }
};
