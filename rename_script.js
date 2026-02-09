const fs = require('fs');
const path = require('path');

const dir = 'd:\\websites\\design1\\images\\ExtractedFrames_2026-02-06_10-07-33';

fs.readdir(dir, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    const jpegFiles = files.filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg'));

    // Custom sort function to handle the format frame_0_MM_FFf.jpeg
    // Example: frame_0_00_1f.jpeg, frame_0_00_12f.jpeg
    // We assume the format is consistently frame_X_YY_ZZf.jpeg where X is min, YY is sec, ZZ is frame
    const sortedFiles = jpegFiles.sort((a, b) => {
        const parseFilename = (name) => {
            // Remove extension
            const base = name.replace(/\.(jpeg|jpg)$/, '');
            const parts = base.split('_');
            // frame, 0, 00, 1f
            // parts[0] = frame
            // parts[1] = 0 (min?)
            // parts[2] = 00 (sec)
            // parts[3] = 1f (frame)

            if (parts.length < 4) return { min: 0, sec: 0, frame: 0 };

            const min = parseInt(parts[1], 10);
            const sec = parseInt(parts[2], 10);
            const frameStr = parts[3].replace('f', '');
            const frame = parseInt(frameStr, 10);

            return { min, sec, frame };
        };

        const tA = parseFilename(a);
        const tB = parseFilename(b);

        if (tA.min !== tB.min) return tA.min - tB.min;
        if (tA.sec !== tB.sec) return tA.sec - tB.sec;
        return tA.frame - tB.frame;
    });

    console.log('Sorting check:');
    console.log('First:', sortedFiles[0]);
    console.log('Last:', sortedFiles[sortedFiles.length - 1]);

    // Renaming
    sortedFiles.forEach((file, index) => {
        const num = (index + 1).toString().padStart(3, '0');
        const newName = `intro_frame_${num}.jpeg`;
        const oldPath = path.join(dir, file);
        const newPath = path.join(dir, newName);

        fs.renameSync(oldPath, newPath);
        console.log(`Renamed ${file} to ${newName}`);
    });
});
