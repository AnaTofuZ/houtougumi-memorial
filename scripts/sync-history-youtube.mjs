import { execFile } from 'node:child_process';
import assert from 'node:assert/strict';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const outputPath = new URL('../data/history/youtube-entries.json', import.meta.url);
const sources = [
  ['official-streams', 'https://www.youtube.com/@houtoumomojiru0412/streams'],
  ['official-videos', 'https://www.youtube.com/@houtoumomojiru0412/videos'],
  ['momojiru-playlist-1', 'https://youtube.com/playlist?list=PLFG7_zWC6HmO65DW4T_ZlXMPJzqq0pQLV'],
  ['locopro-streams', 'https://www.youtube.com/@vtuber-locopro/streams'],
  ['momojiru-playlist-2', 'https://youtube.com/playlist?list=PLFG7_zWC6HmPXNf65czyUbvLB1OxTEEKW'],
];

const run = async (args) => (await exec('yt-dlp', args, { maxBuffer: 64 * 1024 * 1024 })).stdout;
const dateOf = (item) => {
  if (item.upload_date) return item.upload_date.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3');
  if (!item.timestamp) return null;
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date(item.timestamp * 1000));
};
const descriptionOf = (memberships) => {
  if (memberships.includes('official-streams')) return '宝灯桃汁公式チャンネルのライブ配信アーカイブです。';
  if (memberships.includes('official-videos')) return '宝灯桃汁公式チャンネルで公開された動画です。';
  if (memberships.includes('locopro-streams')) return 'Vマート公式チャンネルで公開された、桃汁ちゃん関連の配信アーカイブ候補です。';
  return '桃汁ちゃんが登場する指定プレイリストの動画です。';
};
const categoryOf = (item, memberships) => {
  const isStream = memberships.some((source) => source.endsWith('-streams')) || ['is_live', 'was_live'].includes(item.live_status);
  if (!isStream) return '動画投稿';
  return /コラボ|凸待ち|対談|ゲスト|大集合/.test(item.title) ? 'コラボ配信' : '配信';
};
const save = async (items, memberships) => {
  const entries = [...items.values()]
    .filter((item) => memberships.has(item.id) && item.title && item.live_status !== 'is_upcoming' && dateOf(item))
    .map((item) => ({
      id: `youtube-${item.id}`,
      videoId: item.id,
      date: dateOf(item),
      category: categoryOf(item, [...memberships.get(item.id)]),
      liveStatus: item.live_status,
      sourceLabel: `YouTube · ${item.channel || '動画アーカイブ'}`,
      title: item.title,
      description: descriptionOf([...memberships.get(item.id)]),
      url: `https://www.youtube.com/watch?v=${item.id}`,
    }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const json = JSON.stringify({ updatedAt: new Date().toISOString(), entries }, null, 2) + '\n';
  const temporaryPath = new URL(`${outputPath.pathname}.tmp`, 'file:');
  await writeFile(temporaryPath, json);
  await rename(temporaryPath, outputPath);
  return entries.length;
};

const validate = ({ entries }) => {
  assert.equal(categoryOf({ title: '大型コラボ', live_status: 'was_live' }, []), 'コラボ配信');
  assert.equal(categoryOf({ title: 'コラボ動画', live_status: 'not_live' }, []), '動画投稿');
  const ids = new Set();
  for (const entry of entries) {
    if (ids.has(entry.id) || !/^youtube-[\w-]{11}$/.test(entry.id) || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
      throw new Error(`Invalid YouTube entry: ${entry.id}`);
    }
    ids.add(entry.id);
  }
  console.log(`YouTube archive: ${entries.length} entries OK`);
};

if (process.argv.includes('--check')) {
  validate(JSON.parse(await readFile(outputPath, 'utf8')));
  process.exit(0);
}

const installed = await run(['--version']).catch(() => null);
if (!installed) throw new Error('yt-dlp is required: https://github.com/yt-dlp/yt-dlp');

const flatLists = await Promise.all(sources.map(async ([key, url]) => {
  const raw = await run(['--flat-playlist', '--dump-single-json', '--no-warnings', url]);
  return [key, JSON.parse(raw).entries ?? []];
}));
const memberships = new Map();
for (const [key, entries] of flatLists) {
  for (const { id } of entries) {
    if (!id) continue;
    if (!memberships.has(id)) memberships.set(id, new Set());
    memberships.get(id).add(key);
  }
}

const current = JSON.parse(await readFile(outputPath, 'utf8'));
const items = new Map(current.entries
  .filter((entry) => entry.liveStatus || [...(memberships.get(entry.videoId) ?? [])].some((source) => source.endsWith('-streams') || source === 'official-videos'))
  .map((entry) => [entry.videoId, {
  id: entry.videoId,
  title: entry.title,
  upload_date: entry.date.replaceAll('-', ''),
  channel: entry.sourceLabel.replace(/^YouTube · /, ''),
  live_status: entry.liveStatus ?? (entry.description.includes('アーカイブ') ? 'was_live' : 'not_live'),
}]));
const missing = [...memberships.keys()].filter((id) => !items.has(id));
console.log(`${memberships.size} unique videos; ${missing.length} metadata records to fetch`);

const chunks = Array.from({ length: Math.ceil(missing.length / 20) }, (_, index) => missing.slice(index * 20, index * 20 + 20));
let nextChunk = 0;
let completed = 0;
let saving = Promise.resolve();
const worker = async () => {
  while (nextChunk < chunks.length) {
    const chunk = chunks[nextChunk++];
    const stdout = await run([
      '--ignore-errors', '--skip-download', '--no-warnings',
      '--extractor-args', 'youtube:lang=ja',
      '--print', '%(.{id,title,upload_date,timestamp,live_status,channel})j',
      ...chunk.map((id) => `https://www.youtube.com/watch?v=${id}`),
    ]).catch((error) => error.stdout || '');
    for (const line of stdout.trim().split('\n').filter(Boolean)) {
      const item = JSON.parse(line);
      if (item.id) items.set(item.id, item);
    }
    completed += chunk.length;
    const saved = await (saving = saving.then(() => save(items, memberships)));
    console.log(`${Math.min(completed, missing.length)}/${missing.length} fetched; ${saved} entries saved`);
  }
};
await Promise.all(Array.from({ length: Math.min(4, chunks.length) }, worker));
await save(items, memberships);
validate(JSON.parse(await readFile(outputPath, 'utf8')));
