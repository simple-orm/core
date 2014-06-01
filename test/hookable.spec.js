var hookable = require('../orm/hookable');
var expect = require('chai').expect;
var hookableTest = Object.create(hookable);
var EventEmitter = require('events').EventEmitter;
hookable._emitter = new EventEmitter();
hookable._hooks = {};
hookableTest.test1 = function() {
  this.runHooks('test1', myObject);
};
var myObject;

describe('hookable', function() {
  beforeEach(function() {
    myObject = {
      test1: 1,
      test2: 2
    };
  });

  it('should be able to remove hooks', function*() {
    hookableTest.hook('test1[test]', function(data) {
      data.test1 += 1;
      data.test2 += 1;
    });
    hookableTest.removeHook('test1[test]');

    hookableTest.test1();

    expect(myObject).to.deep.equal({
      test1: 1,
      test2: 2
    });
  });

  it('should be able to apply multiple hooks', function*() {
    hookableTest.hook('test1[test]', function(data) {
      data.test1 += 1;
      data.test2 += 1;
    });
    hookableTest.hook('test1[test2]', function(data) {
      data.test1 += 2;
      data.test2 += 2;
    });

    hookableTest.test1();

    hookableTest.removeHook('test1[test]');
    hookableTest.removeHook('test1[test2]');

    expect(myObject).to.deep.equal({
      test1: 4,
      test2: 5
    });
  });

  it('should run hooks in the order they were added', function*() {
    hookableTest.hook('test1[9]', function(data) {
      data.test1 += '1';
      data.test2 += '1';
    });
    hookableTest.hook('test1[0]', function(data) {
      data.test1 += '2';
      data.test2 += '2';
    });

    hookableTest.test1();

    expect(myObject).to.deep.equal({
      test1: '112',
      test2: '212'
    });
  });
});