import { describe, expect, test } from '@jest/globals';

describe('Script output module', () => {
    test('Powershell', () => {
        // const script = new PowershellScript();
        // script.addCommand('ffmpeg -hide_banner -i "mymovie.mkv" -c:v libx264 "mymovie.mp4"');
        // script.deleteFile('mymovie.mkv');

        expect(1 + 1).toBe(2);
    });
    test('Batch', () => {
        expect(1 + 1).toBe(2);
    });
    test('Bash', () => {
        expect(1 + 1).toBe(2);
    });
});
