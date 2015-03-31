/**
 * Use EPMD to register/find nodes on local/remote systems.
 *
 * http://www.erlang.org/doc/man/epmd.html
 */
'use strict';

let net = require('net');
let EventEmitter = require('events').EventEmitter;
let debug = require('debug')('node-epmd:client');
let encoder = require('./protocol/encoder');
let decoder = require('./protocol/decoder');
let constants = require('./protocol/constants');

const TYPE_EVENT_MAP = {};
TYPE_EVENT_MAP[constants.ALIVE_RESP] = 'alive';
TYPE_EVENT_MAP[constants.PORT2_RESP] = 'node';

/**
 * EPMD Client for javascript
 */
class Client extends EventEmitter {
  /**
   * Creates a new client instance.
   * @param {String} host
   * @param {int} port
   */
  constructor(host, port) {
    this.host = host;
    this.port = port;
  }

  /**
   * Connect to EPMD
   */
  connect() {
    this.client = net.connect({
      host: this.host,
      port: this.port
    }, this._onConnect.bind(this));

    this.client.on('data', this._onData.bind(this));
    this.client.on('end', this._onEnd.bind(this));
  }

  /**
   * Register port/name on EPMD using an ALIVE_REQ message.
   *
   * @param {int} port
   * @param {string} name
   */
  register(port, name) {
    debug('> ALIVE_REQ');
    this._send(encoder.aliveRequest(port, name));
  }

  /**
   * Closes the connection to EPMD
   */
  end() {
    debug('ending connection');
    this.client.end();
  }

  /**
   * Gets the registered name of a node
   *
   * @param {String} name
   */
  getNode(name) {
    debug('> PORT_PLEASE2_REQ');
    this._send(encoder.portPleaseRequest(name));
  }

  /**
   * Gets all registered nodes on EPMD.
   */
  getAllNodes() {
    debug('> NAMES_REQ');
    this._send(encoder.namesRequest());
  }

  /**
   * Dumps all EPMD knows about nodes.
   */
  dumpEpmd() {
    debug('> DUMP_REQ');
    this._send(encoder.dumpRequest());
  }

  /**
   * Kills EPMD - use with caution.
   */
  killEpmd() {
    debug('> KILL_REQ');
    this._send(encoder.killRequest());
  }

  /**
   * Wraps a buffer with the request wrapper and sends it over the wire.
   *
   * @param {Buffer} req
   * @private
   */
  _send(req) {
    let buf = encoder.requestWrapper(req);
    debug('SEND', buf);
    this.client.write(buf);
  }

  /**
   * Handles data sent by EPMD.
   * @param {Buffer} data
   * @private
   */
  _onData(data) {
    debug('RECV', data);

    try {
      let resp = decoder.decode(data);
      if(resp === false) {
        return;
      }
      if(resp.code) {
        debug('< ' + TYPE_EVENT_MAP[resp.code]);
        this.emit(TYPE_EVENT_MAP[resp.code], resp);
        return;
      }
      debug('< NODE INFO');
      this.emit('nodeinfo', resp);
    } catch(e) {
      this.emit('error', e);
    }
  }

  /**
   * Callback for ending a connection
   * @private
   */
  _onEnd() {
    debug('connection ended');
    this.emit('end');
  }

  /**
   * Callback for when the connection is established.
   * @private
   */
  _onConnect() {
    debug('connected');
    this.emit('connect');
  }
}

exports.Client = Client;

/**
 * Gets a node information (name, port) from EPMD.
 *
 * Callback needs to be in the form of:
 * ```
 * function(err, node) {
 * }
 * ```
 *
 * @param {String} host - EPMD Host
 * @param {number} epmdPort - EPMD Port
 * @param {String} name - Target node name
 * @param {Function} cb
 */
exports.getNode = function getNode(host, epmdPort, name, cb) {
  let c = new Client(host, epmdPort);
  c.on('connect', function() {
    c.getNode(name);
  });
  c.on('node', function(node) {
    c.end();
    cb(null, node);
  });
  c.on('error', function(err) {
    c.end();
    cb(err);
  });
  c.connect();
};

/**
 * Gets all nodes which live on a server from EPMD.
 *
 * Callback needs to be in the form of:
 * ```
 * function(err, nodes) {
 * }
 * ```
 *
 * @param {String} host - EPMD Host
 * @param {number} epmdPort - EPMD Port
 * @param {Function} cb
 */
exports.getAllNodes = function getAllNodes(host, epmdPort, cb) {
  let c = new Client(host, epmdPort);
  c.on('connect', function() {
    c.getAllNodes();
  });
  c.on('nodeinfo', function(nodes) {
    c.end();
    cb(null, nodes);
  });
  c.on('error', function(err) {
    c.end();
    cb(err);
  });
  c.connect();
};

/**
 * Dumps all nodes which live on a server from EPMD.
 *
 * Callback needs to be in the form of:
 * ```
 * function(err, nodes) {
 * }
 * ```
 *
 * @param {String} host - EPMD Host
 * @param {number} epmdPort - EPMD Port
 * @param {Function} cb
 */
exports.dumpEpmd = function dumpEpmd(host, epmdPort, cb) {
  let c = new Client(host, epmdPort);
  c.on('connect', function() {
    c.dumpEpmd();
  });
  c.on('nodeinfo', function(nodes) {
    c.end();
    cb(null, nodes);
  });
  c.on('error', function(err) {
    c.end();
    cb(err);
  });
  c.connect();
};
