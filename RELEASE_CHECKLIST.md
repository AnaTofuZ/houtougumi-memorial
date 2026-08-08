# リリースチェックリスト

最終確認日: 2026-08-08

## 現状

- Astroの静的ビルドは全9ページ成功
- スマートフォン幅で横スクロールなし
- 画像404、ブラウザのコンソールエラーなし
- ダミーコンテンツが残っているため、現時点では公開不可

## P0: リリース必須

### コンテンツ

- [ ] メンバー紹介、エピソード、語録、アーカイブを実データへ差し替える
- [ ] 楽曲情報とYouTube URLを実データへ差し替える
- [ ] ファンコメントを実データへ差し替える
- [ ] グッズ情報、価格、販売状態、購入URLを実データへ差し替える
- [ ] 年表を実データへ差し替える
- [ ] ファンアート情報を実データへ差し替える
- [ ] トップページを含むすべてのダミー文言を正式文言へ差し替える
- [ ] `/images/kari.png` と仮画像を正式画像へ差し替える
- [x] サイトの対象を「ほうとう組。」全体に確定し、名称と説明を統一する

### 権利・運用

- [ ] イラストの作者名、作者リンク、掲載許可を確認する
- [ ] コメント、語録、アーカイブの出典と転載可否を確認する
- [ ] 立ち絵、ロゴ、グッズ画像の利用条件を確認する
- [x] 権利者からの問い合わせ・削除依頼を受ける連絡先を用意する
- [x] 非公式サイトであることを各種メタ情報を含めて明示する

### ビルド・依存関係

- [x] `@astrojs/check` と `typescript` を導入する
- [x] `npm run check` スクリプトを追加する
- [x] `npm audit fix` を実行する
- [x] high脆弱性4件（`js-yaml`、`nanoid`、`sharp`、`svgo`）の解消を確認する
- [x] 更新後に型チェック、ビルド、依存関係監査を再実行する
- [x] GitHub Actionsで型チェック、ビルド、依存関係監査を実行する

## P1: 公開品質

### SEO・共有表示

- [x] 本番ドメインを `houtougumi-memorial.anatofuz.net` に決定する
- [x] `astro.config.mjs` に `site` を設定する
- [x] canonical URLを追加する
- [x] `og:url` と `og:image` を追加する
- [x] Twitter Cardを追加する
- [ ] 1200×630程度のOG画像を用意する
- [ ] 正式なfaviconを用意する
- [x] `robots.txt` を追加し、`SITE_READY=true` の本番ビルドだけインデックスを許可する
- [ ] 必要に応じてサイトマップを追加する

### エラーページ・画像・外部通信

- [x] `src/pages/404.astro` を追加する
- [ ] 画像へ `width` と `height` を設定する
- [x] 画面外画像へ `loading="lazy"` を設定する
- [ ] 正式画像をWebPまたはAVIFなどへ最適化する
- [x] Google FontsとYouTube埋め込みによる外部通信を確認する
- [x] 外部通信に関する案内をフッターへ掲載する

### アクセシビリティ

- [x] モバイルメニューに `aria-expanded` を追加し、表示状態と同期する
- [x] デスクトップのメンバーメニューをキーボード操作可能にする
- [x] ファンアート一覧のクリック可能な `div` を `button` に変更する
- [x] ライトボックスへdialog属性、Escで閉じる操作、フォーカス制御を追加する
- [x] グッズ絞り込みボタンへ選択状態を付与する
- [ ] キーボード操作とフォーカス表示を全ページで確認する
- [ ] 文字色と背景色のコントラストを確認する

## Cloudflareデプロイ

静的サイトとしてCloudflare Workers Static Assetsへ配置する方針を第一候補とする。現状はSSRを必要としないため、Cloudflare Astroアダプターは追加しない。

- [x] Wranglerを開発依存関係へ追加する
- [x] `wrangler.jsonc` を追加する
- [x] `assets.directory` に `./dist` を設定する
- [x] `not_found_handling` に `404-page` を設定する
- [x] ビルド・プレビュー・デプロイスクリプトを追加する
- [x] Git連携、masterの自動デプロイ、非本番ブランチのビルドを設定する
- [x] 独自ドメインとHTTPSを設定する
- [x] `workers.dev` と独自ドメインの重複公開を避け、正規ドメインへ統一する
- [x] Cloudflare上で404ページと末尾スラッシュの挙動を確認する

Cloudflare Pagesを使用する場合の基本設定:

- Build command: `npm run build`
- Build directory: `dist`

## 公開前の機械的チェック

```sh
npm ci
npm run check
npm run build
npm audit --omit=dev
```

続けて、プレビュー環境で以下を確認する。

- [ ] 全9ページが表示できる
- [ ] 内部リンクと外部リンクが正しい
- [ ] スマートフォンとデスクトップでレイアウトが崩れない
- [x] 存在しないURLが404を返す
- [ ] OGPのタイトル、説明、画像が正しい
- [ ] ダミー文言、仮画像、仮URLが残っていない

## 当面追加しないもの

現状の8ページ規模では、CMS、データベース、独自CI基盤、複雑な監視は追加しない。手作業でのコンテンツ更新や運用が負担になった時点で検討する。

## 参考資料

- [Cloudflare Workers: Astro](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)
- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Cloudflare Pages: Astro](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
- [Astro configuration](https://docs.astro.build/en/guides/configuring-astro/)
