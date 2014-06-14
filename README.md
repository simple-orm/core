# Simple ORM

This documentation can also be found [here](http://www.ryanzec.com/project-simple-orm).

Change log can be found [here](https://github.com/simple-orm/core/blob/master/CHANGELOG.md);

A "simple" ORM for NodeJS.

This ORM is designed to be light weight in the core framework but easily extendable to allow for more advance/specific features to be included in an opt-in way.  It has 2 main core components are `repositories` and `models`.  The base components will provide the basic functionality for creating, retrieving, and saving data.  The core framework will also provide the following:

- Structure for defining data relationships
- Simple plugin system for repositories and models
- System to allow you to hook into internal functions that the core library executes

If a piece of functionality is not critical to the library to work (like finding a model by passing just a primary key or data validation) or could be implemented in multiple ways (like soft deleting a model or caching of query results), then those pieces of functionality will be implement through plugins.

## Data Store Support

Right now MySQL/MariaDB is the only data store supported however additional data stores can be added in by just creating a new adapter for it with the required interface.

This ORM is designed with relational databases in mind so while the core library does try to be data store agnostic in functionality, terminology is not.

For example, when doing ```findAll()``` you can define a join property in the criteria.  This is a common relational SQL term for joining tables.  With NoSQL databases like MongoDB you technically don't have joins (though you can get something similar with references).  Now the format that the join is defined in is custom so for something like this, it is just a matter of making sure the data adapter processes the join structure properly.

Another example would be that the data adapter requires the methods ```startTransaction()```, ```commitTransaction()``` and ```rollbackTransaction()```.  Again, with databases like MongoDB, you can't do transactions (multi-document transactions).  With functionality that is just not supported in the data store your data adapter is working with, just create a method that does nothing.  There are more examples (like property definitions of column, autoComplete, etc...) but I think you get it.

Obviously creating methods that don't do anything or ignored parts of the code (like ignoring the join definitions if you data store does not support them) will create some confusion but the only alternatives are to create an ORM that requires a data store that supports all the features the ORM thinks it has access to (which I did think about) or create an ORM that make use of only the minimal amount of functionality that all possible supported data stores have in common.  I think the way this ORM does it will allow support for the maximum number of data stores but be able to make use of certain pieces of functionality if the data store you are using support it.

I would document what features your data adapter does and doesn't support.  So MySQL/MariaDB would be:

* Transactions - Supported
* Joins - Supported

MongoDB would be something like:

* Transactions - Not Supported
* Joins - Supported

This way if a user that is currently using the MySQL/MariaDB data adapter and they are thinking about switching to the MongoDB data adapter, they will know that transactions are not supported.  With the way the library is built, if they are fine with the lack of transaction support, they should be able to switch out the data adapter without modifying any of the code that assumes transaction support (as it will just execute code that does nothing).

I would probably say that you should remove the transactional code from the codebase to avoid any confusion but it would not be required.

## Documentation
***NOTE: Any place you see `yield` being used in code examples, just know that those methods are returning a promise, `yield` is being used because it in my opinion is a cleaner and easier way to deal with async code.***

### Installation

The core framework can be installed with:

```
npm install simple-orm
```

If you wish to experiment with the latest and greatest version, this is how you should define your dependency in your `package.json` file:

```javascript
"simple-orm": "git://github.com/simple-orm/core.git#master"
```

In order to define data objects, you are going to have to also install a data adapter.  Right now the only one that exists is the `simple-orm-mysql-adapter` (which also should work with MariaDB) which can be installed with:

```
npm install simple-orm-data-adapter
```

All code example here are assuming the use of this data adapter so for documentation on how this data adapter works, please visit it's [github repository](https://github.com/simple-orm/mysql-adapter).

## Naming Conventions

This ORM makes certain assumptions about table/column naming.  The following assumptions are made:

- You tables are plural and named with PascalCase
- You columns are naming with camelCase

If your database follows these conventions, you will not have to do a lot of extra configuration to get code working out of the box.  If your database doesn't, this ORM can still be used, you will just have to do a bit more configuration to make it work.  It should work with any naming convention (or lack of) you have, you can take a look at [this file](https://github.com/simple-orm/core/blob/master/test/sql/ORM_test.sql) to see what the structure looks like that the non-standard naming convention tests run against.

## Defining Models/Repositories

The ORM works with models and repositories that you define.  Let look at a simple data access file (fully commented):

```javascript
//first we need to get the instance of the data adapter
var mysqlAdapter = require('simple-orm-mysql-adapter')(require('./mysql-connection'));

//next we include the ORM library which give use access to what we need to create models and repositories
var orm = require('simple-orm');

//now we create our model by creating a new object based on the ORM's base model which has all the basic functionality.
//you should never interact with this model object directly outside of this file, instances of this models are created
//through the use of the repository.
var model = Object.create(orm.baseModel());

//at this point you can add functionality to the model object and every instance of the model create dwill have that
//functionality
/*model.doSomething = function() {
  //code...
};*/

//now we have to define the model's structure (which is documented below).
model.define('Permission', 'OrmTest', 'Permissions', {
  id: {
    column: 'id',
    type: 'number',
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    column: 'title',
    type: 'string'
  }
});

//next we create the repository for this model by creating a new object based on the ORM's base repository which has all
//the basic functionality.  You need to pass for the model this repository is for and then the data adapter this
//repository should use.
var repository = Object.create(orm.baseRepository(model, mysqlAdapter));

//just like with the model, now you can add custom functionality to the repository
/*repository.doSomethingElse = function() {
  //code...
};*/

//finally you export the repository which is what your application should be interacting with in order to get model
//instances.  the finalizeSetup() method is there is order to define relationships with other models.  this needs
//to be done here because it needs access to all the repositories in order to properly setup the relationships.  we
//will see how the finalizeSetup() method is used
module.exports = {
  repository: repository,
  finalizeSetup: function(repositories) {
    model.hasMany(repositories.user, {
      through: repositories.userPermissionMap
    });
  }
};
```

It is recommended to create 1 model/repository per file.  With this recommended structure, you will need to be able to create the models/repositories first and then you will be able to create the relationships.  The recommended way to do that in this structure is to have a file structure like this:

```
|-- app/
| |-- data-layer
| | |-- repositories
| | | |-- permission.js
| | | |-- user.js
| | |-- index.js
```

Your `index.js` file should look like this:

```javascript
var _ = require('lodash');
var S = require('string');

//new model files just need to be added to this array, everything else is handled automatically
var dataModuleFiles = [
  'user',
  'permission'
];

var rawDataModules = {};
var repositories = {};

//create all the models/repositories
dataModuleFiles.forEach(function(value) {
  var modelName = S(value).camelize().s;
  rawDataModules[modelName] = require('./repositories/' + value);

  repositories[modelName] = rawDataModules[modelName].repository;
});

//do any code finalization now that we have access to all the repositories
_.forEach(rawDataModules, function(rawModel) {
  if(rawModel.finalizeSetup) {
    rawModel.finalizeSetup(repositories);
  }
});

//this file exposes all repositories so this is the only file that needs to be required in order to get access any of
//your repositories.
module.exports = repositories;
```

### Model Definition

The model's `define()` method takes in 4 parameters.

#### Model Name

The first parameter is the name of the model.  This name is expected to be PascalCase and is used internally when creating methods when assigning relationships to the model.

#### Database Name

The second parameter is the name of the database.  This is used by the data adapter in order to properly identify where the table is stored for the model.

#### Table Name

The third parameter is the name of the table.  This is used by the data adapter in order to properly identify where the data is store for the model.

#### Properties Configuration

The forth parameter are the property configurations.  This is used to map the table columns to the models properties.  This is a key/value object where the key is the property name of the model that can be used to interact with the data and the value is the property's configuration.  The following can be configured for properties used by the core framework(* denotes optional):

- `column (string)`: The name of the table's column to map the property to.
- `type` (string)`: The data type of the property.  The core framework uses this to do data conversions when dealing with data from the data adapter.  The data adapter also has access to this in order to do any type of data conversion it needs to do in order to insert/update data in the data store.  These are the following types supported by the core framework:
 - `string`
 - `number`
 - `boolean`
 - `date`
 - `datetime`
 - `enum`
- `*values (array)`: A list of possible value for this property (only used for the enum data type)
- `*primaryKey (boolean)`: Whether or not this property is part of the primary key (multiple properties can have this set to true)
- `*autoIncrement (boolean)`: Whether or not the data store auto creates/increments this property
- `*getter (function)`: A custom getter function used when retrieving the property (is passed a parameter of the value and expects a value to be returned)
- `*setter (function)`: A custom setter function used when setting the property (is passed a parameter of the value and expects a value to be returned)
- `*defaultValue (mixed)`: The default value to set when creating a new model instance
- `*excludeSave (string)`: When to exclude the property when the data adapter syncs that data to the data store, the value can be:
 - `insert`
 - `update`
 - `both`

Please note that you can add any arbitrary property to the configure.  This is useful so plugin can provide there own configurations per model property if needed (like the [validate plugin](https://github.com/simple-orm/validate) does).

### Model API

#### define(modelName, databaseName, tableName, propertyConfiguration)

Explained above.

#### save()

This will save the model to the data store with the data adapter.

```javascript
var user = yield dataLayer.user.find({
  where: {
    id: 1
  }
});

user.firstName = 'test';

yield user.save();
```

This will resolve to `true` if successful or be rejected with the error (unless a `beforeSave` hook aborts with some other value).

#### remove()

This will remove the model from the data with the data adapter.

```javascript
var user = yield dataLayer.user.find({
  where: {
    id: 1
  }
});

yield user.remove();
```

This will resolve to `true` if successful or be rejected with the error (unless a `beforeHook` hook aborts with some other value).  It is also important to note that the model object will still retain the data even after it has been deleted from the data store.

#### toJSON()

This will convert the model to JSON.

```javascript
var user = yield dataLayer.user.find({
  where: {
    id: 1
  }
});

var userJson = user.toJSON();
```

#### toJSONWithRelationships(relationships)

This will convert the model to JSON with the option of also including relationships too.  The `relationships` parameter is an array of relationship names that can be passed.  If left empty, all relationships will be retrieving and converted to JSON.

The `relationships` parameter is an array of relationship names that can be passed.  If left empty, all relationships will be retrieving and converted to JSON.

```javascript
var user = yield dataLayer.user.find({
  where: {
    id: 1
  }
});

//for all relationships
var userJsonWithRelationships = yield user.toJSONWithRelationships();

//for just the permissions relationship
var userJsonWithRelationships = yield user.toJSONWithRelationships(['permissions']);
```

#### loadData(data)

This will allow you to pass an object of data and load it into the model.

```javascript
//same thing as
//var user = dataLayer.user.create({
//  firstName: 'Test',
//  lastNAme: 'User'
//});
var user = dataLayer.user.create();
user.loadData({
  firstName: 'Test',
  lastNAme: 'User'
});
```

### Defining Relationships

Relationships are defined on the model object with the `belongsTo()`, `hasOne()`, and `hasMany()` methods.

#### Options Object

All the relationship defining methods take an options object as the last parameter.  All options are optional though if you are not using the assumed naming conventions, you will probably want to define some of them to keep your code consistent.  The options object can have the following properties:

##### as `belongsTo()` `hasOne()` `hasMany()`

The `as` property is a string that is used in creating the methods used to interact with the relationship.  It assumes a string that is PascalCase.

```javascript
model.belongsTo(repositories.user, {
  as: 'MyCustomName'
});
```

This defaults to the name of the model for `belongsTo()`/`hasOne()` and defaults to the name of the table for `hasMany()` of the relating model.  This is also the name used with the `toJSONWithRelationships()` method

##### through `hasMany()`

The `through` property is only used for the `hasMany()` relationship and it is a repository of a mapping model.

```javascript
model.hasMany(repositories.permissions, {
  through: repositories.userPermissionMap
});
```

##### property `hasOne()` `hasMany()`

The `property` property is the data store property of the model defining the relationship to use to join and get the relation model.

```javascript
//this generate this the follow criteria object when calling getUserDetail():
{
  where: {
    userId: 1
  }
}
model.hasOne(repositories.userDetail);

//this generate this the follow criteria object when calling getUserDetail():
{
  where: {
    myCustomField: 1
  }
}
model.hasOne(repositories.userDetail, {
  property: 'myCustomField'
});
```

##### relationProperty `belongsTo()` `hasMany()`

The `relationProperty` is the data store property of the model relation model use to join and get the relation model

```javascript
//this generate this the follow criteria object when calling getUser():
{
  where: {
    userId: 1
  }
}
model.belongsTo(repositories.user);

//this generate this the follow criteria object when calling getUser():
{
  where: {
    myCustomField: 1
  }
}
model.belongsTo(repositories.user, {
  relationProperty: 'myCustomField'
});
```

#### belongsTo(repository, options)

This defines a one-to-one relationship where the model belongs to another model.

```javascript
//now all instances of this model will have a getUser() method
model.belongsTo(repositories.user);
```

#### hasOne(repository, options)

This defines a one-to-one relationship where the model owns another model.

```javascript
//now all instances of this model will have a getUserDetail() method
model.hasOne(repositories.userDetail);
```

#### hasMany(repository, options)

This can define a one-to-many or many-to-many relationship between models

##### one-to-many

```javascript
//now all instances of this model will have a getUserGroups() method
model.hasMany(repositories.userGroup);
```

##### many-to-many

To define a many-to-many, you must use the `through` option.

```javascript
//now all instances of this model will have a getPermissions() method
model.hasMany(repositories.permissions, {
  through: repositories.userPermissionMap
});
```

### Criteria Object

The criteria object is used when searching for data through the repository's `find()` and `findAll()` methods and it can have 2 properties, `where` and `join`.

#### Where

The `where` property is a object where the key is the name of the data store property and the value is either the value to validate against which would be an equals comparison or an object.  If you need to do something besides an equals comparison, you can use an object which can have the follow properties:

- `comparison`: The comparison operator to use
- `value`: The value or array of values to check
- `valueType`: This can be set to `'field'` which will skip escaping the value

So if you want to see if something is greater than something you could do:

```javascript
dataLayer.user.findAll({
  where: {
    age: {
      comparison: '>',
      value: 30
    }
  }
});
```

This also supports comparisons that require multiple values or no values:

```javascript
dataLayer.user.findAll({
  where: {
    age: {
      comparison: 'in',
      value: [
        25,
        26,
        27
      ]
    }
  }
});

dataLayer.user.findAll({
  where: {
    age: {
      comparison: 'is not null'
    }
  }
});

dataLayer.user.findAll({
  where: {
    age: {
      comparison: 'not between',
      value: [
        20,
        30
      ]
    }
  }
});
```

#### Join

The `join` property is an array of joining tables done with repositories.  An element in the join array would look like this:

```javascript
dataLayer.user.findAll({
  join: [{
    repository: dataLayer.userEmail,
    on: {
      'Users.id': {
        value: 'UserEmails.userId',
        valueType: 'field'
      }
    }, {
      'UserEmails.email': {
        comparison: '!=',
        value: 'one@example.com'
      }
    }
  }]
});
```

You pass in the `repository` which is used to determine the table that it is joining.  You then pass in the `on` property which matches what the `where` property structure is.

### Repository API

#### create(initialDataObject)

The `create()` method will allow you to create a new instance of the model that is tied to the repository.  You can optionally pass in an object that will be used to populate the model's values.

```javascript
var newUser = yield dataLayer.user.create({
  firstName: 'Test',
  lastName: 'User'
});
```

#### find(criteria)

The `find()` method will find and return the first model that matches the passed criteria, or null is nothing is found.

```javascript
var user = yield dataLayer.user.find({
  where: {
    id: 1
  }
});
```

#### findAll(criteria)

The `findAll()` method will find and return all models that match that passed criteria as an array, or null if nothing is found.

```javascript
var user = yield dataLayer.user.find({
  where: {
    age: {
      comparison: '<',
      value: 50
    }
  }
});
```

## Hook System

Simple ORM comes with a hook system that allows you to execute code before and after certain internal methods happen.  You can apply multiple hook functions to the same hook and they are executed in the order they were added.  When adding a hook, you need to attach the hook using the `hook()` method of the model or repository:

```javascript
model.hook('beforeSave[test]', function(model, saveType, abort) {
  //hook code here
});
```

The first parameter is the name of the hook with an identifier wrapped in brackets.  This make is possible to remove certain hook functions from a hook with removing them all with the `removeHook()` method:

```javascript
model.removeHook('beforeSave[test]');
```

The second parameter is the hook function to be executed.

All `before` hooks will have the last parameter be an abort callback.  Calling this within the hook function will prevent the default action from happening.  The abort method takes an optional parameter which if given, will be the return value of the original method call:

```javascript
model.hook('beforeSave[test]', function(model, saveType, abort) {
  if(/*some condition*/true) {
    abort('test');
  }
});

var saveResults = model.save();
// saveResults === 'test'
```

If you call abort without a parameter, false will be returned:

```javascript
model.hook('beforeSave[test]', function(model, saveType, abort) {
  if(/*some condition*/true) {
    abort();
  }
});

Calling abort will also prevent any other hooks from executing after the hook calling abort.

var saveResults = model.save();
// saveResults === false
```

The following hooks are supported:

### Model

- `beforeSave(model, saveType, abort)`
 - `model`: The model
 - `saveType`: Type of save being perform (`insert` or `update')
 - `abort`: Abort callback
- `afterSave(model, saveType)`
 - `model`: The model
 - `saveType`: Type of save being perform (`insert` or `update')
 - `abort`: Abort callback
- `beforeRemove(model, saveType, abort)`
 - `model`: The model
 - `saveType`: Type of save being perform (`insert` or `update')
- `afterRemove(model, saveType)`
 - `model`: The model
 - `saveType`: Type of save being perform (`insert` or `update')
- `beforeGetRelationship(model, relationshipType, relationshipName, abort)`
 - `model`: The model
 - `relationshipType`: The name of the relationship type (`belongsTo`, `hasOne`, `hasMany`)
 - `relationshipName`: The name of the relationship
 - `abort`: Abort callback
- `afterGetRelationship(model, relationshipType, relationshipName, data)`
 - `model`: The model
 - `relationshipType`: The name of the relationship type (`belongsTo`, `hasOne`, `hasMany`)
 - `relationshipName`: The name of the relationship
 - `abort`: Abort callback

### Repository

- `beforeFind(repository, data, abort)`
 - `repository`: The model
 - `data`: Object that holds a criteria property that can be modified and will be used in the search
 - `abort`: Abort callback
- `afterFind(repository, model)`
 - `repository`: The model
 - `model`: The resulting model from the search (or null if nothing found);
- `beforeFindAll(repository, data, abort)`
 - `repository`: The model
 - `data`: Object that holds a criteria property that can be modified and will be used in the search
 - `abort`: Abort callback
- `afterFindAll(resporitory, models)`
 - `repository`: The model
 - `models`: The resulting array of models from the search (or null if nothing found);

Hooks call also be applied to specific model instances.

## Plugin System

The plugin system is very simple and designed as a convenience feature.

Both models and repository have a method called `plugin()`.  This has 2 parameters, the first is the plugin function and the second are options for the plugin if they are needed.  Plugins can add functionlity in 2 way, directly extending the object and added a hook (or sometimes both).

Within the plugin function, the `this` keywords will reference the object that called `.plugin()`, so for example:

```javascript
model.plugin(function() {
  //this === userModel
});
```

Within the plugin function, the first way to add functionality is by directly extending the object:

```javascript
model.plugin(function() {
  this.doSomething = function() {
    //whatever this function needs to do
  }
});
```

Now all instances of the user model will have the `doSomething()` method.

The second way is to use the hook system which is details above:

```javascript
model.plugin(function() {
  this.hook('beforeSave[doSomething]', function(model, saveType, abort) {
    //whatever this hook needs to do
  }
});
```

Plugins call also be applied to specific model instances.

Take a look at the plugins below for examples of the structure of plugins.

## Plugins

These are the following available plugins:

### Official

- [Find By Primary Key](https://github.com/simple-orm/find-by-primary-key) - Add support for just passing a single valued primary key to the repository's `find()` method.
- [Validate](https://github.com/simple-orm/validate) - Adds data validation to models.
- [Relationship Memory Cache](https://github.com/simple-orm/relationship-memory-cache) - Cache relationship data per model in memory

### Others

N/A

# LICENSE

MIT
