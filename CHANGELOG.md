If a change is prefixed with one or more of these, it has special mean:

- [internal]: a change was made to the internal API (anythign with a leading underscore)
- [breaking change]: a breaking change was made

# master
- [internal] [breaking change] `_getPrimaryKeyData()` was change to `_getDataStorePrimaryKeyData()`
- [internal] [breaking change] remove model's `_primaryKeys` property (replaced with `_primaryKeyColumns` and `_primaryKeyProperties`)
- added `attach*()`/`detach*()` methods to the model when adding a `hasMany` relationship with a through repository (#16)
- updated data adapter interface requirements
- added `toArray()` method for collections

# 0.5.1
- updated base model to work properly with the new collection object
- the collection's `toJSON()` and `toJSONWithRelationships()` methods now return null if the collection is empty

# 0.5.0
- added a collection object (#17)
- fixed issue where if a call to the model's `toJSONWithRelationships()` method has no valid relationships passed, the promise would never get resolved
- add status parameter to model`s, `loadData()` method
- added `reset()` method to base model (#14)
- added ability to pass a parameter list to `toJSONWithRelationships()` (#19)
- added `excludeJson` property configuration option (#20)
- renamed property configuration option `exclude` to `excludeSave` (#21)
- model's `beforeRemove` hook now passes the abort callback (#18)
- if a hook aborts the action, any hooks that would have executed after are no longer executed (#22)
- remove tests from model that was testing the same thing as one of the hookable tests
- converting certain methods to be marked as internal (with a leading underscore)
- added documentation to read me
- fixed bug where you could not use `toJSONWithRelationships()` with just passing 1 relationship

# 0.4.0
- moved location of boolean data conversion to make sure the `_values` property holds a consistent value
- added support for nullable `belongsTo` relationship (a "can belong to" type relationship)
- added hooks for relationship data retrieval (in support of #15)
- added database to model's `define()` method
- updated code to support wide range of database naming conventions (should support pretty much anything) (#12)
- added support for convert model to JSON with specific or all relationships
- refactored tests to easily be able to run 1 set of test against both the standard and non-standard named databases
- added sql files for running tests

# 0.3.0
- initial change log
