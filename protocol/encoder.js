/**
 * EPMD protocol encoder
 *
 * @see http://www.erlang.org/doc/apps/erts/erl_dist_protocol.html
 */
"use strict";

let constants = require('./constants');

/**
 * Each request should be preceeded by a two-byte length field.
 *
 * +------+-------+
 * |2     |n      |
 * +--------------+
 * |Length|Request|
 * +------+-------+
 *
 * @param {Buffer} req
 * @returns {Buffer}
 */
function requestWrapper(req) {
  let baseLength = 2;
  let buf = new Buffer(baseLength + req.length);
  buf.writeUInt16BE(req.length, 0);
  req.copy(buf, 2, 0);

  return buf;
}

/**
 * ALIVE_REQ registers a node on EPMD
 *
 * +---+------+--------+--------+--------------+-------------+----+--------+----+-----+
 * |1  |2     |1       |1       |2             |2            |2   |Nlen    |2   |Elen |
 * +----------------------------------------------------------------------------------+
 * |120|PortNo|NodeType|Protocol|HighestVersion|LowestVersion|Nlen|NodeName|Elen|Extra|
 * +---+------+--------+--------+--------------+-------------+----+--------+----+-----+
 *
 *
 * @param {int} port
 * @param {string} nodeName
 * @returns {Buffer}
 */
function aliveRequest(port, nodeName) {
  let nodeLength = Buffer.byteLength(nodeName, 'utf8');
  let baseLength = 13;
  let req = new Buffer(nodeLength + baseLength);

  let offset = 0;
  req.writeUInt8(constants.ALIVE_REQ, offset);
  offset = 1;
  req.writeUInt16BE(port, offset);
  offset = 3;
  req.writeUInt8(constants.NODE_TYPE_NORMAL, offset);
  offset = 4;
  req.writeUInt8(constants.PROTOCOL_IPV4, offset);
  offset = 5;
  req.writeUInt16BE(constants.HIGHEST_VERSION, offset);
  offset = 7;
  req.writeUInt16BE(constants.LOWEST_VERSION, offset);
  offset = 9;
  req.writeUInt16BE(nodeLength, offset);
  offset = 11;
  req.write(nodeName, offset, nodeLength, 'utf8');
  offset = offset + nodeLength;
  // Elen
  req.writeUInt16BE(0, offset);

  return req;
}

/**
 * Request for host/port combination for a node name.
 *
 * +---+--------+
 * | 1 |   N    |
 * +------------+
 * |122|NodeName|
 * +---+--------+
 * Where N = NodeNameLength - 1
 *
 * @param {string} nodeName
 * @returns {Buffer}
 */
function portPleaseRequest(nodeName) {
  let baseLength = 2;
  let nameLength = Buffer.byteLength(nodeName, 'utf8') - 1;
  let req = new Buffer(baseLength + nameLength);
  let offset = 0;
  req.writeUInt8(constants.PORT_PLEASE2_REQ, offset);
  offset = 1;
  req.write(nodeName, offset);
  return req;
}

/**
 * Request for all names in an EPMD node.
 *
 * +---+
 * | 1 |
 * +----
 * |110|
 * +---+
 *
 * @returns {Buffer}
 */
function namesRequest() {
  let req = new Buffer(1);
  req.writeUInt8(constants.NAMES_REQ, 0);
  return req;
}

/**
 * Request for dumping all EPMD data.
 *
 * +---+
 * | 1 |
 * +----
 * |100|
 * +---+
 *
 * @returns {Buffer}
 */
function dumpRequest() {
  let req = new Buffer(1);
  req.writeUInt8(constants.DUMP_REQ, 0);
  return req;
}

/**
 * This request kills EPMD.
 *
 * +---+
 * | 1 |
 * +----
 * |107|
 * +---+
 *
 * @returns {Buffer}
 */
function killRequest() {
  let req = new Buffer(1);
  req.writeUInt8(constants.KILL_REQ, 0);
  return req;
}

module.exports = {
  requestWrapper: requestWrapper,
  aliveRequest: aliveRequest,
  portPleaseRequest: portPleaseRequest,
  namesRequest: namesRequest,
  dumpRequest: dumpRequest,
  killRequest: killRequest
};
