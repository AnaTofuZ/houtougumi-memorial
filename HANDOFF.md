# 作業引き継ぎ

更新日: 2026-08-08

## 次に行うこと

ページ遷移時のちらつきを、SPA化せずブラウザ標準のクロスドキュメント View Transition で軽減する。

1. 最新の `master` から新しいブランチを作る。
2. まず `src/styles/global.css` へ次の最小設定だけを追加して試す。

   ```css
   @view-transition {
     navigation: auto;
   }
   ```

3. トップ、コメント、グッズ、音楽、ファンアート、メンバー間を実ブラウザで往復し、Navbarと見出しの見え方を確認する。
4. Navbarがまだ動いて見える場合だけ、`header`へ固有の`view-transition-name`を付ける。最初から`ClientRouter`は導入しない。
5. `prefers-reduced-motion`で遷移アニメーションが無効になることを確認する。
6. `npm run check && npm run build`後、コミット・push・通常PRを作る。手動デプロイはしない。

Astro公式資料: <https://docs.astro.build/en/guides/view-transitions/>

## 現在の状態

- 現在のブランチ: `master`
- 作業ツリー: clean
- 公開先: <https://houtougumi-memorial.anatofuz.net/>
- 通常のページ遷移はMPA方式で、Navbarを含む文書全体が再生成される。
- Astroの`ClientRouter`は未導入。
- `master`へのマージでCloudflareの本番デプロイが動く。手動の`npm run deploy`は実行しない。

### マージ済みPR

- [PR #9: perf: defer offscreen rendering and prefetch navigation](https://github.com/AnaTofuZ/houtougumi-memorial/pull/9)
  - `content-visibility: auto`で画面外のグッズ描画を遅延
  - Astroのprefetchを有効化
  - CIとCloudflare buildは成功
- [PR #10: ページ切り替え時の表示ちらつきを抑える](https://github.com/AnaTofuZ/houtougumi-memorial/pull/10)
  - Noto Sans JPとQuicksandを`font-display: block`へ変更
  - 各ページの見出しへ既存の`fade-in-up`を適用
  - CIとCloudflare buildは成功

日本語フォントのAstro一括preloadは121ファイルを生成したため不採用。`font-display: optional`も初回表示で代替フォントが固定され、デザインが変わるため不採用。

## View Transitionの判断基準

- 今回の目的はNavbarと本文切り替えの視覚的なちらつき軽減であり、アプリ状態の保持ではない。
- ネイティブView TransitionならMPA、ページごとのHTML、既存スクリプトの実行方式を維持できる。
- NavbarのDOM自体を保持する必要が出た場合のみ、`<ClientRouter />`と`transition:persist`を検討する。
- `ClientRouter`を導入する場合、`src/layouts/BaseLayout.astro`のIntersectionObserver初期化を`astro:page-load`対応にする必要がある。

## その次の未完了作業

音楽ページのYouTube埋め込み下に不自然な空白が出る問題を、別PRで修正する。

- 作業用の空ブランチ: `agent/fix-music-youtube-layout`
- 現在は`lite-youtube-embed`と`src/components/YoutubeEmbed.astro`を使用中。
- ユーザー了承済みの方針は`react-lite-youtube-embed`への置き換え。
- 初期表示でYouTube iframeを読み込まないこと、16:9の高さ、クリック後の再生、キーボード操作を確認する。

## 継続ルール

- 変更は必ずコミットする。
- 大きな変更はブランチを分け、レビュー可能な通常PRにする。Draftにはしない。
- ユーザー確認なしに本番デプロイしない。
- ラスター画像は原則`src/assets/`に置き、Astroの`Image`または`Picture`で最適化する。
- 意図のないHTMLコメントを生成HTMLへ含めない。
- デザイン変更を伴わない性能改善を優先する。
- 問い合わせ先: 八雲アナグラ（@AnaTofuZ / anatofuz@gmail.com）

## 基本確認

```sh
npm ci
npm run check
npm run build
npm audit --omit=dev
```

リリース全体の残作業は`RELEASE_CHECKLIST.md`を参照する。
