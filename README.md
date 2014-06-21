# Simple ORM

This documentation can also be found [here](http://www.ryanzec.com/project-simple-orm).

Change log can be found [here](https://github.com/simple-orm/core/blob/master/CHANGELOG.md);

FAQ can be found [here](https://github.com/simple-orm/core/wiki).

An ORM for NodeJS.

This ORM is designed to be light weight in the core framework but easily extendable to allow for more advance/specific features to be included.  The main components provided by the core library are:

- Collections
- Repositories
- Models

The main components will provide the basic functionality for creating, retrieving, and saving data.  The core framework will also provide the following:

- System for managing data relationships
- Simple plugin system for repositories and models
- System to allow you to hook into internal functions that the core library executes

If a piece of functionality is not critical to the library to work (like data validation) or could be implemented in multiple ways (like soft deleting a model), then those pieces of functionality will be implemented through plugins.

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

***NOTE: All code examples here will use generator functionality which requires 0.11.x and the `--harmony` flag.  Everything should be possible without generators as the core library just returns promises.***

***NOTE: asterik denotes optional***

## Installation

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

- You tables are plural
- You tables are named with PascalCase
- You columns are naming with camelCase

If your database follows these conventions, you will not have to do a lot of extra configuration to get code working out of the box.  If your database doesn't, this ORM can still be used, you will just have to do a bit more configuration to make it work.  It should work with any naming convention (or lack of) you are working with, you can take a look at [this file](https://github.com/simple-orm/core/blob/master/test/sql/ORM_test.sql) to see what the structure looks like that the non-standard naming convention tests run against.

## Defining Models/Repositories

The ORM works with models and repositories that you define.  Please have a look at the [model definition](#model-definition) and [the data layer expected module.exports format](#datalayercreatebasepath-relativefilepaths) API references for more details.  Let look at a simple data access file (fully commented):

```javascript
//first we grab the orm module
var orm = require('simple-orm');

//next, we create our model object which is something we should never directly interact with, you
//should always interact with repositories and model instances
var model = Object.create(orm.baseModel.create());

//now we define the structure of the model
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

//now then create our repository for the model
var repository = Object.create(orm.baseRepository.create(model));

//finally we export an object with the repository and an optional `finalize` method
module.exports = {
  repository: repository,
  finalize: function(repositories) {
    model.hasMany(repositories.user, {
      through: repositories.userPermissionMap
    });
  }
};
```

Then we create our data layer instance (please have a look at the [data adapter manager](#data-adapter-manager), [creating a data layer](#datalayercreatebasepath-relativefilepaths), and the [data layer](#data-layer) API references):

```javascript
//data-layer.js
module.exports = require('simple-orm').dataLayer.create(__dirname + '/repositories', [
  'user',
  'permission'
]);
```

```javascript
var dataLayerInstance = require('./data-layer').create(
  require('simple-orm').dataAdapterManager.getInstance('instance1')
);
```

Using the simple orm data layer generator require 1 model/repository per file.

## Working With Data

Repositories are the primary why to get models from the data store.  You can take a look at the [criteria object](#criteria-object) and [repositories](#repositories) API references for more details.  Lets take a look at this piece of code (fully commented):

```javascript
//returns a collection of user who's age is 35
var users = yield dataLayer.user.findAll({
  where {
    age: 35
  }
});

//return a model with the id of 123
var user = yield dataLayer.user.find({
  where: {
    id: 123
  }
});

//create a new model instance
var user = dataLayer.user.create();
```

The other way of interacting with data is through model instances.  You can take a look at the [models](#models) API reference for more details.  Lets take a look at this piece of code (fully commented):

```javascript
//saves the user to the data store
yield user.save();

//retrieves a collection of permissions tied to the user
var userPermissions = yield user.getPermissions();

//add a permission to the user
yield user.attachPermissions(createUserPermission);

//removes a permission from the user
yield user.detachPermissions(createUserPermission);
```

## API

### Simple Orm

This simple orm module exposes all the methods/objects needed to build your data layer.

```javascript
var simpleOrm = require('simple-orm');
```

#### collection.create(models)

- `*models (object|[object])`: The model or models for the collection to start of with

Return a new collection.

```javascript
//create empty collection
var collection = simpleOrm.create();

//by model instance
var collection = simpleOrm.create(model);

//by array of model instances
var collection = simpleOrm.create([model1, model2]);
```

#### baseModel.create()

Returns a new model object (which is **not** the same thing as a model instance).

```javascript
var model = simpleOrm.baseModel.create();
```

#### baseModel.globalPlugin(pluginName, pluginFunction, options)

- `pluginName (string)`: String used in hash of global plugins that are stored
- `pluginFunction (function)`: The plugin's function
- `*options (object)`: The plugin's options

This adds a global plugin that all objects created with `baseModel.create()` with have applied to them.  Any object created before the global plugin is added will **not** have the plugin attached.

```javascript
simpleOrm.baseModel.globalPlugin('validate', require('simple-orm-validate'), vaidateOptions);
```

#### baseRepository.create(model)

- `model`: The model this repository is tied to

Returns a new repository object.

```javascript
var repository = simpleOrm.baseRepository.create(model);
```

#### baseRepository.globalPlugin(pluginName, pluginFunction, options)

- `pluginName (string)`: String used in hash of global plugins that are stored
- `pluginFunction (function)`: The plugin's function
- `*options (object)`: The plugin's options

This adds a global plugin that all objects created with `baseRepository.create()` with have applied to them.  Any object created before the global plugin is added will **not** have the plugin attached.

```javascript
simpleOrm.baseRepository.globalPlugin('validate', require('simple-orm-find-by-primary-key'), vaidateOptions);
```

#### dataAdapterManager

This is a singleton object used to manage data adapter instance within your application.

```javascript
simpleOrm.dataAdapterManager;
```

#### dataLayer.create(basePath, relativeFilePaths)

- `basePath (string)`: Base path used in conjunction with the items in the relativeFilePaths
- `relativeFilePaths ([string])`: Array of file paths (relative to the base path) for this data layer to include

Will create an object that exposes all the repository from the includes files.  In expects the file's exports to be an object with the following properties:

- `repository (object)`: The repository that the resulting object will exposed
- `*finalize (function)`: A optional function that is called to finalize any setup.  It is passed all the repositories (allowing you to setup relationships here)

```javascript
var dataLayer = simpleOrm.dataLayer.create(__dirname, [
  'user.js',
  'user-group.js'
]);
```
### Data Layer

The results of a call to `simpleOrm.dataLayer.create()`, this makes it easy to create a multiple instances of a data layer that is tied to different data adapter instances (in order to support transactions).

#### create(dataAdapter)

- `dataAdapter (object)`: Data adapter instance to use for the instance of data layer

Creates an instance of the data layer tied to the passed data adapter instance

```javascript
var dataLayer = simpleOrm.dataLayer.create(__dirname, [
  'user.js',
  'user-group.js'
]);
//assuming instance1 and instance2 are using different mysql connections, each data llayerinstance
//can perform transactional actions and not effect each other
var dataLayer1 = dataLayer.create(simpleOrm.dataAdapterManager.getInstance('instance1'));
var dataLayer2 = dataLayer.create(simpleOrm.dataAdapterManager.getInstance('instance2'));
```

### Data Adapter Manager

In order to use transactions you are going to have to have multiple data adapter instances (because you will need multiple data adpater connections and each data adapter can only have 1 connection) and the data adapter manager is used to help manage your data adapter instances.

#### createInstance(instanceName, dataAdapter, dataAdapterConnection)

- `instanceName (string)`: Instance name to create
- `dataAdapter (object)`: Data adapter module
- `dataAdapterConnection (object)` Data adapter connection to use

This will create a new data adapter instance that can be retrieved later for use.

```javascript
simpleOrm.dataAdapterManager.createInstance('instace1', require('simple-orm-mysql-adapter'), yield require('mysql-pool-connection-manager').getConnection());
```

#### getInstance(instanceName)

- `instanceName (string)`: Instance name to retrieve

This will retrieve a specific data adapter instance.

**Throws as error if the passed an instance name does not exist**

```javascript
var simpleOrm.dataAdapter.getInstance('instance1');
```

#### removeInstance(instanceName)

- `instanceName (string)`: Instance name to remove

This will remove the specified instance including calling the dataAdapterConnection's `releaseConnection()` method.

```javascript
simpleOrm.dataAdapterManager.removeInstance('instance1');
```

#### removeAllInstances()

This will remove all the data adapter instances that are being managed including calling the dataAdapterConnection's `releaseConnection()` method.

```javascript
simpleOrm.dataAdapterManager.removeAllInstances();
```

### Collection

Collections are use to make managing an array of models easier.

#### add(models)

- `models (object|[object])`: One or an array of models or a collection to add

Adds one or more models that are passed.  The parameter can be a single model or an array of models.

```javascript
collection.add(model);

collection.add([
  model1,
  model2
]);

collection.add(yield dataAdapter.user.findAll({
  where: {
    age: 35
  }
}));
```

#### remove(models)

- `models (string|object|[string]|[object])`: One or an array of models to remove (or one of and array of model primary keys to remove)

Removes 1 or more models that matches the passed parameter.

```javascript
collection.remove(1);

collection.remove([
  1,
  2
]);

collection.remove(model);

collection.remove([
  model1,
  model2
]);
```

#### clear()

Removes all models from the collection.

```javascript
collection.clear();
```

#### get(primaryKey)

- `primaryKey (mixed)`: Primary key of the model to get

Returns the model matching the passed primary key.

```javascript
collection.get(1);
```

#### getByIndex(index)

- `index (number)`: Index (0 based) of the model to get

Returns the model matching the passed index.

```javascript
collection.getByIndex(0);
```

#### toJSON(options)

- `*options (object)`: Object of options for the to JSON conversion that is passed to the model's `toJSON()` method

The same thing as the model's `toJSON()` method except does it on all models in the collection.

```javascript
collection.toJSON();
```

#### toJSONWithRelationships(relationships)

- `relationships (string|[string])`: Relationships to retrieve with conversion

The same thing as the model's `toJSONWithRelationships()` method except does it on all models in the collection.

```javascript
collection.toJSONWithRelationship('Permissions');
```

#### toArray()

Returns the collection as a standard JavaScript array.

```javascript
collection.toArray();
```

#### length

The collection object exposes a readonly `length` property that returns the number of models in the collection.

```javascript
var collection = simpleOrm.collection([
  model1,
  model2
]);

var count = collection.length;
//count === 2
```
### Model Definition

The model's `define()` method takes in 4 parameters.

#### Model Name

The first parameter is the name of the model.  This name is expected to be PascalCase and it is used internally when creating methods when assigning relationships to the model.

#### Database Name

The second parameter is the name of the database.  This is used by the data adapter in order to properly identify where the table is stored for the model.

#### Table Name

The third parameter is the name of the table.  This is used by the data adapter in order to properly identify where the data is store for the model.

#### Properties Configuration

The forth parameter is the property configuration.  This is used to map the table columns to the models properties.  This is a key/value object where the key is the property name of the model that can be used to interact with the data and the value is the property's configuration.  The following configurations for properties are used by the core framework:

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
- `excludeJson (boolean)`: Whether or not to exclude this property when converting model to JSON

Please note that you can add any arbitrary property to the configuration.  This is useful so plugins can provide there own configurations per model property if needed (like the [validate plugin](https://github.com/simple-orm/validate) does).

### Models

Models are used to interact with a specific instance of a record.

#### define(modelName, databaseName, tableName, propertyConfiguration)

Explained above.

#### save()

This will save the model to the data store with the data adapter.  This will resolve to `true` if successful or be rejected with the error.

```javascript
var user = yield dataLayer.user.find({
  where: {
    id: 1
  }
});

user.firstName = 'test';

yield user.save();
```

#### remove()

This will remove the model from the data with the data adapter.  This will resolve to `true` if successful or be rejected with the error.  It is also important to note that the model object will still retain the data even after it has been removed from the data store.

```javascript
var user = yield dataLayer.user.find({
  where: {
    id: 1
  }
});

yield user.remove();
```

#### reset()

Reset the models data to it's initial values.

```javascript
var user = yield dataLayer.user.find({
  where: {
    id: 123
  }
});
user.firstName = 'test';

//user.firstName will be reset back to whatever is was when it was loaded from the data store
user.reset();
```

#### toJSON(options)

- `*options (object)`: Object of options for the to JSON conversion, you can have the following:
 - `properties ([string])`: An array of properties that you want converted

This will convert the model to JSON.

```javascript
var user = yield dataLayer.user.find({
  where: {
    id: 1
  }
});

var userJson = user.toJSON();

var userJson = user.toJSON({
  properties: [
    'firstName',
    'lastName'
  ]
})
```

#### toJSONWithRelationships(relationships)

- `*relationships (string|[string])`: Relationships to retrieve with conversion

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
var userJsonWithRelationships = yield user.toJSONWithRelationships(['Permissions']);
```

You can also pass just a parameter list of relationships too:

```javascript
var userJsonWithRelationships = yield user.toJSONWithRelationships('Permissions', 'UserGroups');
```

#### loadData(data, status)

- `data (object)`: Object of data to load
- `*status (string)`: Status to set object to (INTERNAL USE)

This will allow you to pass an object of data and load it into the model.

```javascript
//same thing as
//var user = dataLayer.user.create({
//  firstName: 'Test',
//  lastName: 'User'
//});
var user = dataLayer.user.create();
user.loadData({
  firstName: 'Test',
  lastName: 'User'
});
```

You can also pass a second parameter that will change the status of the model (however this is primary designed for internal use).

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

- `repository (object)`: Repository tied to the relating model
- `options (object)`: Options, describes above

This defines a one-to-one relationship where the model belongs to another model.

```javascript
//now all instances of this model will have a getUser() method
model.belongsTo(repositories.user);
```

#### hasOne(repository, options)

- `repository (object)`: Repository tied to the relating model
- `options (object)`: Options, describes above

This defines a one-to-one relationship where the model owns another model.

```javascript
//now all instances of this model will have a getUserDetail() method
model.hasOne(repositories.userDetail);
```

#### hasMany(repository, options)

- `repository (object)`: Repository tied to the relating model
- `options (object)`: Options, describes above

This can define a one-to-many or many-to-many relationship between models

##### one-to-many

```javascript
//now all instances of this model will have a getUserGroups() method
model.hasMany(repositories.userGroup);
```

##### many-to-many

To define a many-to-many, you must use the `through` option.

```javascript
//now all instances of this model will have a getPermissions(), attachPermissions(), and detachPermissions() methods
model.hasMany(repositories.permissions, {
  through: repositories.userPermissionMap
});
```

#### Managing Relationship Data

When defining a relationship a number of method are automatically added to the model instances (depening on the relationships added).

##### get*() `belongsTo()` `hasOne()` `hasMany()`

Returns a collection of models that are linked to the calling model.

```javascript
yield user.getPermissions();
```

##### attach*(data) `hasMany() with through configured`

- `data (string|object|[string]|[object])`: Model(s) or primary key(s) of models to attach to the model.

Adds data in the data store using the `through` repository in order to add a link between the models.

```javascript
//by primary key
yield user.attachPermissions(1);

//by array of primary keys
yield user.attachPermissions([1, 2]);

//by model
yield user.attachPermissions(permission);

//by array of models
yield user.attachPermissions([permission1, permission2]);

//by collection of models
var collection = simpleOrm.collection([permission1, permission2]);
yield user.attachPermissions(collection);
```

##### detach*(data) `hasMany() with through configured`

- `data (string|object|[string]|[object])`: Model(s) or primary key(s) of models to detach from the model.

Removes data in the data store using the `through` repository in order to remove the link between the models.

```javascript
//by primary key
yield user.detachPermissions(1);

//by array of primary keys
yield user.detachPermissions([1, 2]);

//by model
yield user.detachPermissions(permission);

//by array of models
yield user.detachPermissions([permission1, permission2]);

//by collection of models
var collection = simpleOrm.collection([permission1, permission2]);
yield user.detachPermissions(collection);
```

### Criteria Object

The criteria object is used when searching for data through the repository's `find()` and `findAll()` methods and it can have 2 properties, `where` and `join`.

#### where

The `where` property is an object where the key is the name of the data store property and the value is either the value to validate against which would be an equals comparison or an object.  If you need to do something besides an equals comparison, you can use an object which can have the follow properties:

- `comparison`: The comparison operator to use
- `value`: The value or array of values to check
- `valueType`: This can be set to `'field'` which will skip escaping the value

So if you want to see if something is greater than something you could do:

```javascript
yield dataLayer.user.findAll({
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
yield dataLayer.user.findAll({
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

yield dataLayer.user.findAll({
  where: {
    age: {
      comparison: 'is not null'
    }
  }
});

yield dataLayer.user.findAll({
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

#### join

The `join` property is an array of joining tables done with repositories.  An element in the join array would look like this:

```javascript
yield dataLayer.user.findAll({
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

### Repositories

Repositories are used to interact with a group of data records.

#### create(initialDataObject)

- `*initialDataObject (object)`: Object that will be used to populate the model's initial values

The `create()` method will allow you to create a new instance of the model that is tied to the repository.

```javascript
var newUser = yield dataLayer.user.create({
  firstName: 'Test',
  lastName: 'User'
});
```

#### find(criteria)

- `criteria (object)`: Criteria object (defined above)

The `find()` method will find and return the first model that matches the passed criteria, or null is nothing is found.

```javascript
var user = yield dataLayer.user.find({
  where: {
    id: 1
  }
});
```

#### findAll(criteria)

- `criteria (object)`: Criteria object (defined above)

The `findAll()` method will find and return a collection of models that match that passed criteria, or null if nothing is found.

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

The first parameter is the name of the hook with an identifier wrapped in brackets.  This make is possible to remove certain hook functions from a hook without removing them all with the `removeHook()` method:

```javascript
model.removeHook('beforeSave[test]');
```

The second parameter is the hook function to be executed.

Some hooks will have as their last parameter an `abort` callback.  Calling this within the hook function will prevent the default action from happening.  The `abort` method takes an optional parameter which if given, will be the return value of the original method call:

```javascript
model.hook('beforeSave[test]', function(model, saveType, abort) {
if(/*some condition*/) {
    abort('test');
  }
});

var saveResults = model.save();
// saveResults === 'test'
```

If you call abort without a parameter, false will be returned:

```javascript
model.hook('beforeSave[test]', function(model, saveType, abort) {
  if(/*some condition*/) {
    abort();
  }
});

var saveResults = model.save();
// saveResults === false
```

Calling `abort` will also prevent any other hooks from executing after the hook calling `abort`.

The following hooks are supported:

### Model

#### beforeSave(model, saveType, abort)

- `model`: The model
- `saveType`: Type of save being perform (`insert` or `update')
- `abort`: Abort callback

#### afterSave(model, saveType)

- `model`: The model
- `saveType`: Type of save being perform (`insert` or `update')
- `abort`: Abort callback

#### beforeRemove(model, saveType, abort)

- `model`: The model
- `saveType`: Type of save being perform (`insert` or `update')

#### afterRemove(model, saveType, abort)

- `model`: The model

#### beforeGetRelationship(model, relationshipType, relationshipName, abort)

- `model`: The model
- `relationshipType`: The name of the relationship type (`belongsTo`, `hasOne`, `hasMany`)
- `relationshipName`: The name of the relationship
- `abort`: Abort callback

#### afterGetRelationship(model, relationshipType, relationshipName, data)

- `model`: The model
- `relationshipType`: The name of the relationship type (`belongsTo`, `hasOne`, `hasMany`)
- `relationshipName`: The name of the relationship
- `abort`: Abort callback

#### beforeAttach(model, options, abort)

- `model`: The model
- `options`: Object that holds a `criteria` property that can be modified and will be used in searching for models to attach
- `abort`: Abort callback

#### afterAttach(model)

 - `model`: The model

#### beforeDetach(model, options, abort)

- `model`: The model
- `options`: Object that holds a `criteria` property that can be modified and will be used in searching for models to detach
- `abort`: Abort callback

#### afterDetach(model)

- `model`: The model

### Repository

#### beforeFind(repository, options, abort)

- `repository`: The model
- `options`: Object that holds a `criteria` property that can be modified and will be used in the search
- `abort`: Abort callback

#### afterFind(repository, model)

- `repository`: The model
- `model`: The resulting model from the search (or null if nothing found);

#### beforeFindAll(repository, options, abort)

- `repository`: The model
- `options`: Object that holds a `criteria` property that can be modified and will be used in the search
- `abort`: Abort callback

#### afterFindAll(resporitory, collection)

- `repository`: The model
- `models`: The resulting array of models from the search (or null if nothing found);

### Collection

#### beforeGetByPrimaryKey(collection, options)

- `collection`: The collection
- `options`: Object that holds a `find` property that can be modified and will be used in the search

#### afterGetByPrimaryKey(collection, model)

- `collection`: The collection
- `model`: The model that is being returned

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
