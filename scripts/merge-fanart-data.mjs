import { readFile, writeFile } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const twitter = await readJson('../data/fanart-twitter-export.json');
const media = await readJson('../data/fanart-media.json');
const patrol = await readJson('../data/fanart-patrol-media.json');
const collage = await readJson('../data/fanart-collage-media.json');
const natao = await readJson('../data/fanart-natao-media.json');
const exclusions = await readJson('../data/x/fanart-excluded-ids.json');
const excludedIds = new Set(exclusions.posts);
const excludedMedia = new Set(exclusions.media);
const outputUrl = new URL('../data/fanart-twitter-merged.json', import.meta.url);
const assetBase = 'https://assets.houtougumi-memorial.anatofuz.net';

const remoteMedia = (item) => {
  const { assetPath, localPath, posterAssetPath, ...media } = item;
  if (item.type === 'image') {
    return { ...media, url: `${assetBase}${assetPath.replace('/src/assets/images/fanart', '/fanart/images')}` };
  }
  return {
    ...media,
    url: `${assetBase}${localPath.replace('/media/fanart', '/fanart/videos')}`,
    posterUrl: `${assetBase}${posterAssetPath.replace('/src/assets/images/fanart', '/fanart/images')}`,
  };
};

const sources = new Map(twitter.posts.map((post) => [post.sourceUrl, post]));
const videoPosters = new Set(media.posts.flatMap((post) => post.videos.map((video) => video.posterAssetPath)));
const posts = new Map();

for (const post of media.posts) {
  const source = sources.get(post.sourceUrl);
  if (!source) continue;
  posts.set(post.sourceUrl, {
    sourceUrl: post.sourceUrl,
    author: {
      name: source.text.split('\n')[0] || source.handle,
      handle: source.handle,
      url: `https://x.com/${source.handle.replace(/^@/, '')}`,
    },
    postedAt: source.postedAt,
    text: source.text,
    tags: ['桃汁ぱとろーる'],
    media: [
      ...post.images.filter((image) => !videoPosters.has(image.assetPath)).map((image) => remoteMedia({ type: 'image', ...image })),
      ...post.videos.map((video) => remoteMedia({ type: 'video', ...video })),
    ],
  });
}

for (const post of patrol.posts.flatMap((item) => [item, item.replyTo].filter(Boolean))) {
  const existing = posts.get(post.sourceUrl);
  if (existing) {
    if (!existing.tags.includes('桃汁ぱとろーる')) existing.tags.push('桃汁ぱとろーる');
    continue;
  }
  posts.set(post.sourceUrl, {
    sourceUrl: post.sourceUrl,
    author: post.author,
    postedAt: post.postedAt,
    text: post.text,
    tags: ['桃汁ぱとろーる'],
    media: post.media.map(remoteMedia),
  });
}

for (const post of collage.posts) {
  posts.set(post.sourceUrl, {
    sourceUrl: post.sourceUrl,
    author: post.author,
    postedAt: post.postedAt,
    text: post.text,
    tags: ['桃汁クソコラグランプリ'],
    media: post.media.map(remoteMedia),
  });
}

for (const post of natao.posts) {
  if (posts.has(post.sourceUrl)) continue;
  posts.set(post.sourceUrl, {
    sourceUrl: post.sourceUrl,
    author: post.author,
    postedAt: post.postedAt,
    text: post.text,
    tags: ['桃汁ぱとろーる'],
    media: post.media.map(remoteMedia),
  });
}

const merged = [...posts.values()]
  .filter((post) => !excludedIds.has(post.sourceUrl.match(/\/status\/(\d+)/)?.[1]))
  .map((post) => ({ ...post, media: post.media.filter((item) => !excludedMedia.has(item.url.split('/').at(-1))) }))
  .filter((post) => post.media.length)
  .sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));
if (new Set(merged.map((post) => post.sourceUrl)).size !== merged.length) throw new Error('投稿URLが重複しています');
if (merged.some((post, index) => index && Date.parse(merged[index - 1].postedAt) < Date.parse(post.postedAt))) {
  throw new Error('投稿が新しい順に並んでいません');
}

await writeFile(outputUrl, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  sources: ['#桃汁ぱとろーる', '#桃汁クソコラグランプリ', '@natao1212'],
  count: merged.length,
  posts: merged,
}, null, 2)}\n`);
console.log(`${merged.length} posts merged`);
