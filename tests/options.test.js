import { describe, expect, test, jest } from '@jest/globals';

import { Options } from '../options.js';

describe('Options module', () => {
    test('Default options', () => {
        const argv = [
            'node path',
            'script path'
        ];

        const opts = new Options(argv);

        expect(opts.deleteSource).toBe(false);
        expect(opts.ffmpegCommand).toBe('-codec copy');
        expect(opts.outputExtension).toBe('mp4');
        expect(opts.subDirectoryMode).toBe(false);
        expect(opts.outputScriptType).toBe(Options.SCRIPT_TYPE_POWERSHELL);
    });
    test('All options', () => {
        const argv = [
            'node path',
            'script path',
            '--command=-c:v libx264',
            '--out',
            'mkv',
            '--sub',
            '--batchfile',
            '--delete-source'
        ];

        const opts = new Options(argv);

        expect(opts.deleteSource).toBe(true);
        expect(opts.ffmpegCommand).toBe('-c:v libx264');
        expect(opts.outputExtension).toBe('mkv');
        expect(opts.subDirectoryMode).toBe(true);
        expect(opts.outputScriptType).toBe(Options.SCRIPT_TYPE_BATCH);
    });
    test('Options helpers', () => {
        // TODO: Figure out how to access private functions
        // Implement tests for #isTruthy() and #isNotEmptyString()
    });
});
