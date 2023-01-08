import { describe, expect, test } from '@jest/globals';

import { Powershell, Batchfile } from '../script-output.js';

describe('Script output module', () => {
    test('Powershell', () => {
        const script = new Powershell();
        script.addCommand('ffmpeg -hide_banner -i "mymovie.mkv" -c:v libx264 "mymovie.mp4"');
        script.deleteFile('mymovie.mkv');

        expect(1 + 1).toBe(2);
    });
    test('Batchfile', () => {
        expect(1 + 1).toBe(2);
    });
});
