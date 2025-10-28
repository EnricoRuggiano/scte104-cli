import 'reflect-metadata';
import { Command, OptionValues } from 'commander';
import * as SCTE104 from '..';
import sleep  = require("sleep-promise");
import { getLogger } from '../logger';
import {connect, run, disconnect, restoreParentOptions, getAllDpiPidIndex} from './program-utils';

let client: SCTE104.Client = null;
let logger = getLogger()

const program = new Command();
program
    .description(`Execute an infinite loop that perform a list of scte104 commands. The list of commands must be passed as a string and must be separated using the characer <sep>\ne.g: loop "init <init-options><sep> alive <alive-options><sep> splice <splice-options><sep>"`)
    .option('--sep <string>', "separator charcter used to split the argument of 'do' string in a list of commands", ";")    
    .argument('<cmds>')
    .hook('preAction', async (cmd) => {
        restoreParentOptions(cmd);
        client = await connect(cmd.opts())
    })
    .action( async function (this: Command, cmds:string) {
        let _cmds : string[] = cmds.split(this.opts().sep).filter(Boolean).map(s=>s.trim()) // <splice ....>;<alive>....;
        let iteration:number = 1;

        let dpiPidIndexList = getAllDpiPidIndex(_cmds, this)
        logger.info(`Before main loop sending the initRequest to all these dpiPidIndex: ${dpiPidIndexList}`)
        for (let dpiPidIndex of dpiPidIndexList)
        {
            await client.init({dpiPidIndex: dpiPidIndex});
            await sleep(this.opts().wait)
        }
        await sleep(this.opts().wait)

        // here we should to all the init request
        while ( true )
        {
            logger.info(`-----------------------`)
            logger.info(`Iteration: ${iteration}`)
            await loop(_cmds, iteration)
            iteration += 1;
            await sleep(this.opts().wait)
        }
    })    
    .hook('postAction', async () => {
        logger.trace('Cleanup stuff after performing the main action')
        await disconnect(client)
    })

const loop = async (_cmds: string[], iteration:number):Promise<void> => {
    // Perform all the commands strings      
    for (let _cmd of _cmds) {
        let _first = _cmd.split(' ')[0].toLocaleLowerCase().trim()
        let argv = _cmd.split(' ')
        try {
            logger.info(`CLIENT] Performing SCTE104 ${_first} operation`)
            logger.debug(`arguments passed: ${argv}`)
            await run(_cmd, client, program, iteration)
        } catch (error) {
            logger.error(`CLIENT] Skipping operation ${_first} because an exception as been caught`)
            logger.error(error)
        }
    }    
}

// empty subcommands that shows the helpers of the commands
program
    .command('init <opts>', "send a scte104 init message", {executableFile: "cli-do-init"})
    .command('alive <opts>', "send a scte104 alive message", {executableFile: "cli-do-alive"})
    .command('splice <opts>', "send a scte104 splice message", {executableFile: "cli-do-splice"})

program.parse(process.argv)    