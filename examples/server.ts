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