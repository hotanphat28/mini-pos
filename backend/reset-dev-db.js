const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, 'data-dev');

if (fs.existsSync(dataDir)) {
    const files = fs.readdirSync(dataDir);
    for (const file of files) {
        if (file.endsWith('.json') && file !== 'features.json') {
            fs.unlinkSync(path.join(dataDir, file));
            console.log(`Deleted: ${file}`);
        }
    }
    console.log('Successfully reset dev database.');
} else {
    console.log('Dev database directory does not exist yet. Nothing to reset.');
}
