# master
- model's beforeRemove hook now passes the abort callback (#18)
- if a hook aborts the action, any hooks that would have executed after are no longer executed (#22)
- remove tests from model that was testing the same thing as one of the hookable tests

- converting certain methods to be marked as internal (with a leading underscore)
- added documentation to read me
- fixed bug where you could not use toJSONWithRelationships() with just passing 1 relationship

# 0.4.0
- moved location of boolean data conversion to make sure the _values property holds a consistent value
- added support for nullable belongsTo relationship (a "can belong to" type relationship)
- added hooks for relationship data retrieval (in support of #15)
- added database to model.define()
- updated code to support wide range of database naming conventions (should support pretty much anything) (#12)
- added support for convert model to JSON with specific or all relationships
- refactored tests to easily be able to run 1 set of test against both the standard and non-standard named databases
- added sql files for running tests

# 0.3.0
- initial change log
