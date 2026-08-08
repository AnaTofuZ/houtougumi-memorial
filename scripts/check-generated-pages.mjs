import { readFile, readdir } from 'node:fs/promises';

const files = (await readdir(new URL('../dist/', import.meta.url), { recursive: true }))
  .filter((file) => file.endsWith('index.html'));
const pages = new Map(await Promise.all(files.map(async (file) => [file, await readFile(new URL(`../dist/${file}`, import.meta.url), 'utf8')])));
const count = (html, marker) => (html.match(marker) ?? []).length;
const matching = (pattern) => [...pages].filter(([file]) => pattern.test(file));
const verify = (name, entries, marker, expected) => {
  const counts = entries.map(([, html]) => count(html, marker));
  if (!counts.length || counts.some((value) => value > 24) || counts.reduce((sum, value) => sum + value, 0) !== expected) {
    throw new Error(`${name}のページングが不正です`);
  }
};

verify('コメント', matching(/^comments(?:\/\d+)?\/index\.html$/), /<div data-comment-card/g, 272);
verify('ファンアート', matching(/^fanart(?:\/\d+)?\/index\.html$/), /<button[^>]+data-fanart-card/g, 475);
verify('桃汁ぱとろーる', matching(/^fanart\/tag\/桃汁ぱとろーる(?:\/\d+)?\/index\.html$/), /<button[^>]+data-fanart-card/g, 339);
verify('桃汁クソコラグランプリ', matching(/^fanart\/tag\/桃汁クソコラグランプリ(?:\/\d+)?\/index\.html$/), /<button[^>]+data-fanart-card/g, 136);
if (![...pages.values()].some((html) => html.includes('2037849175753400370'))) throw new Error('指定ファンアートがありません');
console.log('comments 12 pages; fanart 20 pages; patrol 15 pages; collage 6 pages');
