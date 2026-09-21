import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteDir = path.resolve(__dirname, '..');

async function run() {
  const { chromium } = await import('playwright');
  
  const browser = await chromium.launch({ channel: 'msedge' });
  const context = await browser.newContext();

  const outDir = path.join(siteDir, 'perf', 'after');
  fs.mkdirSync(outDir, { recursive: true });

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
  const routes = files.map(f => {
    let rel = path.relative(siteDir, f).replace(/\\/g, '/');
    let route = '/' + rel.replace(/index\.html$/, '');
    if (route !== '/' && route.endsWith('/')) {
      // ok
    } else if (route === '/404.html') {
      route = '/404.html';
    }
    return { file: rel, route };
  });

  console.log(`Capturing AFTER metrics and screenshots for ${routes.length} routes...`);

  const metrics = [];

  for (const r of routes) {
    const slug = (r.route === '/' ? 'home' : r.route.replace(/^\/|\/$/g, '').replace(/\//g, '_'));
    console.log(`Capturing after: ${r.route} (${slug})`);

    // Desktop: use ?desktop=1 to prevent mobile redirect during screenshot capture
    const pageDesktop = await context.newPage();
    await pageDesktop.setViewportSize({ width: 1280, height: 800 });
    let totalBytes = 0;
    let requestCount = 0;

    pageDesktop.on('response', async (res) => {
      requestCount++;
      try {
        const buf = await res.body();
        totalBytes += buf.length;
      } catch (e) {}
    });

    try {
      const targetUrl = `http://localhost:3001${r.route}${r.route.includes('?') ? '&' : '?'}desktop=1`;
      await pageDesktop.goto(targetUrl, { waitUntil: 'load', timeout: 15000 });
      await pageDesktop.waitForTimeout(1000);
      await pageDesktop.screenshot({ path: path.join(outDir, `${slug}-1280.png`), fullPage: true });
    } catch (e) {
      console.warn(`Desktop error on ${r.route}:`, e.message);
    }
    await pageDesktop.close();

    // Mobile
    const pageMobile = await context.newPage();
    await pageMobile.setViewportSize({ width: 390, height: 844 });
    try {
      const targetUrl = `http://localhost:3001${r.route}`;
      await pageMobile.goto(targetUrl, { waitUntil: 'load', timeout: 15000 });
      await pageMobile.waitForTimeout(1000);
      await pageMobile.screenshot({ path: path.join(outDir, `${slug}-390.png`), fullPage: true });
    } catch (e) {
      console.warn(`Mobile error on ${r.route}:`, e.message);
    }
    await pageMobile.close();

    metrics.push({
      route: r.route,
      slug,
      requestCount,
      totalBytes: Math.round(totalBytes / 1024) + ' KB'
    });
  }

  await browser.close();

  fs.writeFileSync(path.join(siteDir, 'perf', 'after_metrics.json'), JSON.stringify(metrics, null, 2));
  console.log('After capture complete!');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
