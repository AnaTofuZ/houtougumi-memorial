import siteArchive from '../../data/history/houtoumomojiru-posts.json';
import historyReview from '../../data/history/history-review.json';
import youtubeArchive from '../../data/history/youtube-entries.json';
import noticeArchive from '../../data/x/history-notices-and-spaces.json';
import recentArchive from '../../data/x/houtou-momojiru-timeline-capture.json';
import type { TimelineCategory } from './timeline';

export interface HistoryEntry {
  id: string;
  date: string;
  category: TimelineCategory;
  sourceLabel: string;
  title: string;
  description: string;
  url: string;
}

type HistoryReview = {
  excluded: string[];
  edits: Record<string, Partial<Pick<HistoryEntry, 'title' | 'description'>>>;
};

type XPost = {
  id: string;
  authorHandle?: string;
  postedAt: string | null;
  text: string;
  url: string;
};

const cleanLines = (lines: string[]) => {
  while (/^[\d,.]+(?:万)?$/.test(lines.at(-1)?.trim() ?? '')) lines.pop();
  return lines
    .map((line) => line.trim())
    .filter((line) => line && !/^(さらに表示|画像|動画)$/.test(line) && !/^https?:\/?\/?$/.test(line));
};

const ownLines = (text: string) => {
  const lines = text.split('\n');
  const divider = lines.indexOf('·');
  const body = divider < 0 ? lines : lines.slice(divider + 2);
  const quote = body.indexOf('引用');
  return cleanLines(quote < 0 ? body : body.slice(0, quote));
};

const portalText = (text: string) => {
  let content = ownLines(text);

  if (content[0]?.startsWith('返信先:')) content = content.slice(3);

  const generic = /^(?:【?お知らせ|【?告知|重大告知|配信お知らせ)/;
  const titleLines = generic.test(content[0] ?? '') && content[1] ? 2 : 1;
  const rawTitle = content.slice(0, titleLines).join(' ');
  const title = rawTitle.length > 72 ? `${rawTitle.slice(0, 71)}…` : rawTitle || '活動記録';
  const summary = content.slice(titleLines).join(' ').replace(/\s+/g, ' ').trim();
  return {
    title,
    description: summary ? `${summary.slice(0, 220)}${summary.length > 220 ? '…' : ''}` : 'Xで共有された活動記録です。',
  };
};

const allowedHandles = new Set(['houtou_momojiru', 'momojiru_boss', 'shireikan_mmjr']);
const curatedXPostIds = new Set([
  '1636753425718476801', // YouTube登録者1,000人達成
  '1653010070953938945', // オフイベント後の新しい試み
  '1809163853311406098', // 里の駅コラボパン
  '1854638709175730615', // 里の駅イベント
  '1895778802615402874', // 北原功士先生による描き下ろし
  '1926449062477279637', // コラボドリンク期間延長
  '1963927930637344781', // 3周年コラボフード
  '1967860007707549898', // 公式アンバサダー企画
  '1979158581250560081', // 3周年重大告知①
  '1979160019523567861', // 3周年重大告知②
  '1979161056355455243', // 3周年重大告知③
  '1979161868062331154', // 3周年重大告知④
  '1979163317936550191', // 3周年重大告知⑤
  '1987507135333482819', // 夜ファンミーティング
  '1992405236892229764', // 甲州宝灯パン
  '2003416696355455041', // 引退のお知らせ
  '2014691437682786710', // ホテル湖龍コラボ
  '2015049445558329811', // 最後のリアルイベント
  '2016798482561171689', // 山梨ぐるっとスタンプラリー
  '2045446379045359855', // 引退後コンテンツの案内
  '2081942805380006384', // もも市民再会の日
  '2081942809817514406', // もも市民再会の日の説明
]);

const archiveEntries = [
  {
    id: 'youtube-Jgf07PIxCfM', date: '2022-09-03', category: '配信', sourceLabel: 'YouTube',
    title: '【#新人vtuber #初配信】はじめまして！#宝灯桃汁 ナリッ！！！！！【#ご当地vtuber ／#デビュー配信】',
    description: '宝灯桃汁の初配信アーカイブです。', url: 'https://www.youtube.com/watch?v=Jgf07PIxCfM',
  },
  {
    id: 'youtube-kGFPFrqIyjg', date: '2022-12-31', category: '配信', sourceLabel: 'YouTube',
    title: '24時間生配信！前半なり！！宝灯桃汁with運営！？深夜もノンストップ企画だらけの年越し祭り！',
    description: '初の24時間生配信・前半のアーカイブです。', url: 'https://www.youtube.com/watch?v=kGFPFrqIyjg',
  },
  {
    id: 'youtube-EHgia-F6DFk', date: '2023-01-01', category: '配信', sourceLabel: 'YouTube',
    title: '24時間生配信！後半なり！宝灯桃汁with運営！？深夜もノンストップ企画だらけの年越し祭り',
    description: '初の24時間生配信・後半のアーカイブです。', url: 'https://www.youtube.com/watch?v=EHgia-F6DFk',
  },
  {
    id: 'youtube-Gq-lmO06B6E', date: '2023-04-16', category: '配信', sourceLabel: 'YouTube',
    title: '【#新人Vtuber /#誕生日配信 】桃汁ちゃんお誕生日おめでとう配信【#宝灯桃汁 /#ご当地vtuber 】',
    description: '2023年の誕生日記念配信アーカイブです。', url: 'https://www.youtube.com/watch?v=Gq-lmO06B6E',
  },
  {
    id: 'space-1ZkJzXbQWnqKv', date: '2023-07-02', category: '配信', sourceLabel: 'X Space',
    title: '桃汁ちゃん6月の活動ふりかえり', description: '宝灯桃汁が初めて開催したX Spaceの録音です。',
    url: 'https://x.com/i/spaces/1ZkJzXbQWnqKv',
  },
  {
    id: 'youtube-f9D9tKbwn7A', date: '2023-09-17', category: '配信', sourceLabel: 'YouTube',
    title: '【#新人vtuber 】24時間配信　前半戦　＃宝灯桃汁24時間夏祭り【#雑談配信 /#作業用bgm 】#宝灯桃汁',
    description: '「宝灯桃汁24時間夏祭り」前半のアーカイブです。', url: 'https://www.youtube.com/watch?v=f9D9tKbwn7A',
  },
  {
    id: 'youtube-W7g4JHTGWSg', date: '2023-09-18', category: '配信', sourceLabel: 'YouTube',
    title: '【#新人vtuber 】24時間配信　後半戦　＃宝灯桃汁24時間夏祭り【#雑談配信 /#作業用bgm 】#宝灯桃汁',
    description: '「宝灯桃汁24時間夏祭り」後半のアーカイブです。', url: 'https://www.youtube.com/watch?v=W7g4JHTGWSg',
  },
  {
    id: 'youtube-quQiuegH4ho', date: '2023-09-03', category: '配信', sourceLabel: 'YouTube',
    title: '【#新人vtuber /#ご当地vtuber 】デビュー１周年記念配信！＃新衣装 お披露目＆オリジナルソング公開＆新グッズ発表❤【#雑談配信 /#作業用bgm 】#宝灯桃汁',
    description: 'デビュー1周年記念配信のアーカイブです。', url: 'https://www.youtube.com/watch?v=quQiuegH4ho',
  },
  {
    id: 'youtube-D3tTk0aAtmk', date: '2024-04-13', category: '配信', sourceLabel: 'YouTube',
    title: '【#誕生日配信 /#記念配信 】祝え！宝灯桃汁生誕祭2024！！重大発表＆新◯◯◯お披露目！初見さんも歓迎なり！！【#宝灯桃汁】#新人vtuber',
    description: '2024年の誕生日記念配信アーカイブです。', url: 'https://www.youtube.com/watch?v=D3tTk0aAtmk',
  },
  {
    id: 'space-1MYGNMOjYyVKw', date: '2024-10-11', category: '配信', sourceLabel: 'X Space',
    title: '里の駅さまコラボについて！2周年記念配信今夜！なり！', description: '里の駅コラボと2周年記念配信について話したX Spaceの録音です。',
    url: 'https://x.com/i/spaces/1MYGNMOjYyVKw',
  },
  {
    id: 'youtube-cgWwQBkqalI', date: '2024-10-11', category: '配信', sourceLabel: 'YouTube',
    title: '【#記念配信 #一万人記念】#宝灯桃汁2周年& #1万人達成記念 配信！ 豪華5連続 #重大告知 あり！【#大切なお知らせ】',
    description: '活動2周年とYouTube登録者1万人達成の記念配信アーカイブです。', url: 'https://www.youtube.com/watch?v=cgWwQBkqalI',
  },
  {
    id: 'space-1LyxBWmdZAzKN', date: '2025-03-22', category: '配信', sourceLabel: 'X Space',
    title: '【警告】#大切なおしらせ #桃汁オフイベ2025に来た人に重大なおしらせ',
    description: '桃汁オフイベ2025後の大切なお知らせを伝えたX Spaceの録音です。', url: 'https://x.com/i/spaces/1LyxBWmdZAzKN',
  },
  {
    id: 'youtube-D-hS3dBvUUQ', date: '2025-04-12', category: '配信', sourceLabel: 'YouTube',
    title: '【お披露目（？）】#宝灯桃汁生誕祭2025　誕生日プレゼントで〇〇になっちゃったナリ！【Vtuber】#宝灯桃汁 #新人Vtuber',
    description: '2025年の誕生日記念配信アーカイブです。', url: 'https://www.youtube.com/watch?v=D-hS3dBvUUQ',
  },
  {
    id: 'youtube-5GtGKTeVPTs', date: '2025-10-17', category: '配信', sourceLabel: 'YouTube',
    title: '【お披露目】#宝灯桃汁3周年　告知５連発！【Vtuber】#宝灯桃汁 #新人Vtuber',
    description: '活動3周年記念配信のアーカイブです。', url: 'https://www.youtube.com/watch?v=5GtGKTeVPTs',
  },
  {
    id: 'youtube-R54rffgmv9c', date: '2026-01-24', category: '配信', sourceLabel: 'YouTube',
    title: '【#卒業 】宝灯桃汁VTuber引退。最後の卒業配信【#vtuber /＃作業BGM 】#宝灯桃汁',
    description: '宝灯桃汁の最後の卒業配信アーカイブです。', url: 'https://www.youtube.com/watch?v=R54rffgmv9c',
  },
  {
    id: 'youtube-W5sSeP-KbaY', date: '2026-02-06', category: '配信', sourceLabel: 'YouTube',
    title: '【48時間生配信】1枠目オープニング＆絶叫ホラゲ耐久 ホラゲ苦手なVtuber運営にやらせてみた #宝灯桃汁 #運営配信 #jsp #歌枠 #日本事故物件監視協会 【#作業BGM 】',
    description: 'ほうとう組。運営による48時間生配信、最初の枠です。', url: 'https://www.youtube.com/watch?v=W5sSeP-KbaY',
  },
  {
    id: 'youtube-To_6Lyck5PM', date: '2026-02-09', category: '配信', sourceLabel: 'YouTube',
    title: '【48時間生配信】ラスト枠　48時間生配信、感動のエンディング！！ #宝灯桃汁 ⁠運営配信【#作業BGM 】',
    description: 'ほうとう組。運営による48時間生配信、最後の枠です。', url: 'https://www.youtube.com/watch?v=To_6Lyck5PM',
  },
  {
    id: 'youtube-iounaUm33w4', date: '2026-04-25', category: '配信', sourceLabel: 'YouTube',
    title: '【これが本当にラスト】#ほうとう組引退配信 退職金集金します。今まで本当にありがとうございました！【#vtuber 】#宝灯桃汁',
    description: 'ほうとう組。運営による最後の配信アーカイブです。', url: 'https://www.youtube.com/watch?v=iounaUm33w4',
  },
  {
    id: 'space-1oKMvvooOgkGQ', date: '2026-08-07', category: '配信', sourceLabel: 'X Space',
    title: 'みなさまご無沙汰してます。宝灯桃汁運営でふ。', description: '「もも市民再会の日」を前に、ボスと司令官が再会したX Spaceの録音です。',
    url: 'https://x.com/i/spaces/1oKMvvooOgkGQ',
  },
];

// ponytail: 保存元は管理済みWordPress。複雑なHTMLが入るようになったらHTMLパーサーへ置換する。
const plainText = (html: string) => html
  .replace(/<[^>]+>/g, ' ')
  .replace(/&(?:nbsp|hellip);/g, ' ')
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/\s+/g, ' ')
  .trim();

const categoryOf = (text: string): TimelineCategory => {
  if (/オフイベ|イベント|祭り|ファンミ|バスツアー|一日店長|現地|スタンプラリー/.test(text)) return 'オフイベ';
  if (/グッズ|販売|商品|福袋|アクキー|アクリル|ブロマイド|コラボメニュー|切り抜き酒|再販/.test(text)) return 'グッズ販売';
  if (/メディア|テレビ|TV|ラジオ|FM ?FUJI|新聞|雑誌|記事|掲載|放映|番組|インタビュー|CM|紹介され|動画参加/.test(text)) return 'メディア掲載';
  if (/配信.*(?:お知らせ|おしらせ|開催決定)|(?:お知らせ|おしらせ|開催決定).*配信/.test(text)) return '思い出';
  if (/配信|動画|スペース|YouTube|歌枠|生放送/.test(text)) return '配信';
  return '思い出';
};

const xPosts = new Map<string, XPost>(
  [...noticeArchive.posts, ...recentArchive.posts].map((post) => [post.id, post as XPost]),
);

const allHistoryEntries: HistoryEntry[] = [
  ...(youtubeArchive.entries as HistoryEntry[]),
  ...archiveEntries.map((entry) => ({ ...entry, category: '配信' as const })),
  ...siteArchive.posts.map((post) => {
    const title = plainText(post.title.rendered);
    const description = plainText(post.excerpt.rendered) || '公式サイトに掲載された活動記録です。';
    return {
      id: `site-${post.id}`,
      date: post.date,
      category: categoryOf(title),
      sourceLabel: '公式サイト',
      title,
      description,
      url: post.link,
    };
  }),
  ...[...xPosts.values()]
    .filter((post) => curatedXPostIds.has(post.id) && allowedHandles.has(new URL(post.url).pathname.split('/')[1]?.toLowerCase()))
    .map((post) => {
      const portal = portalText(post.text);
      const handle = new URL(post.url).pathname.split('/')[1];
      return {
        id: `x-${post.id}`,
        date: post.postedAt ?? '1970-01-01',
        category: categoryOf(`${portal.title} ${portal.description}`),
        sourceLabel: `X · @${handle}`,
        ...portal,
        url: post.url,
      };
    }),
];

export const historyReviewEntries: HistoryEntry[] = [...new Map(
  allHistoryEntries.map((entry) => [entry.id, entry]),
).values()].sort((a, b) => a.date.localeCompare(b.date));

const review = historyReview as HistoryReview;
const excludedHistoryIds = new Set(review.excluded);
export const historyEntries = historyReviewEntries
  .filter((entry) => !excludedHistoryIds.has(entry.id))
  .map((entry) => ({ ...entry, ...review.edits[entry.id] }));

export const historyPageSize = 24;
export const historyPageCount = Math.ceil(historyEntries.length / historyPageSize);
