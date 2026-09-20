const fs = require('fs');
const path = require('path');
const https = require('https');

const binDir = path.join(__dirname, '..', 'bin');
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

// Only download on Linux/Mac (Render, Hostinger, etc.)
if (process.platform !== 'win32') {
  const ytdlpPath = path.join(binDir, 'yt-dlp');

  if (!fs.existsSync(ytdlpPath)) {
    console.log('\u{1F4E5} Downloading yt-dlp for Linux...');

    function downloadFile(url, dest) {
      return new Promise((resolve, reject) => {
        https.get(url, (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            res.resume();
            return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
          }

          if (res.statusCode !== 200) {
            res.resume();
            return reject(new Error(`Download failed with status ${res.statusCode}`));
          }

          const file = fs.createWriteStream(dest);
          res.pipe(file);

          file.on('finish', () => {
            file.close();
            fs.chmodSync(dest, '755');
            console.log('\u2705 yt-dlp successfully downloaded and made executable.');
            resolve();
          });

          file.on('error', (err) => {
            fs.unlinkSync(dest);
            reject(err);
          });
        }).on('error', reject);
      });
    }

    // Download and wait
    downloadFile('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp', ytdlpPath)
      .catch((err) => {
        console.error('\u26A0\uFE0F Failed to download yt-dlp:', err.message);
        console.error('   The server will still start but downloads may not work.');
      });
  } else {
    console.log('\u2705 yt-dlp linux binary already exists.');
  }
} else {
  console.log('\u{1F5A5}\uFE0F Windows environment detected, skipping linux binary download.');
}
