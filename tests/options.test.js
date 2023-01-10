import { describe, expect, test, jest } from '@jest/globals';

import { Options } from '../options.js';
import { ScriptType } from '../script-output.js';

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
        expect(opts.outputScriptType).toBe(ScriptType.POWERSHELL);
        //expect(opts.supportedExtensions).toBe(/\.(webm|mkv|wmv|flv|m4v|mov|mpg|ts|avi|rm)$/i);
    });
    test('All options', () => {
        const argv = [
            'node path',
            'script path',
            '--command=-c:v libx264',
            '--out',
            'mkv',
            '--sub',
            '--script-type',
            'batch',
            '--delete-source',
            '--extensions=mkv|webm'
        ];

        const opts = new Options(argv);

        expect(opts.deleteSource).toBe(true);
        expect(opts.ffmpegCommand).toBe('-c:v libx264');
        expect(opts.outputExtension).toBe('mkv');
        expect(opts.subDirectoryMode).toBe(true);
        expect(opts.outputScriptType).toBe(ScriptType.BATCH);
        expect(opts.supportedExtensions).toStrictEqual(new RegExp('\\.(mkv|webm)$', 'i'));
    });
    test('Options helpers', () => {
        // TODO: Figure out how to access private functions
        // Implement tests for #isTruthy() and #isNotEmptyString()
    });
});
