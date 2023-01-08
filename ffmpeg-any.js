#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { format } from 'util';

import chalk from 'chalk';

import { Options } from './options.js';
import { Powershell, Batchfile } from './script-output.js';

const SUPPORTED_EXTENSIONS = /\.(webm|mkv|wmv|flv|m4v|mov|mpg|ts|avi|rm)$/i,
    OUTPUT_FILENAME = 'run-ffmpeg'; // Output script filename

const opts = new Options(process.argv);
let scriptOutput = new Powershell();
let filesCounter = 0;

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

// Read current dir
const cwd = process.cwd();
const files = readSupportedFilesSync(cwd);

if (opts.subDirectoryMode === false) {
    if (files.length === 0) {
        logError('No video files to process. exiting...');
        process.exit(1);
    }

    processFiles(files);

} else {
    const directories = getDirectories(cwd);
    if (directories.length === 0) {
        logError('No subdirectories exist. exiting...');
        process.exit(1);
    }

    // Process any files in cwd then scan all subdirectories.
    processFiles(files);
    processDirectories(directories);
}

// Log file count and write the file
logInfo(format('Done, processed "%s" files.', filesCounter));

// Delete batch file
batchfile += 'del ' + BATCH_FILENAME + EOL;
batchfile += QUIT_ON_ERROR;

// Finally write the batch file
fs.writeFileSync(getOutputScriptFilename(), batchfile);

////////////////
// Functions  //
////////////////

function processFiles(files) {
    for (let i = 0; i < files.length; i++) {
        scriptOutput.addCommand(ffmpegGetCommand(files[i]));
        filesCounter++;

        if (opts.deleteSource === true) {
            scriptOutput.deleteFile(files[i]);
        }
    }
}

function processDirectories(directories) {
    for (let i = 0; i < directories.length; i++) {
        // For each dir
        const files = readSupportedFilesSync(directories[i]);

        for (let j = 0; j < files.length; j++) {
            // For each file in dir
            const filepath = path.join(directories[i], files[j]);

            scriptOutput.addCommand(ffmpegGetCommand(filepath));
            filesCounter++;

            if (opts.deleteSource === true) {
                scriptOutput.deleteFile(files[j]);
            }
        }
    }
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
        return SUPPORTED_EXTENSIONS.test(filename);
    })
}

function getOutputFilename(input) {
    let outputName = input.replace(SUPPORTED_EXTENSIONS, '');

    // If input and output extension is the same we need to
    // change the output filename.
    if (new RegExp('\.' + opts.outputExtension + '$', 'i').test(input)) {
        // TODO: Expand support here
        outputName += '_1';
    }

    // Different extension
    return format('"%s.%s"', outputName, opts.outputExtension);
}

function ffmpegGetCommand(input) {
    let c = ['ffmpeg -hide_banner -i'];

    let outputName = getOutputFilename(input);

    c.push(quote(input)); // Input
    c.push(opts.ffmpegCommand); // ffmpeg command string
    c.push(outputName); // Output filepath, name and extension

    return c.join(' ');
}

function quote(val) {
    return '"' + val + '"';
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
