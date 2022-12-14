#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { format } from 'util';
import { EOL } from 'os'

import minimist from 'minimist';
import chalk from 'chalk';

const SUPPORTED_EXTENSIONS = /\.(webm|mkv|wmv|flv|m4v|mov|mpg|ts|avi|mp4)$/i,
    BATCH_FILENAME = 'run-ffmpeg.bat',
    OR_GOTO_ERROR = '|| goto :error',
    QUIT_ON_ERROR = ':error' + EOL +
                    'exit /b %errorlevel%' + EOL;

let deleteSource = false,           // Delete source files?
    ffmpegCommand = '-codec copy',  // Default ffmpeg command
    outputExtension = 'mp4',        // Default output extension
    subDirectoryMode = false,       // Should process subdirectories as well?
    filesCounter = 0;               // Files processed counter

const argv = minimist(process.argv.slice(2));

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

// Read current dir
const cwd = process.cwd();
const files = readSupportedFilesSync(cwd);

let batchfile;
if (subDirectoryMode === false) {
    if (files.length === 0) {
        logError('No video files to process. exiting...');
        process.exit(1);
    }

    batchfile = processFiles(files);

} else {
    const directories = getDirectories(cwd);
    if (directories.length === 0) {
        logError('No subdirectories exist. exiting...');
        process.exit(1);
    }

    // Process any files in cwd then scan all subdirectories.
    batchfile = processFiles(files);
    batchfile += processDirectories(directories);
}

// Log file count
logInfo(format('Done, processed "%s" files.', filesCounter));

// Delete batch file
batchfile += 'del ' + BATCH_FILENAME + EOL;
batchfile += QUIT_ON_ERROR;

// Finally write the batch file
fs.writeFileSync(BATCH_FILENAME, batchfile);

////////////////
// Functions  //
////////////////

function processFiles(files) {
    let content = '';
    for (let i = 0; i < files.length; i++) {
        content += ffmpegGetCommand(files[i]) + EOL;
        filesCounter++;

        if (deleteSource === true) {
            content += deleteFile(files[i]);
        }
    }

    return content;
}

function processDirectories(directories) {
    let content = '';
    for (let i = 0; i < directories.length; i++) {
        // For each dir
        const files = readSupportedFilesSync(directories[i]);

        for (let j = 0; j < files.length; j++) {
            // For each file in dir
            const filepath = path.join(directories[i], files[j]);

            content += ffmpegGetCommand(filepath) + EOL;
            filesCounter++;
            if (deleteSource === true) {
                content += deleteFile(files[j]);
            }
        }
    }

    return content;
}

function deleteFile(file) {
    return 'del ' + quote(file) + ' ' + OR_GOTO_ERROR + EOL;
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
    c.push(OR_GOTO_ERROR); // Or error

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
