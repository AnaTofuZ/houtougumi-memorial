# ほうとう組。非公式ファンサイト

Astroで構築した、2026年4月に引退した山梨ご当地VTuber宝灯桃汁をはじめとするVTuberプロジェクト「ほうとう組。」の非公式ファンサイトです。

現在はダミーコンテンツを含む準備中サイトです。通常のビルドでは検索エンジンのインデックスを拒否します。

## 開発

```sh
npm ci
npm run dev
```

公開前の機械的チェック:

```sh
npm run check
npm run build
npm audit --omit=dev
```

## Cloudflare Workers

公開先: <https://houtougumi-memorial.anatofuz.net/>

```sh
npm run preview:cloudflare
npm run deploy
```

正式リリース時だけ `SITE_READY=true` を付けてビルドします。これによりページと `robots.txt` のインデックス許可が有効になります。

```sh
SITE_READY=true npm run deploy
```

リリース判断の詳細は [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) を参照してください。
