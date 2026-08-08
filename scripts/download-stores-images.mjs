import { access, mkdir, readFile, writeFile } from 'node:fs/promises';

const catalogUrl = new URL('../data/stores/houtoumomojiru.json', import.meta.url);
const outputUrl = new URL('../src/assets/images/goods/stores/', import.meta.url);
const catalog = JSON.parse(await readFile(catalogUrl, 'utf8'));
const checkOnly = process.argv.includes('--check');

const fileFor = (product) => {
  const extension = product.images.primaryUrl.match(/\.(jpe?g|png|webp)(?:\/|$)/i)?.[1].toLowerCase();
  if (!extension) throw new Error(`画像形式を判定できません: ${product.images.primaryUrl}`);
  return new URL(`${product.id}.${extension === 'jpeg' ? 'jpg' : extension}`, outputUrl);
};

await mkdir(outputUrl, { recursive: true });

if (checkOnly) {
  const missing = [];
  for (const product of catalog.products) {
    try {
      await access(fileFor(product));
    } catch {
      missing.push(product.id);
    }
  }
  if (missing.length) throw new Error(`不足画像: ${missing.join(', ')}`);
  console.log(`${catalog.products.length} images present`);
} else {
  const queue = [...catalog.products];
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const product = queue.shift();
      const destination = fileFor(product);
      try {
        await access(destination);
        continue;
      } catch {}

      const response = await fetch(product.images.primaryUrl);
      if (!response.ok) throw new Error(`${response.status}: ${product.images.primaryUrl}`);
      if (!response.headers.get('content-type')?.startsWith('image/')) {
        throw new Error(`画像ではありません: ${product.images.primaryUrl}`);
      }
      await writeFile(destination, Buffer.from(await response.arrayBuffer()));
    }
  }));
  console.log(`${catalog.products.length} images downloaded`);
}
