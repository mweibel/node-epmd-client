# node-epmd-client

[![Build Status](https://travis-ci.org/mweibel/node-epmd-client.svg)](https://travis-ci.org/mweibel/node-epmd-client)
[![Coverage Status](https://coveralls.io/repos/mweibel/node-epmd-client/badge.svg?branch=master)](https://coveralls.io/r/mweibel/node-epmd-client?branch=master)

[EPMD](http://www.erlang.org/doc/man/epmd.html) is the abbreviation for **Erlang Port Mapper Daemon** and
this is a client implementing the [EPMD protocol](http://www.erlang.org/doc/apps/erts/erl_dist_protocol.html).
Using this client, you're able to register yourself as a node on EPMD or you can also find out about
ports Erlang nodes listen on. It doesn't however make it possible to actually connect to an Erlang node,
this is will be implemented as part of another repository.

## Installation

```
npm install --save epmd-client
```

## Usage

Please have a look in the examples directory.

## License
MIT
