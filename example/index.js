/**
 * Created by michael on 17.03.15.
 */
"use strict";

let debug = require('debug')('node-epmd-client');
let Server = require('./server');

function getRandom(min, max) {
  return Math.floor((Math.random() * max) + min);
}

debug('initializing');

let s1 = new Server('server1', 'localhost', getRandom(1024, 10024));
let s2 = new Server('server2', 'localhost', getRandom(1024, 10024));

s1.listen();

s2.listen(function() {
  s1.getNode('localhost', 'server2');
  s1.getAllNodes();
});

