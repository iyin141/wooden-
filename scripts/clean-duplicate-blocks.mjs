import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteDir = path.resolve(__dirname, '..');

// 1. Remove duplicate MapModalOverlay from index.html
const indexFile = path.join(siteDir, 'index.html');
if (fs.existsSync(indexFile)) {
  let content = fs.readFileSync(indexFile, 'utf8');
  if (content.includes('<!-- BEGIN: MapModalOverlay -->')) {
    content = content.replace(/<!-- BEGIN: MapModalOverlay -->[\s\S]*?<!-- END: MapModalOverlay -->/g, '');
    fs.writeFileSync(indexFile, content, 'utf8');
    console.log('Removed duplicate MapModalOverlay from index.html');
  }
}

// 2. Remove duplicate MapModalMobileOverlay from m/index.html
const mIndexFile = path.join(siteDir, 'm', 'index.html');
if (fs.existsSync(mIndexFile)) {
  let content = fs.readFileSync(mIndexFile, 'utf8');
  if (content.includes('<!-- BEGIN: MapModalMobileOverlay -->')) {
    content = content.replace(/<!-- BEGIN: MapModalMobileOverlay -->[\s\S]*?<!-- END: MapModalMobileOverlay -->/g, '');
    fs.writeFileSync(mIndexFile, content, 'utf8');
    console.log('Removed duplicate MapModalMobileOverlay from m/index.html');
  }
}

// 3. Scan all HTML files for duplicate IDs
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
for (const f of files) {
  const rel = path.relative(siteDir, f);
  const content = fs.readFileSync(f, 'utf8');
  const idMatches = content.matchAll(/\bid=["']([^"']+)["']/gi);
  const seenIds = new Set();
  const duplicates = new Set();
  for (const m of idMatches) {
    const id = m[1];
    if (seenIds.has(id)) {
      duplicates.add(id);
    } else {
      seenIds.add(id);
    }
  }
  if (duplicates.size > 0) {
    console.log(`Duplicate IDs in ${rel}:`, [...duplicates]);
  }
}

console.log('Step 5 duplicate code removal complete!');
