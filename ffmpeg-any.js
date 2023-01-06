#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { format } from 'util';

import minimist from 'minimist';
import chalk from 'chalk';

import { Powershell, Batchfile } from './script-output.js';

const SUPPORTED_EXTENSIONS = /\.(webm|mkv|wmv|flv|m4v|mov|mpg|ts|avi|rm)$/i;

let deleteSource = false,                   // Delete source files?
    ffmpegCommand = '-codec copy',          // Default ffmpeg command
    outputScriptFilename = 'run-ffmpeg',    // Output script filename
    outputScriptType = 'powershell',        // Output script extensions (default is powershell)
    outputExtension = 'mp4',                // Default output extension
    subDirectoryMode = false,               // Should process subdirectories as well?
    filesCounter = 0;                       // Files processed counter

const argv = minimist(process.argv.slice(2));

let scriptOutput = new Powershell();

// Command line options
if (argv['delete-source'] === true || argv['delete-source'] === 'true') {
    logWarn('Deleting source files.');
    deleteSource = true;
}
if (argv['command'] && argv['command'] !== '') {
    logInfo('Running command: "' + argv['command'] + '"');
    ffmpegCommand = argv['command'];

} else {
    logInfo('No ffmpeg command specified, using "-codec copy"');
}
if (argv['out'] && argv['out'] !== '') {
    logInfo('Output extension is: "' + argv['out'] + '"');
    outputExtension = argv['out'];

} else {
    logInfo('No output extension specified, using "mp4"');
}
if (argv['sub'] === true) {
    logInfo('Subdirectories mode.');
    subDirectoryMode = true;
}
if (argv['batchfile'] === true) {
    logInfo('Output set to batchfile');
    outputScriptType = 'batch';
    scriptOutput = new Batchfile();
}

// Read current dir
const cwd = process.cwd();
const files = readSupportedFilesSync(cwd);

if (subDirectoryMode === false) {
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

// Log file count
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

        if (deleteSource === true) {
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

            if (deleteSource === true) {
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
    if (new RegExp('\.' + outputExtension + '$', 'i').test(input)) {
        // TODO: Expand support here
        outputName += '_1';
    }

    // Different extension
    return format('"%s.%s"', outputName, outputExtension);
}

function ffmpegGetCommand(input) {
    let c = ['ffmpeg -hide_banner -i'];

    let outputName = getOutputFilename(input);

    c.push(quote(input)); // Input
    c.push(ffmpegCommand); // ffmpeg command string
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
