import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const htmlUrl = new URL('../tools/fanart-review/index.html', import.meta.url);
const dataUrl = new URL('../data/fanart-twitter-merged.json', import.meta.url);
const [html, data] = await Promise.all([readFile(htmlUrl), readFile(dataUrl)]);

if (process.argv.includes('--check')) {
  const parsed = JSON.parse(data);
  if (!html.includes('id="posts"') || !parsed.posts.length) throw new Error('レビュー画面またはデータが不正です');
  console.log(`${parsed.posts.length} posts ready`);
  process.exit(0);
}

const server = createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const body = pathname === '/' ? html : pathname === '/data' ? data : null;
  if (!body) {
    response.writeHead(404).end('Not found');
    return;
  }
  response.writeHead(200, {
    'Content-Type': pathname === '/' ? 'text/html; charset=utf-8' : 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  }).end(body);
});

const port = Number(process.env.FANART_REVIEW_PORT || 4175);
server.listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}`));
