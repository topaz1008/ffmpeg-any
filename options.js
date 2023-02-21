import minimist from 'minimist';

import { ScriptType } from './script-output.js';

export class Options {
    // Private members
    #supportedExtensions = /\.(webm|mkv|wmv|flv|m4v|mov|mpg|mpeg|ts|avi|rm|mp4)$/i;
    #deleteSource = false; // Delete source files?
    #ffmpegCommand = '-codec copy'; // Default ffmpeg command
    #outputExtension = 'mp4'; // Default output extension
    #subDirectoryMode = false; // Should process subdirectories as well?
    #outputScriptType = ScriptType.POWERSHELL; // Script type (default is powershell)
    #exclude = null; // A regex pattern to exclude from processing

    constructor(argv) {
        const options = minimist(argv.slice(2));

        // Set all command line options
        if (this.#isTruthy(options['delete-source'])) {
            this.#deleteSource = true;
        }
        if (this.#isTruthy(options['sub'])) {
            this.#subDirectoryMode = true;
        }

        // Only change the script type if it was passed AND it's valid.
        if (ScriptType.isValid(options['script-type'])) {
            this.#outputScriptType = options['script-type'];
        }

        if (this.#isNotEmptyString(options['command'])) {
            this.#ffmpegCommand = options['command'];
        }
        if (this.#isNotEmptyString(options['out'])) {
            this.#outputExtension = options['out'];
        }
        if (this.#isNotEmptyString(options['extensions'])) {
            const regex = `\\.(${options['extensions']})$`;
            this.#supportedExtensions = new RegExp(regex, 'i');
        }
        if (this.#isNotEmptyString(options['exclude'])) {
            this.#exclude = new RegExp(`${options['exclude']}`, 'i');
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
    get supportedExtensions() {
        return this.#supportedExtensions;
    }

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

    get exclude() {
        return this.#exclude;
    }
}
