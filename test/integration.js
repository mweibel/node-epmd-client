/**
 * Integration tests
 *
 * Assumes a running EPMD
 */
'use strict';


let mocha = require('mocha');
let should = require('chai').should();
let describe = mocha.describe;
let it = mocha.it;

let client = require('../');

const HOST = 'localhost';
const EPMD_PORT = 4369;

const TEST_NAME = 'integration-test';
const TEST_PORT = 34564;

describe('integration', function() {
  describe('#register()', function() {
    it('should successfully register itself as a node', function(done) {
      let c = new client.Client(HOST, EPMD_PORT);
      c.on('connect', function() {
        c.register(TEST_PORT, TEST_NAME);
      });
      c.on('alive', function() {
        c.end();
      });
      c.on('end', function() {
        done();
      });
      c.on('error', function(err) {
        should.fail('could not register as a node', err);
      });
      c.connect();
    });
  });

  describe('#getNode()', function() {
    it('should retrieve itself', function(done) {
      let c = new client.Client(HOST, EPMD_PORT);
      c.on('connect', function() {
        c.register(TEST_PORT, TEST_NAME);
      });
      c.on('alive', function() {
        client.getNode(HOST, EPMD_PORT, TEST_NAME, function(err, node) {
          if(err) {
            throw err;
          }
          node.data.name.should.equal(TEST_NAME);
          node.data.port.should.equal(TEST_PORT);
          c.end();
          done();
        });
      });
      c.on('error', function(err) {
        throw err;
      });
      c.connect();
    });
  });

  describe('#getAllNodes()', function() {
    /**
     * Be aware that getAllNodes() is sometimes just not returning what you want.
     * This test may fail at random tries..
     */
    it('should retrieve all running nodes', function(done) {
      let c = new client.Client(HOST, EPMD_PORT);
      c.on('connect', function() {
        c.register(TEST_PORT, TEST_NAME);
      });
      c.on('alive', function() {
        client.getAllNodes(HOST, EPMD_PORT, function(err, nodes) {
          if(err) {
            throw err;
          }
          nodes.length.should.equal(1);
          let node = nodes[0];
          node.name.should.equal(TEST_NAME);
          node.port.should.equal(TEST_PORT);
          should.not.exist(node.fd);
          c.end();
          done();
        });
      });
      c.on('error', function(err) {
        should.fail(err);
        done();
      });
      c.connect();
    });
  });

  describe('#dumpEpmd()', function() {
    /**
     * Be aware that dumpEpmd() is sometimes just not returning what you want.
     * This test may fail at random tries..
     */
    it('should dump all running nodes', function(done) {
      let c = new client.Client(HOST, EPMD_PORT);
      c.on('connect', function() {
        c.register(TEST_PORT, TEST_NAME);
      });
      c.on('alive', function() {
        client.dumpEpmd(HOST, EPMD_PORT, function(err, nodes) {
          if(err) {
            throw err;
          }
          nodes.length.should.equal(1);
          let node = nodes[0];
          node.name.should.equal(TEST_NAME);
          node.port.should.equal(TEST_PORT);
          should.exist(node.fd);
          c.end();
          done();
        });
      });
      c.on('error', function(err) {
        throw err;
      });
      c.connect();
    });
  });
});
