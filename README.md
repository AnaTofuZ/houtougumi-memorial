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

ローカル画像は原則 `src/assets/` に置き、`astro:assets` の `Image` または `Picture` で最適化します。OGP画像やfaviconなど、固定URLで直接参照する必要がある素材だけ `public/` に置きます。

生成HTMLへ残る `<!-- ... -->` コメントは、公開上の意図がある場合だけ使用します。実装上のメモはフロントマターやTypeScript内のコメントに置きます。

## ファンアート除外レビュー

掲載済みファンアートをローカルで確認する場合は、次を実行して <http://127.0.0.1:4175> を開きます。

```sh
npm run review:fanart
```

投稿全体または画像・動画単体を選択し、コピーしたIDをCodexへ渡します。投稿は `ツイートID`、媒体単体は `ツイートID#ファイル名` 形式です。確定した除外対象は `data/x/fanart-excluded-ids.json` に記録し、次のコマンドでサイト用データを再生成します。

```sh
node scripts/merge-fanart-data.mjs
```

## あゆみ掲載レビュー

あゆみの掲載対象と表示文をローカルで編集する場合は、次を実行して <http://127.0.0.1:4176> を開きます。

```sh
npm run review:history
```

除外、タイトル、本文の変更は「変更を保存」で `data/history/history-review.json` に直接保存され、次回のサイトビルドから反映されます。

指定したYouTubeチャンネルとプレイリストから動画を同期する場合は、`yt-dlp` をインストールした環境で次を実行します。初回は全動画、2回目以降は追加分だけ取得します。

```sh
npm run sync:history-youtube
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
