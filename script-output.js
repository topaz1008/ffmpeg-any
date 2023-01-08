import { format } from 'util';
import fs from 'fs';
import { EOL } from 'os'

export class Batchfile {
    #commands = [];

    #BATCH_SCRIPT_CONTENT = `%s
:error
exit /b %errorlevel%
`;

    #BATCH_COMMAND_CONTENT = '%s || goto :error';

    addCommand(command) {
        this.#commands.push(format(this.#BATCH_COMMAND_CONTENT, command));
    }

    deleteFile(file) {
        this.#commands.push(format('del "%s"', file));
    }

    writeFileSync(filename) {
        const outputName = format('%s.bat', filename);
        this.deleteFile(outputName);

        let script = this.#commands.join(EOL);
        script = format(this.#BATCH_SCRIPT_CONTENT, script);
        fs.writeFileSync(outputName, script);
    }
}

export class Powershell {
    #commands = [];

    #POWERSHELL_SCRIPT_CONTENT = `function Invoke-Call {
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

    #POWERSHELL_COMMAND_CONTENT = `Invoke-Call -ScriptBlock {
    %s
} -ErrorAction Stop`;

    addCommand(command) {
        this.#commands.push(format(this.#POWERSHELL_COMMAND_CONTENT, command));
    }

    deleteFile(file) {
        this.#commands.push(format('Remove-Item -Force "%s"', file));
    }

    writeFileSync(filename) {
        const outputName = format('%s.ps1', filename);
        this.deleteFile(outputName);

        let script = this.#commands.join(EOL);
        script = format(this.#POWERSHELL_SCRIPT_CONTENT, script);

        fs.writeFileSync(outputName, script);
    }
}
