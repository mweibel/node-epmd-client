# node-epmd-client

[EPMD](http://www.erlang.org/doc/man/epmd.html) is the abbreviation for **Erlang Port Mapper Daemon** and
this is a client implementing the [EPMD protocol](http://www.erlang.org/doc/apps/erts/erl_dist_protocol.html).
Using this client, you're able to register yourself as a node on EPMD or you can also find out about
ports Erlang nodes listen on. It doesn't however make it possible to actually connect to an Erlang node,
this is will be implemented as part of another repository.

## Usage

Please have a look in the examples directory.

## License
MIT