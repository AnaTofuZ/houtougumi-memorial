import { readFile, writeFile } from 'node:fs/promises';

const catalogUrl = new URL('../data/stores/houtoumomojiru.json', import.meta.url);
const catalog = JSON.parse(await readFile(catalogUrl, 'utf8'));
const checkOnly = process.argv.includes('--check');

const normalize = (line) => line.replace(/[\s　]/g, '');
const removableSection = (line) => {
  const heading = normalize(line);
  return /^(?:[＜【■]).*(?:ご注意|注意事項|使用時の注意|発送予定日?|ビデオ視聴方法)/.test(heading);
};

const removableLine = (line) => {
  const compact = normalize(line);
  return compact.startsWith('※')
    || /サイズ詳細は画像.*Detail/i.test(compact)
    || /画像はイメージ/.test(compact)
    || /実際と異なる場合/.test(compact)
    || /(?:発送|配送|送料|お届け|到着|倉庫状況|受注締め切り|受注期間)/.test(compact)
    || /新型コロナウイルスの影響/.test(compact)
    || /(?:購入後|購入時|購入画面|備考欄|カート)/.test(compact)
    || /当サイトで販売されている/.test(compact)
    || /著作権法により保護/.test(compact)
    || /データの複製や.*転載/.test(compact)
    || /法律により(?:禁止|罰せられ)/.test(compact)
    || /(?:ご注意ください|ご了承ください|ご了承願います|責任を負いかね)/.test(compact)
    || /(?:個人利用の範囲|意図しない利用法)/.test(compact);
};

const clean = (description) => description
  .replace(/\r\n/g, '\n')
  .split(/\n{2,}/)
  .filter((block) => !removableSection(block.split('\n')[0]))
  .map((block) => block.split('\n').filter((line) => !removableLine(line)).join('\n').trim())
  .filter(Boolean)
  .join('\n\n');

let changed = 0;
for (const product of catalog.products) {
  const description = clean(product.description);
  if (description !== product.description) changed += 1;
  product.description = description;
}

if (catalog.products.some((product) => clean(product.description) !== product.description)) {
  throw new Error('説明文のクリーニングが冪等ではありません');
}

if (checkOnly) {
  if (changed) throw new Error(`${changed}件の未クリーニング説明文があります`);
  console.log(`${catalog.products.length} descriptions clean`);
} else {
  await writeFile(catalogUrl, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(`${changed} descriptions cleaned`);
}
