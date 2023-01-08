import minimist from 'minimist';

export class Options {
    static SCRIPT_TYPE_POWERSHELL = 'powershell';
    static SCRIPT_TYPE_BATCH = 'batch';

    #deleteSource = false; // Delete source files?
    #ffmpegCommand = '-codec copy'; // Default ffmpeg command
    #outputExtension = 'mp4'; // Default output extension
    #subDirectoryMode = false; // Should process subdirectories as well?
    #outputScriptType = Options.SCRIPT_TYPE_POWERSHELL; // Output script extensions (default is powershell)

    constructor(argv) {
        const options = minimist(argv.slice(2));

        // Command line options
        if (options['delete-source'] === true || options['delete-source'] === 'true') {
            this.#deleteSource = true;
        }
        if (options['command'] && options['command'] !== '') {
            this.#ffmpegCommand = argv['command'];
        }
        if (options['out'] && options['out'] !== '') {
            this.#outputExtension = options['out'];
        }
        if (options['sub'] === true) {
            this.#subDirectoryMode = true;
        }
        if (options['batchfile'] === true) {
            this.#outputScriptType = Options.SCRIPT_TYPE_BATCH;
        }
    }

    // Getters
    get deleteSource() {
        return this.#deleteSource;
    }

    get ffmpegCommand() {
        return this.#ffmpegCommand;
    }

    get outputExtension() {
        return this.#outputExtension;
    }

    get subDirectoryMode() {
        return this.#subDirectoryMode;
    }

    get outputScriptType() {
        return this.#outputScriptType;
    }
}
