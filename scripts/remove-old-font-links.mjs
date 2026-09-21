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
let updated = 0;

const criticalPreloads = `
  <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYpHtKgS4.woff2" crossorigin>
  <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7SUc.woff2" crossorigin>
`.trim();

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Remove preconnect to fonts.googleapis or fonts.gstatic
  content = content.replace(/<link\b[^>]*href=["']https:\/\/fonts\.(?:googleapis|gstatic)\.com["'][^>]*>\s*/gi, '');

  // Remove Google Fonts stylesheets
  content = content.replace(/<link\b[^>]*href=["']https:\/\/fonts\.googleapis\.com\/css2[^"']*["'][^>]*>\s*/gi, '');

  // Inject critical font preloads into <head> if not already present
  if (!content.includes('co3bmX5slCNuHLi8bLeY9MK7whWMhyjYpHtKgS4.woff2')) {
    content = content.replace('</head>', `  ${criticalPreloads}\n</head>`);
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    updated++;
  }
}

console.log(`Cleaned up old font links and added preloads on ${updated} pages.`);
