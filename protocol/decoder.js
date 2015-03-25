/**
 * EPMD protocol decoder
 *
 * @see http://www.erlang.org/doc/apps/erts/erl_dist_protocol.html
 */
"use strict";

let constants = require('./constants');

class DecoderError extends Error{
  constructor(message) {
    this.name = 'DecoderError';
    this.message = message;
  }
}

/**
 * Decodes a buffer
 *
 * +----+------+----+
 * |1   |1     |N   |
 * +----------------+
 * |Code|Result|Data|
 * +----+------+----+
 *
 * @param {Buffer} buf
 * @throws DecoderError
 * @returns {{code: number, data: *} | []}
 */
exports.decode = function decode(buf) {
  let code = buf.readUInt8(0);
  switch(code) {
    case constants.ALIVE_RESP:
      return decodeAliveResponse(buf);
    case constants.PORT2_RESP:
      return decodePortResponse(buf);
    default:
      return decodeNodeInfo(buf);
  }
};

/**
 * Decodes ALIVE_RESP
 *
 * +---+------+--------+
 * |1  |1     |2       |
 * +-------------------+
 * |121|Result|Creation|
 * +---+------+--------+
 *
 * @param {Buffer} buf
 * @returns {{code: number, data: {creation: Buffer}}}
 */
function decodeAliveResponse(buf) {
  let result = buf.readUInt8(1);
  if(result > 0) {
    throw new DecoderError("EPMD returned an error. Result: '" + result + "'")
  }

  return {
    code: constants.ALIVE_RESP,
    data: {
      creation: buf.slice(2)
    }
  };
}

/**
 * Decodes PORT2_RESP
 *
 * +---+------+------+--------+--------+--------------+-------------+----+--------+----+-----+
 * | 1 |1     |2     |1       |1       |2             |2            |2   |Nlen    |2   |Elen |
 * +-----------------------------------------------------------------------------------------+
 * |119|Result|PortNo|NodeType|Protocol|HighestVersion|LowestVersion|Nlen|NodeName|Elen|Extra|
 * +---+------+------+--------+--------+--------------+-------------+----+--------+----+-----+
 *
 * @param {Buffer} buf
 * @throws DecoderError
 * @returns {{code: number, data: {port: *, nodeName: (string|*), extra: Buffer}}}
 */
function decodePortResponse(buf) {
  let result = buf.readUInt8(1);
  if(result > 0) {
    throw new DecoderError("EPMD returned an error. Result: '" + result + "'")
  }

  let offset = 2;
  let portNo = buf.readUInt16BE(offset);
  offset += 2;
  let nodeType = buf.readUInt8(offset);
  offset += 1;
  let protocol = buf.readUInt8(offset);
  offset += 1;
  let highestVersion = buf.readUInt16BE(offset);
  offset += 2;
  let lowestVersion = buf.readUInt16BE(offset);
  offset += 2;
  let nodeLength = buf.readUInt16BE(offset);
  offset += 2;
  let nodeName = buf.toString('utf8', offset, offset + nodeLength);
  offset = offset + nodeLength;
  let elen = buf.readUInt16BE(offset);
  offset = offset + 2;
  let extra = buf.slice(offset);

  if(highestVersion < constants.LOWEST_VERSION) {
    throw new DecoderError('Highest protocol version returned lower than our lowest version');
  }
  if(lowestVersion > constants.HIGHEST_VERSION) {
    throw new DecoderError('Lowest protocol version provided higher than our highest version');
  }
  return {
    code: constants.PORT2_RESP,
    data: {
      nodeType: nodeType,
      protocol: protocol,
      port: portNo,
      name: nodeName,
      extra: extra
    }
  };
}

/**
 * Decodes NAMES_RESP/DUMP_RESP
 *
 * +----------+--------+
 * | 4        |        |
 * +-------------------+
 * |EPMDPortNo|NodeInfo|
 * +----------+--------+
 * NodeInfo is a string written for each active node.
 *
 * @param {Buffer} buf
 * @throws DecoderError
 * @returns {[{portNo: number, nodeInfo: string, fd: number|null}]}
 */
function decodeNodeInfo(buf) {
  let lines = buf.toString('utf8', 0).split('\n');
  let nodes = [];
  for(let i = 0, l = lines.length; i < l; i++) {
    let nodeInfo = lines[i].match(constants.NODE_REGEXP);
    if(nodeInfo === null) {
      continue;
    }
    nodes.push({
      name: nodeInfo[1],
      port: parseInt(nodeInfo[2], 10),
      fd: nodeInfo[4] ? parseInt(nodeInfo[4], 10) : null
    });
  }
  return nodes;
}
