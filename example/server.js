"use strict";

let net = require('net');
let debug = require('debug')('node-epmd:server');
let Client = require('./../index');

const EPMD_PORT = 4369;

class Server {
  constructor(name, host, port) {
    this.name = name;
    this.host = host;
    this.port = port;
  }

  listen(cb) {
    debug('listen ' + this.name);
    this.server = net.createServer(this._onConnect.bind(this));
    this.server.on('data', this._onData.bind(this));
    this.server.listen(this.port, this.host);

    // setup an epmd client in order to register
    // itself with the name & port
    this.epmdClient = new Client(this.host, EPMD_PORT);

    this.epmdClient.on('connect', function() {
      // register port & name on epmd
      this.epmdClient.register(this.port, this.name);
    }.bind(this));

    this.epmdClient.on('alive', function() {
      // after register succeeds, call callback
      cb && cb();
    });

    // finally connect for real to epmd
    this.epmdClient.connect();
  }

  getNode(host, name) {
    // in order to get the port of another node
    // we need a new connection
    // because on an ALIVE socket you're not supposed to send anything else.
    let c = new Client(host, 4369);

    c.on('connect', function() {
      // get node name as soon as the client has been connected
      c.getNode(name);
    });
    c.on('node', function(node) {
      console.log(node.data.name + ' listens on port ' + node.data.port);

      // connect to the retrieved port
      var sc = net.connect({
        host: host,
        port: node.data.port
      });
      sc.on('connect', function() {
        debug('connected to ' + name);
      });
    });

    c.connect();
  }

  // get all nodes lists all available nodes
  getAllNodes() {
    let c = new Client(this.host, 4369);
    let self = this;
    c.on('connect', function() {
      c.getAllNodes();
    });
    c.on('nodeinfo', function(nodes) {
      console.log(nodes);
    });

    c.connect();
  }

  _onData(data) {
    debug('recv', data);
  }

  _onConnect(c) {
    debug('client connected');
    c.on('end', this._onClientEnd.bind(this));
  }

  _onClientEnd() {
    debug('client disconnected');
  }
}

module.exports = Server;
