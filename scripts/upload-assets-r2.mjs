import { readdir } from 'node:fs/promises';
import { extname, relative } from 'node:path';
import { spawn } from 'node:child_process';

const bucket = 'houtougumi-memorial-assets';
const nataoOnly = process.argv.includes('--natao');
const roots = [
  { directory: new URL('../src/assets/images/fanart/', import.meta.url), prefix: 'fanart/images' },
  { directory: new URL('../src/assets/images/comments/avatars/', import.meta.url), prefix: 'comments/avatars' },
  { directory: new URL('../public/media/fanart/', import.meta.url), prefix: 'fanart/videos' },
];
const contentTypes = new Map([
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.mp4', 'video/mp4'],
]);

const upload = (file, key, contentType) => new Promise((resolve, reject) => {
  const child = spawn('npx', [
    'wrangler', 'r2', 'object', 'put', `${bucket}/${key}`,
    '--remote', '--file', file,
    '--content-type', contentType,
    '--cache-control', 'public, max-age=31536000, immutable',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  let error = '';
  child.stderr.on('data', (chunk) => { error += chunk; });
  child.on('error', reject);
  child.on('close', (code) => code === 0 ? resolve() : reject(new Error(error || `upload failed: ${key}`)));
});

const files = [];
for (const root of roots) {
  for (const entry of await readdir(root.directory, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const file = new URL(entry.name, new URL(`${entry.parentPath}/`, root.directory));
    if (nataoOnly && !file.pathname.includes('/twitter-natao/') && !file.pathname.includes('/fanart/natao/')) continue;
    const contentType = contentTypes.get(extname(entry.name).toLowerCase());
    if (!contentType) throw new Error(`未対応の媒体です: ${file.pathname}`);
    files.push({
      file: file.pathname,
      key: `${root.prefix}/${relative(root.directory.pathname, file.pathname)}`,
      contentType,
    });
  }
}

files.sort((a, b) => a.key.localeCompare(b.key));
let next = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (next < files.length) {
    const index = next++;
    const file = files[index];
    await upload(file.file, file.key, file.contentType);
    console.log(`${index + 1}/${files.length}: ${file.key}`);
  }
}));
