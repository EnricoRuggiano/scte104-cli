
import 'reflect-metadata';
import { Command, OptionValues } from 'commander';
import * as SCTE104 from '..';
import { getLogger } from '../logger';
import {connect, run, disconnect, restoreParentOptions, getAllDpiPidIndex} from './program-utils';

let client: SCTE104.Client = null;
let logger = getLogger()

const program = new Command();
program
    .description(`Execute a list of scte104 commands. The list of commands must be passed as a string and must be separated using the characer <sep>\ne.g: do "init <init-options><sep> alive <alive-options><sep> splice <splice-options><sep>"`)
    .option('--sep <string>', "separator charcter used to split the argument of 'do' string in a list of commands", ";")    
    .argument('<cmds>')
    .hook('preAction', async (cmd) => {
        restoreParentOptions(cmd);
        client = await connect(cmd.opts())
    })
    .action( async function (this: Command, cmds:string) {
        let _cmds : string[] = cmds.split(this.opts().sep).filter(Boolean).map(s=>s.trim()) // <splice ....>;<alive>....;
        for (let _cmd of _cmds) {
            let _first = _cmd.split(' ')[0].toLocaleLowerCase().trim()
            let argv = _cmd.split(' ')
            logger.info(`CLIENT] Performing SCTE104 ${_first} operation`)
            logger.debug(`arguments passed: ${argv}`)
            try {
                await run(_cmd, client, program, 0)
            } catch (error) {
                logger.error(`CLIENT] Skipping operation ${_first} because an exception as been caught`)
                logger.error(error)
            }
        }
    })
    .hook('postAction', async () => {
        logger.trace('Cleanup stuff after performing the main action')
        await disconnect(client)
    })

// empty subcommands that shows the helpers of the commands
program
    .command('init <opts>', "send a scte104 init message")
    .command('alive <opts>', "send a scte104 alive message")
    .command('splice <opts>', "send a scte104 splice message")

program.parse(process.argv)