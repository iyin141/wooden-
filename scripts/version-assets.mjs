import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteDir = path.resolve(__dirname, '..');

function getHash(filePath) {
  if (!fs.existsSync(filePath)) return '1';
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
}

const cssHash = getHash(path.join(siteDir, 'assets', 'styles.css'));
const jsHash = getHash(path.join(siteDir, 'assets', 'site.js'));

console.log(`Computed asset hashes: styles.css?v=${cssHash}, site.js?v=${jsHash}`);

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

const files = getHtmlFiles(siteDir);
let updatedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace styles.css?v=...
  content = content.replace(/(href=["']\/assets\/styles\.css)(?:\?v=[a-zA-Z0-9_-]+)?(["'])/g, `$1?v=${cssHash}$2`);
  
  // Replace site.js?v=...
  content = content.replace(/(src=["']\/assets\/site\.js)(?:\?v=[a-zA-Z0-9_-]+)?(["'])/g, `$1?v=${jsHash}$2`);

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    updatedCount++;
  }
}

console.log(`Updated asset hashes in ${updatedCount} HTML files.`);
