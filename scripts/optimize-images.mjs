import fs from 'fs';
import path from 'path';
import https from 'https';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteDir = path.resolve(__dirname, '..');
const imgDir = path.join(siteDir, 'assets', 'img');

fs.mkdirSync(imgDir, { recursive: true });

function getHtmlFiles(dir) {
  let results = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== 'node_modules' && item.name !== '.git' && item.name !== 'perf') {
        results.push(...getHtmlFiles(full));
      }
    } else if (item.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

function downloadBinary(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return downloadBinary(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve();
      });
      stream.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  const files = getHtmlFiles(siteDir);
  const urlMap = new Map(); // url -> { hash, origFile, webpFile, meta }
  const failedUrls = [];

  // 1. Discover all remote image URLs
  console.log('Discovering remote images...');
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const imgRegex = /<img\b[^>]*\bsrc=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
    let m;
    while ((m = imgRegex.exec(content)) !== null) {
      const url = m[1];
      if (url.includes('googleusercontent.com') || url.includes('unsplash.com')) {
        if (!urlMap.has(url)) {
          const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 10);
          urlMap.set(url, { hash, url });
        }
      }
    }
  }

  console.log(`Found ${urlMap.size} unique remote image URLs.`);

  // 2. Download and convert to WebP
  let count = 0;
  for (const [url, item] of urlMap.entries()) {
    count++;
    const rawPath = path.join(imgDir, `raw_${item.hash}`);
    const webpBase = `img_${item.hash}`;
    const webpPath = path.join(imgDir, `${webpBase}.webp`);

    try {
      if (!fs.existsSync(rawPath) && !fs.existsSync(webpPath)) {
        process.stdout.write(`Downloading [${count}/${urlMap.size}]: ${item.hash}... `);
        await downloadBinary(url, rawPath);
      }

      if (!fs.existsSync(webpPath)) {
        const metadata = await sharp(rawPath).metadata();
        item.width = metadata.width;
        item.height = metadata.height;

        // Create main webp
        await sharp(rawPath)
          .webp({ quality: 82 })
          .toFile(webpPath);

        // Create responsive variants (480w, 800w, 1200w) if original is large enough
        const variants = [];
        for (const w of [480, 800, 1200]) {
          if (metadata.width && metadata.width > w) {
            const varPath = path.join(imgDir, `${webpBase}_${w}w.webp`);
            await sharp(rawPath)
              .resize({ width: w })
              .webp({ quality: 80 })
              .toFile(varPath);
            variants.push({ width: w, file: `/assets/img/${webpBase}_${w}w.webp` });
          }
        }
        item.variants = variants;
        console.log(`converted (${metadata.width}x${metadata.height})`);
      } else {
        const metadata = await sharp(webpPath).metadata();
        item.width = metadata.width;
        item.height = metadata.height;
      }
      item.localUrl = `/assets/img/${webpBase}.webp`;
    } catch (e) {
      console.warn(`Failed image ${url.slice(0, 60)}: ${e.message}`);
      failedUrls.push({ url, error: e.message });
    }
  }

  console.log(`Images processed: ${urlMap.size - failedUrls.length} succeeded, ${failedUrls.length} failed.`);

  // 3. Rewrite HTML files
  console.log('Rewriting HTML img tags...');
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    let imgIndex = 0;
    content = content.replace(/<img\b([^>]*?)>/gi, (match, attrs) => {
      imgIndex++;
      const isAboveTheFold = (imgIndex <= 2);

      // Check src
      const srcMatch = attrs.match(/\bsrc=["']([^"']+)["']/i);
      if (!srcMatch) return match;

      const currentSrc = srcMatch[1];
      const item = urlMap.get(currentSrc);
      if (!item || !item.localUrl) return match;

      let newAttrs = attrs.replace(/\bsrc=["'][^"']+["']/i, `src="${item.localUrl}"`);

      // Set width and height if not already explicitly present
      if (!newAttrs.includes('width=') && item.width) {
        newAttrs += ` width="${item.width}" height="${item.height}"`;
      }

      // Add responsive srcset and sizes if variants exist
      if (item.variants && item.variants.length > 0) {
        const srcSetList = item.variants.map(v => `${v.file} ${v.width}w`);
        srcSetList.push(`${item.localUrl} ${item.width}w`);
        const srcSetAttr = srcSetList.join(', ');
        if (!newAttrs.includes('srcset=')) {
          newAttrs += ` srcset="${srcSetAttr}" sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"`;
        }
      }

      // Clean up existing loading / fetchpriority
      newAttrs = newAttrs.replace(/\s*\bloading=["'][^"']*["']/gi, '');
      newAttrs = newAttrs.replace(/\s*\bfetchpriority=["'][^"']*["']/gi, '');
      newAttrs = newAttrs.replace(/\s*\bdecoding=["'][^"']*["']/gi, '');

      if (isAboveTheFold) {
        newAttrs += ' fetchpriority="high"';
      } else {
        newAttrs += ' loading="lazy" decoding="async"';
      }

      return `<img ${newAttrs.trim()}>`;
    });

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
    }
  }

  fs.writeFileSync(path.join(siteDir, 'perf', 'failed_images.json'), JSON.stringify(failedUrls, null, 2));
  console.log('Image optimization complete!');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
