import fs from 'fs';
import https from 'https';
import http from 'http';
import path from 'path';

const currentDir = path.join(process.cwd(), "res", "scripts");

try {
    await cleanDirectory(currentDir);

    const release = await fetchUrl("https://forgejo.tail12316.ts.net/api/v1/repos/username/netshare-host-script/releases/latest");

    for (const asset of release.assets) {
        const destPath = path.join(currentDir, asset.name);
        await downloadFile(asset.browser_download_url, destPath);
    }
} catch (error) {
    console.error('Error downloading:', error.message);
}

async function cleanDirectory(dirPath) {
    const files = await fs.promises.readdir(dirPath);
    
    for (const file of files) {
        const filePath = path.join(dirPath, file);

        if (file === "download-latest.mjs") {
            continue;
        }
        
        try {
            await fs.promises.unlink(filePath);
            console.log(`Deleted ${filePath}`);
        } catch (err) {
            console.error(`Error deleting ${filePath}:`, err.message);
        }
    }
}

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, {
            headers: { 'User-Agent': 'Node.js' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function downloadFile(url, destination) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(destination);
        protocol.get(url, (res) => {
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                fs.chmodSync(destination, 0o755);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(destination, () => {});
            reject(err);
        });
    });
}