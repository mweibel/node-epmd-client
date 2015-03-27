/**
 * EPMD constants
 *
 * @see http://www.erlang.org/doc/apps/erts/erl_dist_protocol.html
 */
"use strict";

exports.KILL_REQ = 107;
exports.DUMP_REQ = 100;
exports.NAMES_REQ = 110;
exports.PORT2_RESP = 119;
exports.ALIVE_REQ = 120;
exports.ALIVE_RESP = 121;
exports.PORT_PLEASE2_REQ = 122;

exports.NODE_TYPE_NORMAL = 77;
exports.NODE_TYPE_HIDDEN = 72;
exports.PROTOCOL_IPV4 = 0;
exports.HIGHEST_VERSION = 5;
exports.LOWEST_VERSION = 5;

exports.NODE_REGEXP = /.*name\s*<?([^>\s]+)>?\s.*at port (\d+)(, fd = (\d+))?.*/i;
