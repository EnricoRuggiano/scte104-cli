import * as SCTE104 from '..';
import { program as spliceProgram } from './program-splice';
import { program as aliveProgram }  from './program-alive';
import { program as initProgram }   from './program-init';
import sleep  = require("sleep-promise");
import { getLogger } from '../logger';
import { Command, Option, OptionValues } from 'commander';

export const restoreParentOptions = (cmd:Command, prefix:string='scte104-') => {
    let logger = getLogger();
    let key = prefix+cmd.name()
    _restoreParentOptions(cmd, key);
    logger.debug(`Restoring the following optional parameters from the internal env variable: ${key}`)
    logger.debug(cmd.opts())    
}

export const connect = async (args:SCTE104.args.ConfigArgs) :Promise<SCTE104.Client> => {
    let client = new SCTE104.Client(args)
    await client.connect(args.host, args.port)
    await sleep(args.wait)
    return client
}

export const run_command = async (cmd:string, _args:OptionValues, client:SCTE104.Client, program:Command, iteration:number=0) => { 
    if (!client)
        program.error('client not instanced correctly');
    if (cmd == 'splice') {
        let _splice_args = new SCTE104.args.Splice(_args);
        _splice_args.spliceEventId += iteration;
        await client.splice(_splice_args)
    }
    else if (cmd == "alive")
        await client.alive(new SCTE104.args.Alive(_args))
    else if (cmd == "init")
        await client.init(new SCTE104.args.Init(_args))
    else
        throw Error(`Error command not supported ${cmd}`)
    await sleep(client.wait)
}

export const run = async(cmdstr:string, client:SCTE104.Client, parentProgram:Command, iteration:number=0) => {
    let _first:string = _getCommandStr(cmdstr);
    let _argv:string[] = _getCommandArgv(cmdstr);
    let _program:Command = _availCmd(_first, parentProgram);
    _program.exitOverride((err) => { if (err.exitCode !== 0 ) { throw Error (err.message)}})
    let args:OptionValues = _getArgs(_argv, _program)
    await run_command(_first, args, client, parentProgram, iteration)       
}

export const disconnect = async (client: SCTE104.Client) => {
    if (client)
        await client.disconnect()
}

const _availCmd = (cmd_str:string, program:Command) => {
    let _cmd_str = cmd_str.toLowerCase().trim();
    if (_cmd_str == 'splice')
        return spliceProgram;
    else if (_cmd_str == 'alive')
        return aliveProgram
    else if (_cmd_str == 'init')
        return initProgram
    else 
        throw program.error(`Not valid command ${cmd_str}`)
}

const _getArgs = (args:string[], cmd:Command) => {
    args = [process.argv[1]].concat(args)
    return cmd.parse(args).opts();
}

/**
 * WARNING!!! 
 * This is really bad! I am getting the parent's options parsed using an env variable.
 * To avoid this, I should probably merge all the subcommands in only one file and use 
 * GlobalOptions...    
 * @param command
 */
const _restoreParentOptions = (command:Command, key:string) => {
    let _opts = JSON.parse((String(process.env[key] ?? "{}")))
    for (let [key, value] of Object.entries(_opts)) {
        command.setOptionValue(key, value)
    }
} 


export const getAllDpiPidIndex = (cmds: string[], parentProgram:Command):number[] => {
    let dpiPidIndexList = [];
    for (let _cmd of cmds) {
        let _first:string = _getCommandStr(_cmd)
        let argv:string[] = _getCommandArgv(_cmd);
        let _program:Command = _availCmd(_first, parentProgram);
        _program.exitOverride((err) => { if (err.exitCode !== 0 ) { throw Error (err.message)}})
        let args = _getArgs(argv, _program) as SCTE104.args.InitArgs
        dpiPidIndexList.push(args.dpiPidIndex);        
    }
    // unique
    return dpiPidIndexList.filter((value, index, array) => array.indexOf(value) === index);
}


const _getCommandStr = (cmdstr:string):string => {
    return cmdstr.split(' ')[0].toLocaleLowerCase().trim()
}
const _getCommandArgv = (cmdstr:string):string[] => {
    return cmdstr.split(' ')
}