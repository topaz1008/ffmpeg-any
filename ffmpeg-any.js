#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { format } from 'util';

import chalk from 'chalk';

import { Options } from './options.js';
import { Powershell, Batchfile } from './script-output.js';

const OUTPUT_FILENAME = 'run-ffmpeg'; // Output script filename (no extension)
const opts = new Options(process.argv);
let scriptOutput = new Powershell();

// Command line options
if (opts.deleteSource === true) {
    logWarn('Deleting source files.');
}
logInfo(`Running command: "${opts.ffmpegCommand}"`);
logInfo(`Output extension is: "${opts.outputExtension}"`);
if (opts.subDirectoryMode === true) {
    logInfo('Subdirectories mode.');
}
if (opts.outputScriptType === Options.SCRIPT_TYPE_BATCH) {
    logInfo('Output set to batchfile');
    scriptOutput = new Batchfile();
}

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
if (filesCounter === 0) {
    logError('No video files to process. exiting...');
    process.exit(1);
}

// Log file count and write the file
logInfo(format('Done, processed "%s" file(s).', filesCounter));
scriptOutput.writeFileSync(OUTPUT_FILENAME);

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

            scriptOutput.addCommand(ffmpegGetCommand(filepath));
            processedFiles++;

            if (opts.deleteSource === true) {
                scriptOutput.deleteFile(filepath);
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
    let outputName = input.replace(opts.supportedExtensions, '');

    // If input and output extension is the same we need to
    // change the output filename.
    if (new RegExp(format('\.%s$'), 'i').test(input)) {
        // TODO: Expand support here
        outputName += '_1';
    }

    // Different extension
    return format('"%s.%s"', outputName, opts.outputExtension);
}

function ffmpegGetCommand(input) {
    const c = ['ffmpeg -hide_banner -i'];

    const outputName = getOutputFilename(input);

    c.push(format('"%s"', input)); // Input
    c.push(opts.ffmpegCommand); // ffmpeg command string
    c.push(outputName); // Output filepath, name and extension

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
