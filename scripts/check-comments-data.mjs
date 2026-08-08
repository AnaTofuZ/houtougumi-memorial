import { readFile } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const source = await readJson('../data/x/arigato-nasu-houtougumi.json');
const excluded = new Set(await readJson('../data/x/fan-comment-excluded-ids.json'));
const overrides = await readJson('../data/x/fan-comment-source-overrides.json');
const comments = source.posts.filter((post) => !excluded.has(post.id));

if (comments.length !== 272) throw new Error(`コメント件数が不正です: ${comments.length}`);
if (overrides.length !== 5 || overrides.some((post) => !comments.some((comment) => comment.id === post.wrapperId))) {
  throw new Error('引用元の差し替えが不正です');
}
console.log(`${comments.length} comments, ${excluded.size} excluded, ${overrides.length} quote sources`);
