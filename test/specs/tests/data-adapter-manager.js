var expect = require('chai').expect;

module.exports = function() {
  it('should throw error if attempt to get an instance that is not already created', function*() {
    var dataAdapterManager = this.dataAdapterManager;
    var err = "Data adapter instance does not exist with name of 'est'"

    expect(function() {
      dataAdapterManager.getInstance('est');
    }).to.throw(err);
  });

  it('should be able to create an instance', function*() {
    expect(this.dataAdapterManager.createInstance(
      'test1',
      require('simple-orm-mysql-adapter'),
      yield require('../../mysql-connection-manager').getConnection()
    )).to.be.ok;
  });

  it('should be be to get an instance that has been created', function*() {
    this.dataAdapterManager.createInstance(
      'test1',
      require('simple-orm-mysql-adapter'),
      yield require('../../mysql-connection-manager').getConnection()
    );

    expect(this.dataAdapterManager.getInstance('test1')).to.be.ok;
  });

  it('should be able to release an instance', function*() {
    this.dataAdapterManager.createInstance(
      'test1',
      require('simple-orm-mysql-adapter'),
      yield require('../../mysql-connection-manager').getConnection()
    );
    this.dataAdapterManager.createInstance(
      'test2',
      require('simple-orm-mysql-adapter'),
      yield require('../../mysql-connection-manager').getConnection()
    );

    var spy1 = this.sinon.spy(this.dataAdapterManager.getInstance('test1'), 'releaseConnection');
    var spy2 = this.sinon.spy(this.dataAdapterManager.getInstance('test2'), 'releaseConnection');
    this.dataAdapterManager.releaseInstance('test1');

    expect(this.dataAdapterManager.getInstance('test2')).to.be.ok;
    expect(spy1).to.have.callCount(1);
    expect(spy2).to.have.callCount(0);
  });

  it('should be able to release all instances', function*() {
    this.dataAdapterManager.createInstance(
      'test1',
      require('simple-orm-mysql-adapter'),
      yield require('../../mysql-connection-manager').getConnection()
    );
    this.dataAdapterManager.createInstance(
      'test2',
      require('simple-orm-mysql-adapter'),
      yield require('../../mysql-connection-manager').getConnection()
    );

    var spy1 = this.sinon.spy(this.dataAdapterManager.getInstance('test1'), 'releaseConnection');
    var spy2 = this.sinon.spy(this.dataAdapterManager.getInstance('test2'), 'releaseConnection');
    this.dataAdapterManager.releaseAllInstances();

    expect(spy1).to.have.callCount(1);
    expect(spy2).to.have.callCount(1);
  });

  it('should be able to create an instance over one that already exists', function*() {
    this.dataAdapterManager.createInstance(
      'test1',
      require('simple-orm-mysql-adapter'),
      yield require('../../mysql-connection-manager').getConnection()
    );

    var spy = this.sinon.spy(this.dataAdapterManager.getInstance('test1'), 'releaseConnection');
    expect(this.dataAdapterManager.createInstance(
      'test1',
      require('simple-orm-mysql-adapter'),
      yield require('../../mysql-connection-manager').getConnection()
    )).to.be.ok;

    expect(spy).to.have.callCount(1);
  });
};
