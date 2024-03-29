#!/usr/bin/env node

import fs, { promises as fss } from 'fs';
import path from 'path';
import { format } from 'util';

import chalk from 'chalk';

import { Options } from './src/options.js';
import { ScriptFactory } from './src/script-output.js';

const OUTPUT_FILENAME = 'run-ffmpeg'; // Output script filename (no extension)

const opts = new Options(process.argv);
const script = ScriptFactory.create(opts.outputScriptType);

// Command line options log
if (opts.recursive) {
    logInfo('Recursive mode.');
}
logInfo(`Script output set to "${opts.outputScriptType}".`);
if (opts.deleteSource) {
    logWarn('Deleting source files.');
}
logInfo(`Running command: "${opts.ffmpegCommand}"`);
logInfo(`Output extension is: "${opts.outputExtension}"`);

// Get current working directory (where ffmpeg-any was run from)
const cwd = process.cwd();

// Execute
let filesCounter;
if (!opts.recursive) {
    filesCounter = processFiles(readSupportedFilesSync(cwd));

} else {
    // Convert AsyncGenerator to array
    const files = [];
    for await (const filename of walkDirectory(cwd)) {
        files.push(filename);
    }

    filesCounter = processFiles(files);
}
if (filesCounter > 0) {
    // Log file count and write the file
    logInfo(`Done, processed "${filesCounter}" file(s).`);
    script.writeScriptFileSync(OUTPUT_FILENAME);

} else {
    // Nothing was processed, exit.
    logWarn('No video files to process. exiting...');
}

/**
 * Where the main logic is.
 * The function receives an array of absolute file paths.
 * and generated the requested script.
 *
 * @param files {string[]}
 * @returns {number}
 */
function processFiles(files) {
    let processedFiles = 0;

    for (let i = 0; i < files.length; i++) {
        // For each file
        const filepath = files[i];
        const filename = path.basename(filepath);
        if (opts.isExcluded(filename)) {
            // If this filename is excluded then skip it
            logWarn(`Skipping file "${filename}" it is excluded`);
            continue;
        }

        script.addCommand(ffmpegGetCommand(filepath));
        processedFiles++;

        if (opts.deleteSource) {
            script.deleteFile(filepath);
        }
    }

    return processedFiles;
}

/**
 * This function is used in the case where --recursive was NOT passed
 * we just read the current working directory and filter the files by extension.
 *
 * @param dir {string}
 * @returns {string[]}
 */
function readSupportedFilesSync(dir) {
    return fs.readdirSync(dir)
        .filter(filename => opts.supportedExtensions.test(filename));
}

/**
 * Recursive directory walk using async generator function
 *
 * @param dir {string}
 * @returns {AsyncGenerator<string>}
 */
async function* walkDirectory(dir) {
    for await (const d of await fss.opendir(dir)) {
        const p = path.join(dir, d.name);
        if (d.isDirectory()) {
            yield* walkDirectory(p);

        } else if (d.isFile() && opts.supportedExtensions.test(p)) {
            yield p;
        }
    }
}

/**
 * Gets or calculates a valid new output filename and path.
 * Also deals with the case where input and output extension is the same
 * thus needing to change the output to a new valid filename.
 *
 * @param input {string}
 * @returns {string}
 */
function getOutputFilename(input) {

    function formatFilenameWithExtension(name, extension) {
        return `${name}.${extension}`;
    }

    // Strip extension
    const outputName = input.replace(opts.supportedExtensions, '');

    // Create output filename with new extension
    let result = formatFilenameWithExtension(outputName, opts.outputExtension);

    // If input and output extension is the same we need to
    // change the output filename.
    const extensionRegex = new RegExp(`\\.${opts.outputExtension}$`, 'i');
    if (extensionRegex.test(input)) {

        let i = 1;
        do {
            // Append (i) to the filename until an available filename is found.
            const newName = `${outputName}_(${i})`;
            result = formatFilenameWithExtension(newName, opts.outputExtension);
            i++;

        } while (fs.existsSync(result));

        // If we get here 'result' will contain a valid new filename,
        // so we can fall through to the return statement below.
    }

    return result;
}

/**
 * Generates the ffmpeg command string for a given input.
 *
 * @param input {string}
 * @returns {string}
 */
function ffmpegGetCommand(input) {
    const cmd = ['ffmpeg -hide_banner -i'];

    // Absolute input file path
    cmd.push(format('"%s"', input));

    // ffmpeg command string
    cmd.push(opts.ffmpegCommand);

    // Absolute output filepath, name and extension
    const outputName = getOutputFilename(input);
    cmd.push(format('"%s"', outputName));

    return cmd.join(' ');
}

// Console log functions for different levels
function logInfo(msg) {
    log(format(chalk.cyan('INFO') + ' - %s', msg));
}

function logWarn(msg) {
    log(format(chalk.yellowBright('WARN') + ' - %s', msg));
}

function logError(msg) {
    log(format(chalk.red('ERROR') + ' - %s', msg));
}

function log(msg) {
    // TODO: Add file logging?
    const now = (new Date()).toLocaleString()
        // No idea where this NNBSP comes from
        .replace(' ', ' ');

    console.log(format('[%s] - %s', now, msg));
}
