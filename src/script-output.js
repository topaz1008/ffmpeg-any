import fs from 'fs';
import { format } from 'util';
import { EOL } from 'os'

/**
 * Helper class that deals with script types.
 */
export class ScriptType {
    // Static valid script type values
    static #POWERSHELL = 'powershell';
    static #BATCH = 'batch';
    static #BASH = 'bash';
    static #TEXT = 'text';

    constructor() {
        // 'Private' constructor
        throw new Error('ScriptType class is static, it should not be instantiated directly.');
    }

    // These getters make the static constants "public static const"
    static get POWERSHELL() { return this.#POWERSHELL; }
    static get BATCH() { return this.#BATCH; }
    static get BASH() { return this.#BASH; }
    static get TEXT() { return this.#TEXT; }

    static isValid(type) {
        switch (type) {
            case this.POWERSHELL:
            case this.BATCH:
            case this.BASH:
            case this.TEXT:
                return true;

            default: return false;
        }
    }
}

/**
 * Script factory create new instances of a script class from a string type.
 */
export class ScriptFactory {
    constructor() {
        // 'Private' constructor
        throw new Error('ScriptFactory class is static, it should not be instantiated directly.');
    }

    static create(type) {
        switch (type) {
            case ScriptType.POWERSHELL: return new PowershellScript();
            case ScriptType.BATCH: return new BatchScript();
            case ScriptType.BASH: return new BashScript();
            case ScriptType.TEXT: return new TextScript();

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
 * In addition, a getExtension() function MUST be implemented;
 * which returns the extension for the script type.
 */
class Script {
    commands = [];
    SCRIPT_CONTENT = '%s' + EOL;
    COMMAND_CONTENT = '%s';
    DELETE_COMMAND_CONTENT = '';

    addCommand(command) {
        this.commands.push(format(this.COMMAND_CONTENT, command));
    }

    deleteFile(filename) {
        this.addCommand(format(this.DELETE_COMMAND_CONTENT, filename));
    }

    getExtension() {
        return '';
    }

    writeFileSync(filename) {
        const extension = this.getExtension();
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

    getExtension() {
        return 'bat';
    }
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

    getExtension() {
        return 'ps1';
    }
}

class BashScript extends Script {
    // Bash script exit on error is taken from
    // @link https://stackoverflow.com/a/2871034/1572422
    SCRIPT_CONTENT = `#!/bin/bash
set -euxo pipefail
%s
`;
    COMMAND_CONTENT = '%s';
    DELETE_COMMAND_CONTENT = 'rm -f "%s"';

    getExtension() {
        return 'sh';
    }
}

class TextScript extends Script {

    // Default templates data members defined in Script base class are enough

    deleteFile(filename) {
        // we override this function with a no-op
        // delete commands would not make sense in a text file.
    }

    getExtension() {
        return 'txt';
    }
}
