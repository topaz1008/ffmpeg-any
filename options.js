import { format } from 'util';

import minimist from 'minimist';

export class Options {
    // Output script type
    static SCRIPT_TYPE_POWERSHELL = 'powershell';
    static SCRIPT_TYPE_BATCH = 'batch';

    // Private members
    #supportedExtensions = /\.(webm|mkv|wmv|flv|m4v|mov|mpg|ts|avi|rm)$/i;
    #deleteSource = false; // Delete source files?
    #ffmpegCommand = '-codec copy'; // Default ffmpeg command
    #outputExtension = 'mp4'; // Default output extension
    #subDirectoryMode = false; // Should process subdirectories as well?
    #outputScriptType = Options.SCRIPT_TYPE_POWERSHELL; // Script type (default is powershell)

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
        if (this.#isNotEmptyString(options['supportedExtensions'])) {
            const regex = format('\.(%s)$', options['supportedExtensions']);
            this.#supportedExtensions = new RegExp(regex, 'i');
        }
    }

    // Private helpers
    #isTruthy(v) {
        return (v === true || v === 'true');
    }

    #isNotEmptyString(s) {
        return (typeof s === 'string' && s !== '');
    }

    // Public getters
    get supportedExtensions() { return this.#supportedExtensions; }
    get deleteSource() { return this.#deleteSource; }
    get ffmpegCommand() { return this.#ffmpegCommand; }
    get outputExtension() { return this.#outputExtension; }
    get subDirectoryMode() {return this.#subDirectoryMode; }
    get outputScriptType() { return this.#outputScriptType; }
}
