import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteDir = path.resolve(__dirname, '..');
const fontsDir = path.join(siteDir, 'assets', 'fonts');

fs.mkdirSync(fontsDir, { recursive: true });

const fontQueries = [
  'family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400',
  'family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400',
  'family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400',
  'family=Montserrat:wght@200;300;400;500',
  'family=Inter:wght@300;400;500;600',
  'family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
];

const cssUrl = `https://fonts.googleapis.com/css2?${fontQueries.join('&')}&display=swap`;

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
  });
}

function downloadBinary(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return downloadBinary(res.headers.location, dest).then(resolve).catch(reject);
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve();
      });
      stream.on('error', reject);
    });
  });
}

async function run() {
  console.log('Fetching Google Fonts stylesheet definition...');
  const css = await fetchText(cssUrl);

  // We want to download the latin and common blocks
  // Find all font-face blocks
  const blocks = css.split('@font-face');
  let localCss = '';
  let downloadedCount = 0;

  for (const rawBlock of blocks) {
    if (!rawBlock.trim()) continue;
    const block = '@font-face ' + rawBlock;

    // Filter to latin, or blocks without a subset comment, or material symbols
    const urlMatch = block.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/);
    if (!urlMatch) continue;

    const remoteUrl = urlMatch[1];
    const fileName = path.basename(remoteUrl);
    const localDest = path.join(fontsDir, fileName);

    if (!fs.existsSync(localDest)) {
      console.log(`Downloading font: ${fileName}`);
      await downloadBinary(remoteUrl, localDest);
      downloadedCount++;
    }

    // Replace the URL with local path and ensure font-display: swap
    let replacedBlock = block.replace(remoteUrl, `/assets/fonts/${fileName}`);
    if (!replacedBlock.includes('font-display')) {
      replacedBlock = replacedBlock.replace('@font-face {', '@font-face {\n  font-display: swap;');
    }
    localCss += replacedBlock + '\n\n';
  }

  const outputCssPath = path.join(siteDir, 'src', 'fonts.css');
  fs.writeFileSync(outputCssPath, localCss, 'utf8');
  console.log(`Downloaded ${downloadedCount} fonts. Generated ${outputCssPath}`);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
