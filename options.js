import minimist from 'minimist';

export class Options {
    // Output script type
    static SCRIPT_TYPE_POWERSHELL = 'powershell';
    static SCRIPT_TYPE_BATCH = 'batch';

    // Private members
    #deleteSource = false; // Delete source files?
    #ffmpegCommand = '-codec copy'; // Default ffmpeg command
    #outputExtension = 'mp4'; // Default output extension
    #subDirectoryMode = false; // Should process subdirectories as well?
    #outputScriptType = Options.SCRIPT_TYPE_POWERSHELL; // Output script extensions (default is powershell)

    constructor(argv) {
        const options = minimist(argv.slice(2));

        // Set all command line options
        if (this.#isTruthy(options['delete-source'])) {
            this.#deleteSource = true;
        }
        if (this.#isTruthy(options['sub'])) {
            this.#subDirectoryMode = true;
        }
        if (this.#isTruthy(options['batchfile'])) {
            this.#outputScriptType = Options.SCRIPT_TYPE_BATCH;
        }
        if (this.#isNotEmptyString(options['command'])) {
            this.#ffmpegCommand = options['command'];
        }
        if (this.#isNotEmptyString(options['out'])) {
            this.#outputExtension = options['out'];
        }
    }

    // Private helpers
    #isTruthy(v) {
        return (v === true || v === 'true');
    }

    #isNotEmptyString(s) {
        return (typeof s === 'string' && s !== '');
    }

    // Getters
    get deleteSource() { return this.#deleteSource; }
    get ffmpegCommand() { return this.#ffmpegCommand; }
    get outputExtension() { return this.#outputExtension; }
    get subDirectoryMode() {return this.#subDirectoryMode; }
    get outputScriptType() { return this.#outputScriptType; }
}
