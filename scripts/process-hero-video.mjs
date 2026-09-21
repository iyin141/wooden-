import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteDir = path.resolve(__dirname, '..');
const assetsDir = path.join(siteDir, 'assets');
const imgDir = path.join(assetsDir, 'img');
const originalDir = path.join(assetsDir, 'original');

fs.mkdirSync(imgDir, { recursive: true });
fs.mkdirSync(originalDir, { recursive: true });

const srcVideo = path.join(assetsDir, 'hero-video.mp4');
const webVideo = path.join(assetsDir, 'hero-video.web.mp4');
const posterWebp = path.join(imgDir, 'hero-poster.webp');

async function run() {
  if (fs.existsSync(srcVideo)) {
    console.log('Re-encoding hero video with ffmpeg...');
    const args = [
      '-i', srcVideo,
      '-vf', 'scale=-2:720',
      '-c:v', 'libx264',
      '-profile:v', 'main',
      '-pix_fmt', 'yuv420p',
      '-crf', '28',
      '-preset', 'slow',
      '-an',
      '-movflags', '+faststart',
      '-y',
      webVideo
    ];

    const res = spawnSync(ffmpegPath, args, { stdio: 'inherit' });
    if (res.status !== 0) {
      throw new Error(`ffmpeg encoding failed with code ${res.status}`);
    }

    const outStats = fs.statSync(webVideo);
    console.log(`Web video created: ${(outStats.size / 1024 / 1024).toFixed(2)} MB`);

    console.log('Extracting hero poster frame...');
    const posterArgs = [
      '-i', srcVideo,
      '-vframes', '1',
      '-q:v', '2',
      '-y',
      posterWebp
    ];
    spawnSync(ffmpegPath, posterArgs, { stdio: 'inherit' });
    console.log('Poster image created at:', posterWebp);

    // Move raw video to original/
    const destOrig = path.join(originalDir, 'hero-video.mp4');
    if (!fs.existsSync(destOrig)) {
      fs.renameSync(srcVideo, destOrig);
      console.log('Moved original video to assets/original/hero-video.mp4');
    }
  } else {
    console.log('srcVideo does not exist, checking if already moved or converted...');
  }

  // Optimize Logo
  const logoPng = path.join(assetsDir, 'logo.png');
  const logoWebp = path.join(imgDir, 'logo.webp');
  if (fs.existsSync(logoPng)) {
    await sharp(logoPng).webp({ quality: 90 }).toFile(logoWebp);
    console.log('Logo converted to WebP at:', logoWebp);
  }

  // Update HTML files (index.html & m/index.html)
  const homeFiles = [path.join(siteDir, 'index.html'), path.join(siteDir, 'm', 'index.html')];
  for (const hf of homeFiles) {
    if (!fs.existsSync(hf)) continue;
    let content = fs.readFileSync(hf, 'utf8');

    // Update <source src="..."> to hero-video.web.mp4
    content = content.replace(/\/assets\/hero-video\.mp4/g, '/assets/hero-video.web.mp4');

    // Update <video> to include poster="/assets/img/hero-poster.webp"
    content = content.replace(/<video\b([^>]*?)>/gi, (match, attrs) => {
      if (!attrs.includes('poster=')) {
        return `<video ${attrs.trim()} poster="/assets/img/hero-poster.webp">`;
      }
      return match;
    });

    // Inject hero poster preload into <head>
    if (!content.includes('hero-poster.webp')) {
      content = content.replace('</head>', '  <link rel="preload" as="image" href="/assets/img/hero-poster.webp" fetchpriority="high">\n</head>');
    }

    // Update logo <img> tags
    content = content.replace(/<img\b([^>]*?\bsrc=["']\/assets\/logo\.png["'][^>]*?)>/gi, (match, attrs) => {
      let updated = attrs.replace('/assets/logo.png', '/assets/img/logo.webp');
      if (!updated.includes('width=')) {
        updated += ' width="188" height="200"';
      }
      return `<img ${updated.trim()}>`;
    });

    fs.writeFileSync(hf, content, 'utf8');
  }

  console.log('Step 4 hero video and logo processing complete!');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
