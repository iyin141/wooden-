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
let changedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Remove CDN script
  content = content.replace(/<script\b[^>]*src=["']https:\/\/cdn\.tailwindcss\.com[^"']*["'][^>]*><\/script>\s*/gi, '');

  // 2. Remove inline tailwind.config script block
  content = content.replace(/<script\b[^>]*>[\s\S]*?tailwind\.config\s*=[\s\S]*?<\/script>\s*/gi, '');

  // 3. Ensure <link rel="stylesheet" href="/assets/styles.css"> is present in <head>
  if (!content.includes('/assets/styles.css')) {
    // Insert right after <head> or after meta tags
    if (content.includes('</head>')) {
      content = content.replace('</head>', '  <link rel="stylesheet" href="/assets/styles.css">\n</head>');
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
  }
}

console.log(`Migrated Tailwind CDN to static CSS on ${changedCount} pages.`);
