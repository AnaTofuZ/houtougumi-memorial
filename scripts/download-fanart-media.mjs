import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';

const sourceUrl = new URL('../data/fanart-twitter-export.json', import.meta.url);
const manifestUrl = new URL('../data/fanart-media.json', import.meta.url);
const imageOutputUrl = new URL('../src/assets/images/fanart/twitter/', import.meta.url);
const videoOutputUrl = new URL('../public/media/fanart/', import.meta.url);
const source = JSON.parse(await readFile(sourceUrl, 'utf8'));
const checkOnly = process.argv.includes('--check');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const request = async (url) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'houtougumi-memorial fanart archival/1.0' },
    });
    if (response.ok) return response;
    if (attempt === 2) throw new Error(`${response.status}: ${url}`);
    await wait(5_000 * (attempt + 1));
  }
};

const imageSource = (rawUrl) => {
  const url = new URL(rawUrl);
  if (url.pathname.startsWith('/media/')) url.searchParams.set('name', 'orig');
  return url;
};

const imageName = (rawUrl) => {
  const url = imageSource(rawUrl);
  const extension = url.searchParams.get('format') ?? basename(url.pathname).match(/\.([^.]+)$/)?.[1];
  const mediaId = url.pathname.match(/\/(?:media|amplify_video_thumb|ext_tw_video_thumb)\/([^/]+)/)?.[1];
  if (!extension || !mediaId) throw new Error(`画像名を判定できません: ${rawUrl}`);
  const suffix = url.pathname.startsWith('/media/') ? '' : `-${basename(url.pathname, `.${extension}`)}`;
  return `${mediaId}${suffix}.${extension === 'jpeg' ? 'jpg' : extension}`;
};

const imageAssetPath = (name) => `/src/assets/images/fanart/twitter/${name}`;
const videoLocalPath = (name) => `/media/fanart/${name}`;

const download = async (url, destination, expectedType) => {
  try {
    await access(destination);
    return false;
  } catch {}

  const response = await request(url);
  if (!response.headers.get('content-type')?.startsWith(expectedType)) {
    throw new Error(`${expectedType}ではありません: ${url}`);
  }
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  await wait(1_200);
  return true;
};

if (checkOnly) {
  const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
  const images = manifest.posts.flatMap((post) => post.images.map((image) => image.assetPath));
  const videos = manifest.posts.flatMap((post) => post.videos);
  const files = [...new Set([...images, ...videos.map((video) => video.localPath), ...videos.map((video) => video.posterAssetPath)])];
  for (const path of files) {
    await access(path.startsWith('/src/') ? new URL(`..${path}`, import.meta.url) : new URL(`../public${path}`, import.meta.url));
  }
  const media = manifest.posts.flatMap((post) => [...post.images, ...post.videos]);
  if (media.some((item) => item.sourceUrl.startsWith('blob:'))) throw new Error('blob URLが残っています');
  console.log(`${files.length} media files present`);
  process.exit(0);
}

await mkdir(imageOutputUrl, { recursive: true });
await mkdir(videoOutputUrl, { recursive: true });

const imageEntries = new Map();
for (const post of source.posts) {
  for (const image of post.images) {
    const name = imageName(image.src);
    imageEntries.set(name, { sourceUrl: imageSource(image.src).href, assetPath: imageAssetPath(name) });
  }
}

let completed = 0;
for (const [name, image] of imageEntries) {
  if (await download(image.sourceUrl, new URL(name, imageOutputUrl), 'image/')) {
    console.log(`image ${++completed}/${imageEntries.size}: ${name}`);
  }
}

const videosByPost = new Map();
const videoPosts = source.posts.filter((post) => post.videos.length);
for (const [index, post] of videoPosts.entries()) {
  const statusId = post.sourceUrl.match(/status\/(\d+)/)?.[1];
  if (!statusId) throw new Error(`投稿IDを判定できません: ${post.sourceUrl}`);
  const response = await request(`https://api.fxtwitter.com/status/${statusId}`);
  const tweet = (await response.json()).tweet;
  const videos = [...(tweet?.media?.videos ?? []), ...(tweet?.quote?.media?.videos ?? [])];
  if (!videos.length) throw new Error(`動画URLを解決できません: ${post.sourceUrl}`);
  videosByPost.set(post.sourceUrl, videos);
  console.log(`video URL ${index + 1}/${videoPosts.length}: ${statusId}`);
  await wait(1_200);
}

for (const videos of videosByPost.values()) {
  for (const video of videos) {
    const name = imageName(video.thumbnail_url);
    if (!imageEntries.has(name)) {
      const image = { sourceUrl: video.thumbnail_url, assetPath: imageAssetPath(name) };
      imageEntries.set(name, image);
      await download(image.sourceUrl, new URL(name, imageOutputUrl), 'image/');
      console.log(`video poster: ${name}`);
    }
  }
}

for (const videos of videosByPost.values()) {
  for (const video of videos) {
    const mediaId = new URL(video.url).pathname.match(/\/(?:amplify_video|ext_tw_video)\/([^/]+)/)?.[1];
    if (!mediaId) throw new Error(`動画名を判定できません: ${video.url}`);
    const name = `${mediaId}.mp4`;
    await download(video.url, new URL(name, videoOutputUrl), 'video/');
    video.localPath = videoLocalPath(name);
    console.log(`video: ${name}`);
  }
}

const manifest = {
  generatedAt: new Date().toISOString(),
  source: 'data/fanart-twitter-export.json',
  posts: source.posts.map((post) => ({
    sourceUrl: post.sourceUrl,
    images: post.images.map((image) => imageEntries.get(imageName(image.src))),
    videos: (videosByPost.get(post.sourceUrl) ?? []).map((video) => ({
      sourceUrl: video.url,
      localPath: video.localPath,
      posterUrl: video.thumbnail_url,
      posterAssetPath: imageEntries.get(imageName(video.thumbnail_url))?.assetPath,
      width: video.width,
      height: video.height,
      duration: video.duration,
    })),
  })),
};

await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${imageEntries.size} images and ${[...videosByPost.values()].flat().length} videos downloaded`);
