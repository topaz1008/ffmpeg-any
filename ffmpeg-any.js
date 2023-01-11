#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { format } from 'util';

import chalk from 'chalk';

import { Options } from './options.js';
import { ScriptFactory } from './script-output.js';

const OUTPUT_FILENAME = 'run-ffmpeg'; // Output script filename (no extension)

const opts = new Options(process.argv);
const script = ScriptFactory.create(opts.outputScriptType);

// Command line options
if (opts.subDirectoryMode === true) {
    logInfo('Subdirectories mode.');
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
if (opts.subDirectoryMode === false) {
    filesCounter = processDirectories([cwd]);

} else {
    const directories = getDirectories(cwd);

    // Process any files in cwd then scan all subdirectories.
    filesCounter = processDirectories([cwd].concat(directories));
}
if (filesCounter > 0) {
    // Log file count and write the file
    logInfo(`Done, processed "${filesCounter}" file(s).`);
    script.writeFileSync(OUTPUT_FILENAME);

} else {
    // Nothing to process, exit.
    logError('No video files to process. exiting...');
}

////////////////
// Functions  //
////////////////
function processDirectories(directories) {
    let processedFiles = 0;

    for (let i = 0; i < directories.length; i++) {
        // For each dir
        const files = readSupportedFilesSync(directories[i]);

        for (let j = 0; j < files.length; j++) {
            // For each file in dir
            const filepath = path.join(directories[i], files[j]);

            script.addCommand(ffmpegGetCommand(filepath));
            processedFiles++;

            if (opts.deleteSource === true) {
                script.deleteFile(filepath);
            }
        }
    }

    return processedFiles;
}

function getDirectories(dir) {
    return fs.readdirSync(dir).map(function (name) {
        return path.join(dir, name);

    }).filter(function (name) {
        return fs.lstatSync(name).isDirectory();
    });
}

function readSupportedFilesSync(dir) {
    return fs.readdirSync(dir).filter(function (filename) {
        return opts.supportedExtensions.test(filename);
    })
}

function getOutputFilename(input) {

    function formatFilename(name, extension) {
        return format('%s.%s', name, extension);
    }

    // Strip extension
    const outputName = input.replace(opts.supportedExtensions, '');

    // Create output filename with new extension
    let result = formatFilename(outputName, opts.outputExtension);

    // If input and output extension is the same we need to
    // change the output filename.
    const extensionRegex = new RegExp(format('\\.%s$', opts.outputExtension), 'i');
    if (extensionRegex.test(input)) {

        let i = 1;
        do {
            // Append (i) to the filename until an available filename is found.
            const newName = `${outputName} (${i})`;
            result = formatFilename(newName, opts.outputExtension);
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
    // TODO: Add logging?
    console.log(msg);
}
