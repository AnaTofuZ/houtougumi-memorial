import { createHash } from 'node:crypto';
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';

const idsUrl = new URL('../data/x/natao1212-media-ids.txt', import.meta.url);
const exportUrl = new URL('../data/x/natao1212-media-export.json', import.meta.url);
const reviewUrl = new URL('../data/x/natao1212-fanart-review.json', import.meta.url);
const markdownUrl = new URL('../data/x/natao1212-fanart-review.md', import.meta.url);
const ids = (await readFile(idsUrl, 'utf8')).trim().split(/\s+/);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const request = async (url) => {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(url, { headers: { 'User-Agent': 'houtougumi-memorial fanart review/1.0' } });
    if (response.ok) return response;
    if (attempt === 3) throw new Error(`${response.status}: ${url}`);
    await wait(2_000 * (attempt + 1));
  }
};

const mapLimit = async (items, limit, fn) => {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index], index);
    }
  }));
  return results;
};

let cached = { posts: [] };
try { cached = JSON.parse(await readFile(exportUrl, 'utf8')); } catch {}
const postsById = new Map(cached.posts.map((post) => [post.id, post]));
const missing = ids.filter((id) => !postsById.has(id));

await mapLimit(missing, 4, async (id, index) => {
  const { tweet } = await (await request(`https://api.fxtwitter.com/status/${id}`)).json();
  if (tweet?.author?.screen_name !== 'natao1212') throw new Error(`本人の投稿ではありません: ${id}`);
  postsById.set(id, {
    id,
    sourceUrl: tweet.url,
    postedAt: new Date(tweet.created_at).toISOString(),
    text: tweet.text,
    media: (tweet.media?.all ?? []).map((item) => ({
      type: item.type === 'photo' ? 'image' : 'video',
      id: item.id,
      url: item.url,
      previewUrl: item.type === 'photo' ? item.url : item.thumbnail_url,
    })),
  });
  console.log(`post ${index + 1}/${missing.length}: ${id}`);
});

const posts = ids.map((id) => postsById.get(id)).filter(Boolean).sort((a, b) => a.postedAt.localeCompare(b.postedAt));

const imageFiles = async (directory) => (await readdir(directory, { withFileTypes: true })).flatMap((entry) => {
  const url = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
  return entry.isDirectory() ? [imageFiles(url)] : /\.(avif|gif|jpe?g|png|webp)$/i.test(extname(entry.name)) ? [url] : [];
});
const flatten = async (items) => (await Promise.all(items)).flat(Infinity);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const localFiles = (await flatten(await imageFiles(new URL('../src/assets/images/fanart/', import.meta.url))))
  .filter((url) => !url.pathname.includes('/twitter-natao/'));
const localHashes = new Set(await mapLimit(localFiles, 8, async (url) => hash(await readFile(url))));

const images = posts.flatMap((post) => post.media.filter((item) => item.type === 'image').map((item) => ({ post, item })));
let previous = { candidates: [] };
try { previous = JSON.parse(await readFile(reviewUrl, 'utf8')); } catch {}
const cachedHashes = new Map(previous.candidates.flatMap((candidate) => candidate.media.map((item) => [item.id, item.sha256])));
for (const { item } of images) item.sha256 ??= cachedHashes.get(item.id);
const unhashedImages = images.filter(({ item }) => !item.sha256);
await mapLimit(unhashedImages, 4, async ({ item }, index) => {
  item.sha256 = hash(Buffer.from(await (await request(item.url)).arrayBuffer()));
  console.log(`image ${index + 1}/${unhashedImages.length}: ${item.id}`);
});
await writeFile(exportUrl, `${JSON.stringify({ account: '@natao1212', fetchedAt: new Date().toISOString(), posts }, null, 2)}\n`);

const decisions = new Map(previous.candidates.map((item) => [item.tweetId, item.decision]));
const seenImages = new Set();
const candidates = [];

for (const post of posts) {
  const uniqueMedia = post.media.filter((item) => item.type === 'video' || !seenImages.has(item.sha256));
  post.media.filter((item) => item.type === 'image').forEach((item) => seenImages.add(item.sha256));
  if (!uniqueMedia.length) continue;
  candidates.push({
    key: `N${String(candidates.length + 1).padStart(3, '0')}`,
    decision: decisions.get(post.id) ?? 'pending',
    tweetId: post.id,
    sourceUrl: post.sourceUrl,
    postedAt: post.postedAt,
    text: post.text,
    alreadyLocal: uniqueMedia.every((item) => item.type === 'image' && localHashes.has(item.sha256)),
    media: uniqueMedia,
  });
}

if (new Set(candidates.map((item) => item.key)).size !== candidates.length) throw new Error('候補キーが重複しています');
await writeFile(reviewUrl, `${JSON.stringify({ account: '@natao1212', generatedAt: new Date().toISOString(), candidates }, null, 2)}\n`);

const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const markdown = [
  '# @natao1212 ファンアート候補',
  '',
  '採否は Codex に `採用 N001 N003-N008 / 除外 N002` のように伝えてください。未指定は保留のままです。',
  '',
  ...candidates.flatMap((item) => [
    `## ${item.key} — ${item.postedAt.slice(0, 10)} — ${item.alreadyLocal ? '既存収録と一致' : '新規'}`,
    '',
    `判定: **${item.decision === 'include' ? '採用' : item.decision === 'exclude' ? '除外' : '保留'}** · [元投稿](${item.sourceUrl})`,
    '',
    `<p style="white-space: pre-wrap">${escape(item.text).replace(/[ \t]+$/gm, '')}</p>`,
    '',
    ...item.media.map((media, index) => `<img src="${media.previewUrl}" alt="${item.key}-${index + 1}" width="260">`),
    '',
  ]),
].join('\n');
await writeFile(markdownUrl, `${markdown.trimEnd()}\n`);

if (process.argv.includes('--download')) {
  const imageDirectory = new URL('../src/assets/images/fanart/twitter-natao/', import.meta.url);
  const videoDirectory = new URL('../public/media/fanart/natao/', import.meta.url);
  await Promise.all([mkdir(imageDirectory, { recursive: true }), mkdir(videoDirectory, { recursive: true })]);
  const download = async (url, destination) => {
    try { await access(destination); return; } catch {}
    await writeFile(destination, Buffer.from(await (await request(url)).arrayBuffer()));
  };
  const existingManifests = await Promise.all([
    '../data/fanart-media.json', '../data/fanart-patrol-media.json', '../data/fanart-collage-media.json',
  ].map(async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'))));
  const existingSources = new Set(existingManifests.flatMap((manifest) => manifest.posts)
    .flatMap((post) => [post, post.replyTo].filter(Boolean)).map((post) => post.sourceUrl));
  const accepted = candidates
    .filter((candidate) => candidate.decision === 'include' && !existingSources.has(candidate.sourceUrl))
    .flatMap((candidate) => {
    const selected = candidate.media.filter((item) => item.type === 'video' || !localHashes.has(item.sha256));
    if (!selected.length) return [];
    return [{
      sourceUrl: candidate.sourceUrl,
      id: candidate.tweetId,
      author: { name: '彗星のなたお（ほうとう組。みんな派）', handle: '@natao1212', url: 'https://x.com/natao1212' },
      postedAt: candidate.postedAt,
      text: candidate.text,
      media: selected.map((item) => item.type === 'image' ? {
        type: 'image', id: item.id, sourceUrl: item.url,
        assetPath: `/src/assets/images/fanart/twitter-natao/${new URL(item.url).pathname.split('/').at(-1)}`,
      } : {
        type: 'video', id: item.id, sourceUrl: item.url, posterUrl: item.previewUrl,
        localPath: `/media/fanart/natao/${item.id}.mp4`,
        posterAssetPath: `/src/assets/images/fanart/twitter-natao/${item.id}.jpg`,
        width: Number(item.url.match(/\/(\d+)x\d+\//)?.[1] ?? 0),
        height: Number(item.url.match(/\/\d+x(\d+)\//)?.[1] ?? 0),
      }),
    }];
  });
  const files = accepted.flatMap((post) => post.media.flatMap((item) => item.type === 'image'
    ? [[item.sourceUrl, new URL(`..${item.assetPath}`, import.meta.url)]]
    : [[item.sourceUrl, new URL(`../public${item.localPath}`, import.meta.url)], [item.posterUrl, new URL(`..${item.posterAssetPath}`, import.meta.url)]]));
  await mapLimit(files, 4, async ([url, destination], index) => {
    await download(url, destination);
    console.log(`download ${index + 1}/${files.length}: ${destination.pathname.split('/').at(-1)}`);
  });
  await writeFile(new URL('../data/fanart-natao-media.json', import.meta.url), `${JSON.stringify({
    generatedAt: new Date().toISOString(), source: 'data/x/natao1212-fanart-review.json', posts: accepted,
  }, null, 2)}\n`);
}
console.log(`${posts.length} posts -> ${candidates.length} candidates`);
