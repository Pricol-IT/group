const fs = require('fs');

const dir = 'd:\\websites\\design1\\images\\ExtractedFrames_2026-02-06_10-07-33';
const outputFile = 'd:\\websites\\design1\\file_list.json';

try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg'));

    const sortedFiles = files.sort((a, b) => {
        const parse = (name) => {
            // frame_0_00_1f.jpeg
            const parts = name.replace(/\.(jpeg|jpg)$/, '').split('_');
            if (parts.length < 4) return { sec: 0, frame: 0 };

            const sec = parseInt(parts[2], 10);
            const frame = parseInt(parts[3].replace('f', ''), 10);
            return { sec, frame };
        };

        const tA = parse(a);
        const tB = parse(b);

        if (tA.sec !== tB.sec) return tA.sec - tB.sec;
        return tA.frame - tB.frame;
    });

    fs.writeFileSync(outputFile, JSON.stringify(sortedFiles, null, 4));
    console.log('Done');

} catch (err) {
    console.error(err);
}
