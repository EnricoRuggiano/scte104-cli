import 'reflect-metadata';
import { describe, before, after } from "razmin";
import * as SCTE104 from "../src";
import { ServerDefaultCallback, ServerDefaultErrorCallback } from '../src/server-default-callback';
const path = require('path');
import { spawn } from 'child_process';

describe("SCTE-104 Client CLI Tests ", async it => {
    let host:string = "127.0.0.1"
    let port:number = 5169

    const cli = (opts=[]) => path.join(__dirname, '..', 'src', 'cli', 'cli.js', ...opts)
    const cmd = (argv:any[]) :string => `node ${cli()} ${argv.join(' ')}`;
      
    const _test = async (argv:any[], timeout:undefined | number = undefined) :Promise<number> => { 
        return new Promise((resolve, reject) => {
            console.log(`Testing: ${cmd(argv)}`)
            const child = spawn('node', [cli(), ...argv], {
                stdio: 'inherit',
                cwd: process.cwd(),
                timeout:timeout
            });

            child.on('close', code => resolve(code));
            child.on('error', err => reject(err));
        });
    };

    let server:SCTE104.Server = null;
    before(async() => {
        server = new SCTE104.Server({host:host, port:port});
        server.messageReceived.subscribe(ServerDefaultCallback, ServerDefaultErrorCallback);
        server.listen(port, host);
    })
    after(async() => {
        await server.close();
    })
    
    it('Helper of main cli', async () => {
        const argv = ["--help"]
        const res = await _test(argv)
        if (res !== 0) { throw Error(`Process exited with code: ${res}`)}
    });

    // do subcommand
    it('Helper of do cli', async () => {
        const argv = ["--host", host, "--port", port, "--log-level", "trace", "do", '', "--help"]
        const res = await _test(argv)
        if (res !== 0) { throw Error(`Process exited with code: ${res}`)}
    });
    it('Helper of do init-cli', async () => {
        const argv = ["--host", host, "--port", port, "do", "init", "--help"]
        const res = await _test(argv)
        if (res !== 0) { throw Error(`Process exited with code: ${res}`)}
    })
    it('Helper of do alive-cli', async () => {
        const argv = ["--host", host, "--port", port, "do", "alive", "--help"]
        const res = await _test(argv)
        if (res !== 0) { throw Error(`Process exited with code: ${res}`)}
    })
    it('Helper of do splice-cli', async () => {
        const argv = ["--host", host, "--port", port, "do", "splice", "--help"]
        const res = await _test(argv)
        if (res !== 0) { throw Error(`Process exited with code: ${res}`)}
    })
    it('cli-do send main scte104', async ()=> {
        const argv = ["--host", host, "--port", port, "--wait", 1000, "do", "init --dpi-pid-index 1000; alive --dpi-pid-index 1000; splice --dpi-pid-index 1000 --splice-insert-type 1; splice --dpi-pid-index 1000 --splice-insert-type 2;"]
        const res = await _test(argv)
        if (res !== 0) { throw Error(`Process exited with code: ${res}`)}
    })

    // // loop subcommand
    it('Helper of loop cli', async () => {
        const argv = ["--host", host, "--port", port, "loop", "--help"]
        const res = await _test(argv)
        if (res !== 0) { throw Error(`Process exited with code: ${res}`)}
    })   
    it('Helper of loop init-cli', async () => {
        const argv = ["--host", host, "--port", port, "loop", "init", "--help"]
        const res = await _test(argv)
        if (res !== 0) { throw Error(`Process exited with code: ${res}`)}
    })
    it('Helper of loop alive-cli', async () => {
        const argv = ["--host", host, "--port", port, "loop", "alive", "--help"]
        const res = await _test(argv)
        if (res !== 0) { throw Error(`Process exited with code: ${res}`)}
    })
    it('Helper of loop splice-cli', async () => {
        const argv = ["--host", host, "--port", port, "loop", "splice", "--help"]
        const res = await _test(argv)
        if (res !== 0) { throw Error(`Process exited with code: ${res}`)}
    })

    it('cli-loop send alive requests in loop', async ()=> {
        const argv = ["--host", host, "--port", port, "--wait", 1000, "loop", "alive --dpi-pid-index 1000;"]
        const timeout = 5000;
        const res = await _test(argv, timeout)
        if (res !== null) { throw Error(`Process exited with code: ${res} while expect to have to null (not endend)`)}
    })

});