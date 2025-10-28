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