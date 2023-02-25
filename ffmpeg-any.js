#!/usr/bin/env node

import fs, { promises as fss } from 'fs';
import path from 'path';
import { format } from 'util';

import chalk from 'chalk';

import { Options } from './options.js';
import { ScriptFactory } from './script-output.js';

const OUTPUT_FILENAME = 'run-ffmpeg'; // Output script filename (no extension)

const opts = new Options(process.argv);
const script = ScriptFactory.create(opts.outputScriptType);

// Command line options
if (opts.recursive === true) {
    logInfo('Recursive mode.');
}
logInfo(`Script output set to "${opts.outputScriptType}".`);
if (opts.deleteSource === true) {
    logWarn('Deleting source files.');
}
logInfo(`Running command: "${opts.ffmpegCommand}"`);
logInfo(`Output extension is: "${opts.outputExtension}"`);

// Get current working directory (where ffmpeg-any was run from)
const cwd = process.cwd();

let filesCounter;
if (opts.recursive === false) {
    const files = readSupportedFilesSync(cwd);
    filesCounter = processFiles(files);

} else {
    // Convert AsyncGenerator to array
    const files = [];
    for await (const f of walkDirectory(cwd)) {
        files.push(f);
    }

    filesCounter = processFiles(files);
}
if (filesCounter > 0) {
    // Log file count and write the file
    logInfo(`Done, processed "${filesCounter}" file(s).`);
    script.writeFileSync(OUTPUT_FILENAME);

} else {
    // Nothing was processed, exit.
    logWarn('No video files to process. exiting...');
}

////////////////
// Functions  //
////////////////
function processFiles(files) {
    let processedFiles = 0;

    for (let i = 0; i < files.length; i++) {
        // For each file
        const filepath = files[i];
        const filename = path.basename(filepath);
        if (opts.isExcluded(filename)) {
            // If this filename is excluded then skip it
            logWarn(`Skipping file "${filename}", it is excluded`);
            continue;
        }

        script.addCommand(ffmpegGetCommand(filepath));
        processedFiles++;

        if (opts.deleteSource === true) {
            script.deleteFile(filepath);
        }
    }

    return processedFiles;
}

function readSupportedFilesSync(dir) {
    return fs.readdirSync(dir)
        .filter(name => opts.supportedExtensions.test(name));
}

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

function getOutputFilename(input) {

    function formatFilenameWithExtension(name, extension) {
        return format('%s.%s', name, extension);
    }

    // Strip extension
    const outputName = input.replace(opts.supportedExtensions, '');

    // Create output filename with new extension
    let result = formatFilenameWithExtension(outputName, opts.outputExtension);

    // If input and output extension is the same we need to
    // change the output filename.
    const extensionRegex = new RegExp(format('\\.%s$', opts.outputExtension), 'i');
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

function ffmpegGetCommand(input) {
    const c = ['ffmpeg -hide_banner -i'];
    const outputName = getOutputFilename(input);

    // Absolute input file path
    c.push(format('"%s"', input));

    // ffmpeg command string
    c.push(opts.ffmpegCommand);

    // Absolute output filepath, name and extension
    c.push(format('"%s"', outputName));

    return c.join(' ');
}

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
        .replace(' ', ' ');

    console.log(format('[%s] - %s', now, msg));
}
