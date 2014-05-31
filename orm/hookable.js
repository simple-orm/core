/**
 * NOTE: you must define _emitter and _hooks when using this as a base object in order to make sure object don't share events
 */
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
    this._emitter.emit.apply(this._emitter, [hookName].concat(args));
  },

  hook: function(hookName, hookFunction) {
    var hookParts = getHookParts(hookName);

    if(!this._hooks[hookParts.name]) {
      this._hooks[hookParts.name] = {};
    }

    this._hooks[hookParts.name][hookParts.identifier] = hookFunction;

    this._emitter.on(hookParts.name, hookFunction);
  },

  removeHook: function(hookName) {
    var hookParts = getHookParts(hookName);

    this._emitter.removeListener(hookParts.name, this._hooks[hookParts.name][hookParts.identifier]);

    if(this._hooks[hookParts.name] && this._hooks[hookParts.name][hookParts.identifier]) {
      delete this._hooks[hookParts.name][hookParts.identifier];
    }
  }
};