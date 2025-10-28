# scte104-cli

A complete implementation of the SCTE-104 TCP/IP protocol in Typescript. Supports both client and server, and includes a command line client.

I started this project as a fork of [@/scte104](https://github.com/astronautlabs/scte104) made by **astronautlabs**, so please provide him the credits.

## Summary

This library has the main features of [@/scte104](https://github.com/astronautlabs/scte104) with few improvements (or not 🫣), mostly on the SCTE104 Client and Cli framework.


## Installation

```
npm install scte104-cli -g
scte104-cli --help
```

## Command line interface


### CLI Examples

These are the main examples of what you can do with the cli

```bash

# Send an Init Request with dpi pid index 1000
scte104-cli --host 127.0.0.1 --port 5167 do "init --dpi-pid-index 1000;"

# Send an Init Request, Alive Request, a Splice Start Request and a Splice End Request with dpi pid index 1000 waiting 3 seconds for each opearation
scte104-cli --host 127.0.0.1 --port 5167 do "init --dpi-pid-index 1000; alive --dpi-pid-index 1000; splice --dpi-pid-index 1000 --splice-insert-type 1 --splice-event-id 10; splice --dpi-pid-index 1000 --splice-insert-type 2 --splice-event-id 11;"

# Send continuosly Alive requests each 5 seconds
scte104-cli --host 127.0.0.1 --port 5167 --wait 5000 loop "alive --dpi-pid-index 1000"

```

### Cli Usage

The `scte104-cli` supports two different subcommands, `do` and `loop`.
- `do` perform a sequence of SCTE104 operations without dropping the connection to the target SCTE104 server.
- `loop` perform indefinitely a list of operations. Here to stop the client you will need to send a `Cntrl+C` signal.


```bash
Usage: scte104-cli [options] [command]

Implementation of the SCTE-104 TCP/IP protocol

Options:
  -h, --host <string>        scte104 server address
  -p, --port <number>        scte104 server port (default: "5167")
  --log-level <string>       Log level used by the client code (default: "info")
  --buffer-size <number>     size in bytes used by the client to store incoming data from the TCP socket. It should be greater than the maximum message length in bytes received (default: "100")
  --wait <number>            how many millis the client should wait before performing a scte104 operation (default: "1000")
  --message-number <number>  starting number of the first message sent by the client to the scte104 server. Used to match the received messages from the sent ones (default: "1")
  -V, --version              output the version number
  --help                     display help for command

Commands:
  do <string>                Execute a list of scte104 commands
  loop <string>              Execute in a loop a list of scte104 commands
  help [command]             display help for command
```


#### Do subcommand

```bash
scte104-cli --host 127.0.0.1 do --help
Usage: cli-do [options] [command] <cmds>

Execute a list of scte104 commands. The list of commands must be passed as a string and must be separated using the characer <sep>
e.g: do "init <init-options><sep> alive <alive-options><sep> splice <splice-options><sep>

Options:
  --sep <string>  separator charcter used to split the argument of 'do' string in a list of commands (default: ";")
  -h, --help      display help for command

Commands:
  init <opts>     send a scte104 init message
  alive <opts>    send a scte104 alive message
  splice <opts>   send a scte104 splice message

```

#### Loop subcommand
```bash
scte104-cli --host 127.0.0.1 loop --help
Usage: cli-loop [options] [command] <cmds>

Execute an infinite loop that perform a list of scte104 commands. The list of commands must be passed as a string and must be separated using the characer <sep>
e.g: loop "init <init-options><sep> alive <alive-options><sep> splice <splice-options><sep>"

Options:
  --sep <string>  separator charcter used to split the argument of 'do' string in a list of commands (default: ";")
  -h, --help      display help for command

Commands:
  init <opts>     send a scte104 init message
  alive <opts>    send a scte104 alive message
  splice <opts>   send a scte104 splice message
```

#### Operation argument strings

The arguments string of the SCTE104 operations depends on the type of the operation, all of them have different paramenter.


```bash
# Send an Init Request, then a Splice Request 
e.g: scte104-cli --host 127.0.0.1 do "init --dpi-pid-index 1000; splice --dpi-pid-index 1000;"
```

Here the available parameters for a **Splice Request** :


```bash
scte104-cli --host 127.0.0.1 do splice --help
Usage: cli-do-splice [options]

Scte104 parameters for splice request

Options:
  --dpi-pid-index <number>       Dpi pid index
  --splice-insert-type <number>  Specify the type of the splice: e.g: SPLICE_START_NORMAL: 1, SPLICE_START_IMMEDIATE: 2, SPLICE_END_NORMAL: 3, SPLICE_END_IMMEDIATE: 4, SPLICE_CANCEL: 5 (choices: "1", "2", "3",
                                 "4", "5")
  --splice-event-id <number>     Specify an ID for this splice event. Must be unique when the event is submitted, and remain unique until the event is processed (default: "1")
  --unique-program-id <number>   SHOULD be the unique identifier of the viewing event that this splice event is designated for. (default: "1")
  --pre-roll-time <number>       Specify the pre-roll time for this splice event in milliseconds. SCTE 104 specifies that pre-roll time SHALL be no less than 4000 millisecond (default: "4000")
  --break-duration <number>      Specify the break duration for this splice in tenths of a seconds (default: "2400")
  --avail-num <number>           Specify which "avail" this splice represents (default: "0")
  --avails-expected <number>     Specify how many "avails" are expected during this event (default: "0")
  --auto-return-flag <number>    Specify that this splice should automatically end without requiring a splice-end event (default: "0")
  --duration <string>            Specify the time duration to add to now (UTC) when creating the splice timestamp payload. The string is following the FFmpeg Time duration syntax: e.g: 00:00:05 (+ 5 seconds ).
                                 Check here https://ffmpeg.org/ffmpeg-utils.html#time-duration-syntax (default: {"seconds":30})
  -h, --help                     display help for command

```


## Client Library

You can use this library to write your own SCTE104 Client and Server.
These Client and Server both follow the [@/scte104](https://github.com/astronautlabs/scte104) logics.


```typescript
import * as SCTE104 from "scte104-cli";
const sleep  = require("sleep-promise");

async function main() {
    let host = '127.0.0.1';
    let port = 5167;
    let dpiPidIndex = 1000;
    const clientConfig = new SCTE104.args.Config({host:host, port:port});
    let client = new SCTE104.Client(clientConfig)

    // connect to the server
    await client.connect(host=host);
    sleep(1000);

    // send an init request
    let initRequestParameters = new SCTE104.args.Init({dpiPidIndex:dpiPidIndex})
    await client.init(initRequestParameters);
    sleep(1000);

    // send a alive request
    let AliveRequestParameters = new SCTE104.args.Alive({dpiPidIndex:dpiPidIndex});
    await client.alive(AliveRequestParameters);
    sleep(1000)

    // send a splice start
    let spliceEventId = 1;
    let SpliceRequestParameters = new SCTE104.args.Splice({dpiPidIndex:dpiPidIndex, spliceInsertType: SCTE104.SPLICE_START_NORMAL, spliceEventId:spliceEventId});
    await client.splice(SpliceRequestParameters);
    sleep(1000)

    // send a splice end
    spliceEventId++;
    SpliceRequestParameters = new SCTE104.args.Splice({dpiPidIndex:dpiPidIndex, spliceInsertType: SCTE104.SPLICE_END_NORMAL, spliceEventId:spliceEventId});
    await client.splice(SpliceRequestParameters);
    sleep(1000)


    // disconnect
    await client.disconnect()
}

main();
```

## Server Library

```typescript
import * as SCTE104 from "scte104-cli";

async function main() {
    let host = '127.0.0.1';
    let port = 5167;
    const serverConfig = new SCTE104.args.Config({host:host, port:port})
    let server = new SCTE104.Server(serverConfig);
 
    // bind default behaviour on message received
    server.messageReceived.subscribe(SCTE104.ServerDefaultCallback, SCTE104.ServerDefaultErrorCallback);

    // put on listen the server
    server.listen(port=port, host=host);
}

main();

```

`ServerDefaultCallback` and `ServerDefaultErrorCallback` are some default callback template that let the server responsive to incoming `Init` `Alive` and `Splice` request. 


Please check `examples` directory for other examples.


## Dependencies

Tested with the following versions

```
node: v20.12.2
npm: 10.5.0
```

Please check the `package.json` for the specific libraries version. Some of them are really important and upgraded version may be not work. Here the critical ones:

```
"@astronautlabs/bitstream": "2.0.2" 
"date-fns": "2.30.0"
"commander": "14.0.1"
```