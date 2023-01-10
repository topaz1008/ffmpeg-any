import { format } from 'util';
import fs from 'fs';
import { EOL } from 'os'

/**
 * Helper class that deals with script types and extensions.
 */
export class ScriptType {
    static #POWERSHELL = 'powershell';
    static #BATCH = 'batch';
    static #BASH = 'bash';

    // These getters make these constants "static const"
    static get POWERSHELL() { return this.#POWERSHELL; }
    static get BATCH() { return this.#BATCH; }
    static get BASH() { return this.#BASH; }

    static getExtension(type) {
        switch (type) {
            case this.POWERSHELL: return 'ps1';
            case this.BATCH: return 'bat';
            case this.BASH: return 'sh';

            default: return ''; // No extension
        }
    }

    static isValid(type) {
        switch (type) {
            case this.POWERSHELL:
            case this.BATCH:
            case this.BASH:
                return true;

            default: return false;
        }
    }
}

/**
 * Script factory create new instances of a script class from a string type.
 */
export class ScriptFactory {
    static create(type) {
        switch (type) {
            case ScriptType.POWERSHELL: return new PowershellScript();
            case ScriptType.BATCH: return new BatchScript();
            case ScriptType.BASH: return new BashScript();

            default: throw new Error(`Invalid script type "${type}"`);
        }
    }
}

/**
 * Base script class, all script types inherit from this class.
 * the extending class MUST implement the following data members.
 *
 * SCRIPT_CONTENT
 *      the template for the entire script, it will wrap the entire list of commands.
 * COMMAND_CONTENT
 *      the template for a single command (e.g. a single ffmpeg command, or a single delete command)
 * DELETE_COMMAND_CONTENT
 *      the template for a delete command.
 *
 * In addition, a super() call must be called with the new type constant passed in the constructor.
 */
class Script {
    type = 'none';
    commands = [];
    SCRIPT_CONTENT = '%s';
    COMMAND_CONTENT = '%s';
    DELETE_COMMAND_CONTENT = '';

    constructor(type) {
        this.type = type;

        return new PowershellScript();
    }

    addCommand(command) {
        this.commands.push(format(this.COMMAND_CONTENT, command));
    }

    deleteFile(filename) {
        this.addCommand(format(this.DELETE_COMMAND_CONTENT, filename));
    }

    writeFileSync(filename) {
        const extension = ScriptType.getExtension(this.type);
        const outputName = format('%s.%s', filename, extension);

        // Delete self (the script)
        this.deleteFile(outputName);

        let script = this.commands.join(EOL);
        script = format(this.SCRIPT_CONTENT, script);

        fs.writeFileSync(outputName, script);
    }
}

class BatchScript extends Script {
    SCRIPT_CONTENT = `%s
:error
exit /b %errorlevel%
`;
    COMMAND_CONTENT = '%s || goto :error';
    DELETE_COMMAND_CONTENT = 'del "%s"';

    constructor() { super(ScriptType.BATCH); }
}

class PowershellScript extends Script {
    SCRIPT_CONTENT = `function Invoke-Call {
    param (
        [scriptblock]$ScriptBlock,
        [string]$ErrorAction = $ErrorActionPreference
    ) & @ScriptBlock
    if (($lastexitcode -ne 0) -and $ErrorAction -eq "Stop") {
        exit $lastexitcode
    }
}

%s
`;
    COMMAND_CONTENT = `Invoke-Call -ScriptBlock {
    %s
} -ErrorAction Stop`;
    DELETE_COMMAND_CONTENT = 'Remove-Item -Force "%s"';

    constructor() { super(ScriptType.POWERSHELL); }
}

class BashScript extends Script {
    // Bash script exit on error is taken from
    // @link https://stackoverflow.com/a/2871034/1572422
    SCRIPT_CONTENT = `!/bin/bash
set -euxo pipefail
%s
`;
    COMMAND_CONTENT = '%s';
    DELETE_COMMAND_CONTENT = 'rm -f "%s"';

    constructor() { super(ScriptType.BASH); }
}
