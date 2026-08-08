import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';

const ids = [
  '2037893657194586243',
  '2027387357377540403',
  '2007799837836918835',
  '2002204877871804552',
  '2001714895591739614',
  '1940050099478176052',
  '1754856000287584395',
  '1754399243337687412',
  '1753767815000301601',
  '1751240487963639956',
  '1747955296373469191',
  '1747955118174245044',
  '1746505379364913274',
  '1710673234084135297',
  '1623348747945254912',
  '1613551507919732736',
  '1575733994544455680',
  '1572594612702973954',
  '1556961476069376002',
];

const exportUrl = new URL('../data/fanart-twitter-patrol-export.json', import.meta.url);
const manifestUrl = new URL('../data/fanart-patrol-media.json', import.meta.url);
const imageOutputUrl = new URL('../src/assets/images/fanart/twitter-patrol/', import.meta.url);
const videoOutputUrl = new URL('../public/media/fanart-patrol/', import.meta.url);
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

const getTweet = async (id) => {
  const response = await request(`https://api.fxtwitter.com/status/${id}`);
  const tweet = (await response.json()).tweet;
  if (!tweet) throw new Error(`投稿を取得できません: ${id}`);
  await wait(1_200);
  return tweet;
};

const media = (tweet) => (tweet?.media?.all ?? []).map((item) => ({
  type: item.type === 'photo' ? 'image' : 'video',
  id: item.id,
  sourceUrl: item.type === 'photo' ? item.url : item.url,
  posterUrl: item.thumbnail_url,
  width: item.width,
  height: item.height,
  duration: item.duration,
}));

const structuredTweet = (tweet) => ({
  sourceUrl: tweet.url,
  id: tweet.id,
  author: {
    name: tweet.author.name,
    handle: `@${tweet.author.screen_name}`,
    url: tweet.author.url,
  },
  postedAt: new Date(tweet.created_at).toISOString(),
  text: tweet.text,
  media: media(tweet),
});

const imageName = (rawUrl) => {
  const url = new URL(rawUrl);
  const extension = url.searchParams.get('format') ?? basename(url.pathname).match(/\.([^.]+)$/)?.[1];
  const mediaIdWithExtension = url.pathname.match(/\/(?:media|amplify_video_thumb|ext_tw_video_thumb)\/([^/]+)/)?.[1];
  const mediaId = mediaIdWithExtension && basename(mediaIdWithExtension, `.${extension}`);
  if (!extension || !mediaId) throw new Error(`画像名を判定できません: ${rawUrl}`);
  return `${mediaId}.${extension === 'jpeg' ? 'jpg' : extension}`;
};

const imageSource = (rawUrl) => {
  const url = new URL(rawUrl);
  if (url.pathname.startsWith('/media/')) url.searchParams.set('name', 'orig');
  return url.href;
};

const videoName = (rawUrl) => {
  const mediaId = new URL(rawUrl).pathname.match(/\/(?:amplify_video|ext_tw_video)\/([^/]+)/)?.[1];
  if (!mediaId) throw new Error(`動画名を判定できません: ${rawUrl}`);
  return `${mediaId}.mp4`;
};

const download = async (url, destination, expectedType) => {
  try {
    await access(destination);
    return;
  } catch {}
  const response = await request(url);
  if (!response.headers.get('content-type')?.startsWith(expectedType)) {
    throw new Error(`${expectedType}ではありません: ${url}`);
  }
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  await wait(1_200);
};

const allMedia = (posts) => posts.flatMap((post) => [post, post.replyTo].filter(Boolean).flatMap((tweet) => tweet.media));

if (checkOnly) {
  const source = JSON.parse(await readFile(exportUrl, 'utf8'));
  const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
  if (source.count !== ids.length || new Set(source.posts.map((post) => post.id)).size !== ids.length) {
    throw new Error('投稿件数またはIDが不正です');
  }
  if (!source.posts.find((post) => post.id === '2002204877871804552')?.replyTo?.media.length) {
    throw new Error('返信元メディアがありません');
  }
  for (const item of allMedia(manifest.posts)) {
    const path = item.type === 'image' ? new URL(`..${item.assetPath}`, import.meta.url) : new URL(`../public${item.localPath}`, import.meta.url);
    await access(path);
  }
  console.log(`${source.count} posts and ${allMedia(manifest.posts).length} media files present`);
  process.exit(0);
}

await mkdir(imageOutputUrl, { recursive: true });
await mkdir(videoOutputUrl, { recursive: true });

const posts = [];
for (const [index, id] of ids.entries()) {
  const tweet = await getTweet(id);
  const post = structuredTweet(tweet);
  post.replyTo = null;
  if (!post.media.length && tweet.replying_to_status) {
    post.replyTo = structuredTweet(await getTweet(tweet.replying_to_status));
  }
  posts.push(post);
  console.log(`tweet ${index + 1}/${ids.length}: ${id}`);
}

const exported = {
  exportedAt: new Date().toISOString(),
  query: '#桃汁パトロール',
  source: 'X latest search',
  count: posts.length,
  posts,
};
await writeFile(exportUrl, `${JSON.stringify(exported, null, 2)}\n`);

const files = new Map();
for (const item of allMedia(posts)) {
  if (item.type === 'image') {
    const name = imageName(item.sourceUrl);
    item.sourceUrl = imageSource(item.sourceUrl);
    item.assetPath = `/src/assets/images/fanart/twitter-patrol/${name}`;
    files.set(name, { url: item.sourceUrl, destination: new URL(name, imageOutputUrl), type: 'image/' });
  } else {
    const name = videoName(item.sourceUrl);
    item.localPath = `/media/fanart-patrol/${name}`;
    files.set(name, { url: item.sourceUrl, destination: new URL(name, videoOutputUrl), type: 'video/' });
  }
}

let completed = 0;
for (const [name, file] of files) {
  await download(file.url, file.destination, file.type);
  console.log(`media ${++completed}/${files.size}: ${name}`);
}

const manifest = {
  generatedAt: new Date().toISOString(),
  source: 'data/fanart-twitter-patrol-export.json',
  posts,
};
await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${posts.length} posts and ${files.size} media files downloaded`);
