'use strict'

let net = require('net')
let debug = require('debug')('node-epmd:server')
let client = require('./../index')

const EPMD_PORT = 4369

class Server {
  constructor (name, host, port) {
    this.name = name
    this.host = host
    this.port = port
  }

  listen (cb) {
    debug('listen ' + this.name)
    this.server = net.createServer(this._onConnect.bind(this))
    this.server.on('data', this._onData.bind(this))
    this.server.listen(this.port, this.host)

    // setup an epmd client in order to register
    // itself with the name & port
    this.epmdClient = new client.Client(this.host, EPMD_PORT)

    this.epmdClient.on('connect', function () {
      // register port & name on epmd
      this.epmdClient.register(this.port, this.name)
    }.bind(this))

    if (cb) {
      this.epmdClient.on('alive', cb)
    }

    // finally connect for real to epmd
    this.epmdClient.connect()
  }

  getNode (host, name) {
    // in order to get the port of another node
    // we need a new connection
    // because on an ALIVE socket you're not supposed to send anything else.
    client.getNode(host, 4369, name, function (err, node) {
      if (err) {
        console.error(err)
        return
      }
      console.log(node.data.name + ' listens on port ' + node.data.port)

      // connect to the retrieved port
      let sc = net.connect({
        host: host,
        port: node.data.port
      })
      sc.on('connect', function () {
        debug('connected to ' + name)
      })
    })
  }

  // get all nodes lists all available nodes
  getAllNodes () {
    client.getAllNodes(this.host, 4369, function (err, nodes) {
      if (err) {
        console.error(err)
        return
      }
      console.log(nodes)
    })
  }

  _onData (data) {
    debug('recv', data)
  }

  _onConnect (c) {
    debug('client connected')
    c.on('end', this._onClientEnd.bind(this))
  }

  _onClientEnd () {
    debug('client disconnected')
  }
}

module.exports = Server
