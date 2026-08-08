import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';

const sourceUrl = new URL('../data/fanart-twitter-export.json', import.meta.url);
const outputUrl = new URL('../data/fanart-twitter-hiragana-reply-media.json', import.meta.url);
const imageOutputUrl = new URL('../src/assets/images/fanart/twitter-hiragana-replies/', import.meta.url);
const videoOutputUrl = new URL('../public/media/fanart-hiragana-replies/', import.meta.url);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const request = async (url) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(url, { headers: { 'User-Agent': 'houtougumi-memorial fanart archival/1.0' } });
    if (response.ok) return response;
    if (attempt === 2) throw new Error(`${response.status}: ${url}`);
    await wait(5_000 * (attempt + 1));
  }
};

const getTweet = async (id) => {
  const tweet = (await (await request(`https://api.fxtwitter.com/status/${id}`)).json()).tweet;
  if (!tweet) throw new Error(`投稿を取得できません: ${id}`);
  await wait(1_200);
  return tweet;
};

const media = (tweet) => (tweet?.media?.all ?? []).map((item) => ({
  type: item.type === 'photo' ? 'image' : 'video',
  id: item.id,
  sourceUrl: item.url,
  posterUrl: item.thumbnail_url,
  width: item.width,
  height: item.height,
  duration: item.duration,
}));

const structuredTweet = (tweet) => ({
  sourceUrl: tweet.url,
  id: tweet.id,
  author: { name: tweet.author.name, handle: `@${tweet.author.screen_name}`, url: tweet.author.url },
  postedAt: new Date(tweet.created_at).toISOString(),
  text: tweet.text,
  media: media(tweet),
});

const imageName = (rawUrl) => {
  const url = new URL(rawUrl);
  const extension = url.searchParams.get('format') ?? basename(url.pathname).match(/\.([^.]+)$/)?.[1];
  const segment = url.pathname.match(/\/media\/([^/]+)/)?.[1];
  if (!extension || !segment) throw new Error(`画像名を判定できません: ${rawUrl}`);
  return `${basename(segment, `.${extension}`)}.${extension === 'jpeg' ? 'jpg' : extension}`;
};

const download = async (url, destination, expectedType) => {
  try {
    await access(destination);
    return;
  } catch {}
  const response = await request(url);
  if (!response.headers.get('content-type')?.startsWith(expectedType)) throw new Error(`${expectedType}ではありません: ${url}`);
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  await wait(1_200);
};

const source = JSON.parse(await readFile(sourceUrl, 'utf8'));
const candidates = source.posts.filter((post) => !post.images.length && !post.videos.length);

if (process.argv.includes('--check')) {
  const output = JSON.parse(await readFile(outputUrl, 'utf8'));
  for (const post of output.posts) {
    if (!post.replyTo.media.length) throw new Error(`返信元メディアがありません: ${post.sourceUrl}`);
    for (const item of post.replyTo.media) {
      const path = item.type === 'image' ? new URL(`..${item.assetPath}`, import.meta.url) : new URL(`../public${item.localPath}`, import.meta.url);
      await access(path);
    }
  }
  console.log(`${candidates.length} candidates checked; ${output.count} reply-only posts found`);
  process.exit(0);
}

await mkdir(imageOutputUrl, { recursive: true });
await mkdir(videoOutputUrl, { recursive: true });

const posts = [];
for (const [index, candidate] of candidates.entries()) {
  const id = candidate.sourceUrl.match(/status\/(\d+)/)?.[1];
  const tweet = await getTweet(id);
  if (tweet.replying_to_status) {
    const replyTo = await getTweet(tweet.replying_to_status);
    if (media(replyTo).length) posts.push({ ...structuredTweet(tweet), replyTo: structuredTweet(replyTo) });
  }
  console.log(`candidate ${index + 1}/${candidates.length}: ${id}`);
}

for (const post of posts) {
  for (const item of post.replyTo.media) {
    if (item.type === 'image') {
      const url = new URL(item.sourceUrl);
      url.searchParams.set('name', 'orig');
      item.sourceUrl = url.href;
      const name = imageName(item.sourceUrl);
      item.assetPath = `/src/assets/images/fanart/twitter-hiragana-replies/${name}`;
      await download(item.sourceUrl, new URL(name, imageOutputUrl), 'image/');
    } else {
      const mediaId = new URL(item.sourceUrl).pathname.match(/\/(?:amplify_video|ext_tw_video)\/([^/]+)/)?.[1];
      if (!mediaId) throw new Error(`動画名を判定できません: ${item.sourceUrl}`);
      const name = `${mediaId}.mp4`;
      item.localPath = `/media/fanart-hiragana-replies/${name}`;
      await download(item.sourceUrl, new URL(name, videoOutputUrl), 'video/');
    }
  }
}

await writeFile(outputUrl, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  query: '#桃汁ぱとろーる',
  candidatesChecked: candidates.length,
  count: posts.length,
  posts,
}, null, 2)}\n`);
console.log(`${candidates.length} candidates checked; ${posts.length} reply-only posts found`);
