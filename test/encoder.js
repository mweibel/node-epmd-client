/**
 * Encoder tests
 */
"use strict";

let mocha = require('mocha');
let should = require('should');
let describe = mocha.describe;
let it = mocha.it;

let encoder = require('../protocol/encoder');
let constants = require('../protocol/constants');

describe('encoder', function() {
  describe('#requestWrapper()', function() {
    it('should wrap a Buffer with it\'s length', function() {
      let base = new Buffer("test", 'utf8');
      let wrap = encoder.requestWrapper(base);

      wrap.length.should.equal(base.length + 2);
      wrap.readUInt16BE(0).should.equal(base.length);
      wrap.slice(2).toString().should.equal(base.toString());
    });
  });

  describe('#aliveRequest()', function() {
    it('should create a valid ALIVE_REQ', function() {
      let port = 1;
      let nodeName = "testing";
      let nodeLength = Buffer.byteLength(nodeName);
      let req = encoder.aliveRequest(port, nodeName);

      req.length.should.equal(13 + nodeLength);
      req.readUInt8(0).should.equal(constants.ALIVE_REQ);
      req.readUInt16BE(1).should.equal(port);
      req.readUInt8(3).should.equal(constants.NODE_TYPE_NORMAL);
      req.readUInt8(4).should.equal(constants.PROTOCOL_IPV4);
      req.readUInt16BE(5).should.equal(constants.HIGHEST_VERSION);
      req.readUInt16BE(7).should.equal(constants.LOWEST_VERSION);
      req.readUInt16BE(9).should.equal(nodeLength);
      req.toString('utf8', 11, 11 + nodeLength).should.equal(nodeName);
      req.readUInt16BE(11 + nodeLength).should.equal(0);
    });
  });

  describe('#portPleaseRequest()', function() {
    it('should create a valid PORT_PLEASE2_REQ', function() {
      let nodeName = "testing";
      let nodeLength = Buffer.byteLength(nodeName);
      let req = encoder.portPleaseRequest(nodeName);

      req.length.should.equal(1 + nodeLength);
      req.readUInt8(0).should.equal(constants.PORT_PLEASE2_REQ);
      req.toString('utf8', 1).should.equal(nodeName);
    });
  });

  describe('#namesRequest()', function() {
    it('should create a valid NAMES_REQ', function() {
      let req = encoder.namesRequest();

      req.length.should.equal(1);
      req.readUInt8(0).should.equal(constants.NAMES_REQ);
    })
  });

  describe('#dumpRequest()', function() {
    it('should create a valid DUMP_REQ', function() {
      let req = encoder.dumpRequest();

      req.length.should.equal(1);
      req.readUInt8(0).should.equal(constants.DUMP_REQ);
    });
  });

  describe('#killRequest', function() {
    it('should create a valid KILL_REQ', function() {
      let req = encoder.killRequest();

      req.length.should.equal(1);
      req.readUInt8(0).should.equal(constants.KILL_REQ);
    });
  })
});
