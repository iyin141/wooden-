import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteDir = path.resolve(__dirname, '..');

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
const brokenLinks = [];

for (const file of files) {
  const relFile = path.relative(siteDir, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');

  // Check src & href attributes
  const attrRegex = /\b(?:src|href)=["']([^"']+)["']/gi;
  let m;
  while ((m = attrRegex.exec(content)) !== null) {
    let link = m[1].split('?')[0].split('#')[0];
    if (!link || link === 'about:blank' || link.startsWith('http:') || link.startsWith('https:') || link.startsWith('mailto:') || link.startsWith('tel:') || link.startsWith('javascript:') || link.startsWith('#')) {
      continue;
    }

    // Resolve relative or root path
    let targetPath;
    if (link.startsWith('/')) {
      targetPath = path.join(siteDir, link.slice(1));
    } else {
      targetPath = path.join(path.dirname(file), link);
    }

    // If directory, check index.html
    if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
      targetPath = path.join(targetPath, 'index.html');
    }

    if (!fs.existsSync(targetPath)) {
      brokenLinks.push({ file: relFile, link, targetPath });
    }
  }
}

console.log(`Link check complete. Broken links found: ${brokenLinks.length}`);
if (brokenLinks.length > 0) {
  console.log(brokenLinks);
} else {
  console.log('All local links and assets resolved successfully!');
}
