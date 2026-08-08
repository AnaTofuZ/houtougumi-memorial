import { access, mkdir, readFile, writeFile } from 'node:fs/promises';

const source = JSON.parse(await readFile(new URL('../data/x/arigato-nasu-houtougumi.json', import.meta.url), 'utf8'));
const excludedIds = JSON.parse(await readFile(new URL('../data/x/fan-comment-excluded-ids.json', import.meta.url), 'utf8'));
const output = new URL('../src/assets/images/comments/avatars/', import.meta.url);
const excluded = new Set(excludedIds);
const avatars = new Set(source.posts.filter((post) => !excluded.has(post.id)).map((post) => post.author.avatarUrl));

await mkdir(output, { recursive: true });
for (const avatarUrl of avatars) {
  const name = new URL(avatarUrl).pathname.split('/').at(-1);
  if (!name) throw new Error(`画像名を判定できません: ${avatarUrl}`);
  const destination = new URL(name, output);
  try {
    await access(destination);
    continue;
  } catch {}
  const response = await fetch(avatarUrl.replace('_x96.', '_400x400.'));
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
    throw new Error(`${response.status}: ${avatarUrl}`);
  }
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  console.log(name);
}
