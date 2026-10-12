const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'docs', 'assets', 'emojis');
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const emojis = [
    { name: 'cookie',   char: '🍪' },
    { name: 'soda',     char: '🥤' },
    { name: 'fries',    char: '🍟' },
    { name: 'cake',     char: '🍰' },
    { name: 'donut',    char: '🍩' },
    { name: 'taco',     char: '🌮' },
    { name: 'pizza',    char: '🍕' },
    { name: 'broccoli', char: '🥦' },
    { name: 'chili',    char: '🌶️' },
    { name: 'carrot',   char: '🥕' },
    { name: 'cucumber', char: '🥒' },
    { name: 'onion',    char: '🧅' },
    { name: 'shield',   char: '🛡️' },
    { name: 'star',     char: '⭐' },
    { name: 'magnet',   char: '🧲' },
    { name: 'freeze',   char: '❄️' },
    { name: 'coin',     char: '🪙' },
    { name: 'troll',    char: '🧌' } // Mythological Goblin / Troll emoji in iOS!
];

function downloadEmoji(item) {
    return new Promise((resolve, reject) => {
        const encoded = encodeURIComponent(item.char);
        const url = `https://emojicdn.elk.sh/${encoded}?style=apple`;
        const filePath = path.join(targetDir, `${item.name}.png`);

        https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                https.get(res.headers.location, (redRes) => {
                    saveStream(redRes, filePath, resolve, reject);
                }).on('error', reject);
                return;
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed ${item.name}: ${res.statusCode}`));
            }
            saveStream(res, filePath, resolve, reject);
        }).on('error', reject);
    });
}

function saveStream(stream, filePath, resolve, reject) {
    const file = fs.createWriteStream(filePath);
    stream.pipe(file);
    file.on('finish', () => {
        file.close(() => {
            console.log(`Downloaded ${path.basename(filePath)} (${fs.statSync(filePath).size} bytes)`);
            resolve();
        });
    });
    file.on('error', reject);
}

async function run() {
    console.log('Downloading authentic Apple iOS food emojis...');
    for (const item of emojis) {
        try {
            await downloadEmoji(item);
        } catch (e) {
            console.error('Error downloading', item.name, e.message);
        }
    }
    console.log('Done downloading emojis!');
}

run();
