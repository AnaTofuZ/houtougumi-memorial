import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const rootUrl = new URL('../', import.meta.url);
const htmlUrl = new URL('../tools/history-review/index.html', import.meta.url);
const reviewUrl = new URL('../data/history/history-review.json', import.meta.url);
const temporaryReviewUrl = new URL('../data/history/history-review.json.tmp', import.meta.url);

console.log('あゆみデータを準備しています…');
execFileSync(process.execPath, [fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url)), 'build'], {
  cwd: fileURLToPath(rootUrl),
  stdio: 'ignore',
});

const [html, entriesData] = await Promise.all([
  readFile(htmlUrl),
  readFile(new URL('../dist/history-data/all.json', import.meta.url)),
]);
const entries = JSON.parse(entriesData);
const entryIds = new Set(entries.map((entry) => entry.id));

const readReview = async () => JSON.parse(await readFile(reviewUrl, 'utf8'));
const validReview = (value) => {
  if (!value || !Array.isArray(value.excluded) || !value.edits || Array.isArray(value.edits)) return false;
  if (value.excluded.some((id) => typeof id !== 'string' || !entryIds.has(id))) return false;
  return Object.entries(value.edits).every(([id, edit]) => entryIds.has(id)
    && edit && typeof edit === 'object' && !Array.isArray(edit)
    && Object.keys(edit).every((key) => key === 'title' || key === 'description')
    && (edit.title === undefined || typeof edit.title === 'string' && edit.title.length <= 300)
    && (edit.description === undefined || typeof edit.description === 'string' && edit.description.length <= 2000));
};

if (process.argv.includes('--check')) {
  const review = await readReview();
  if (!html.includes('id="entries"') || !entries.length || entries.some((entry) => entry.category === '配信アーカイブ') || !validReview(review)) throw new Error('管理画面またはデータが不正です');
  console.log(`${entries.length} entries ready`);
  process.exit(0);
}

const json = (response, status, body) => response.writeHead(status, {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
}).end(JSON.stringify(body));

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (request.method === 'GET' && pathname === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }).end(html);
    return;
  }
  if (request.method === 'GET' && pathname === '/data') {
    json(response, 200, { entries, review: await readReview() });
    return;
  }
  if (request.method === 'POST' && pathname === '/save') {
    let body = '';
    for await (const chunk of request) {
      body += chunk;
      if (body.length > 1_000_000) return json(response, 413, { error: 'データが大きすぎます' });
    }
    try {
      const review = JSON.parse(body);
      if (!validReview(review)) return json(response, 400, { error: '保存内容が不正です' });
      review.excluded = [...new Set(review.excluded)].sort();
      review.edits = Object.fromEntries(Object.entries(review.edits).sort(([a], [b]) => a.localeCompare(b)));
      await writeFile(temporaryReviewUrl, `${JSON.stringify(review, null, 2)}\n`);
      await rename(temporaryReviewUrl, reviewUrl);
      json(response, 200, { ok: true });
    } catch {
      json(response, 400, { error: 'JSONを読み取れませんでした' });
    }
    return;
  }
  response.writeHead(404).end('Not found');
});

const port = Number(process.env.HISTORY_REVIEW_PORT || 4176);
server.listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}`));
