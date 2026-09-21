import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteDir = path.resolve(__dirname, '..');

const desktopRedirectScript = `<script>(function(){if(window.innerWidth<768&&!window.location.search.includes('desktop=1')){var p=window.location.pathname;if(p!=='/404.html'&&!p.startsWith('/m/')){window.location.replace('/m'+(p==='/'?'/':p)+window.location.search);}}})();</script>`;

const mobileRedirectScript = `<script>(function(){if(window.innerWidth>=768){var p=window.location.pathname.replace(/^\\/m/,'');window.location.replace((p||'/')+window.location.search);}})();</script>`;

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
let count = 0;

for (const file of files) {
  const rel = path.relative(siteDir, file).replace(/\\/g, '/');
  let content = fs.readFileSync(file, 'utf8');

  // Skip 404.html
  if (rel === '404.html') continue;

  const isMobile = rel.startsWith('m/');

  // Clean old inline redirect scripts if any
  content = content.replace(/<script>\s*\(function\(\)\s*\{[\s\S]*?window\.location\.replace[\s\S]*?\}\)\(\);\s*<\/script>\s*/gi, '');

  if (isMobile) {
    if (content.includes('<head>')) {
      content = content.replace('<head>', `<head>\n  ${mobileRedirectScript}`);
      fs.writeFileSync(file, content, 'utf8');
      count++;
    }
  } else {
    // Desktop page: check if matching mobile version exists
    const mPath = path.join(siteDir, 'm', rel);
    if (fs.existsSync(mPath) || rel === 'index.html') {
      if (content.includes('<head>')) {
        content = content.replace('<head>', `<head>\n  ${desktopRedirectScript}`);
        fs.writeFileSync(file, content, 'utf8');
        count++;
      }
    }
  }
}

console.log(`Injected instant head redirect scripts on ${count} pages.`);
