export interface Song {
  id: string;
  title: string;
  artists: string;
  description: string;
  youtubeId: string;
  youtubeUrl: string;
  releaseDate: string;
  tags: string[];
}

export const playlistUrl =
  'https://www.youtube.com/playlist?list=PLFG7_zWC6HmPrzbcR3BmHumo4q5iBhYDh';

export const songs: Song[] = [
  {
    id: 'shutoka-sennouchu',
    title: '首都化洗脳中',
    artists: '宝灯桃汁',
    description:
      'Vocal：宝灯桃汁\n\nMusic & Arrange：司令官（宝灯桃汁運営）\nLyric：ボス・司令官（宝灯桃汁運営）\nMovie：司令官（宝灯桃汁運営）\nIllust：司令官（宝灯桃汁運営）\nIllust：囮治屋 様',
    youtubeId: 'RYwThNYR8hY',
    youtubeUrl: 'https://www.youtube.com/watch?v=RYwThNYR8hY',
    releaseDate: '2023-09-08',
    tags: ['オリジナル曲'],
  },
  {
    id: 'nihao-listener',
    title: 'ニーハオ！リスナー！ウォーシーももじる！',
    artists: '宝灯桃汁',
    description:
      '山梨ご当地Vtuber宝灯桃汁のオリジナルソング第2弾！\n「ニーハオ！リスナー！ウォーシーももじる！」\n一人５千回は聞いておけナリ！！！！',
    youtubeId: 'g61xrJSOLJE',
    youtubeUrl: 'https://www.youtube.com/watch?v=g61xrJSOLJE',
    releaseDate: '2024-12-21',
    tags: ['オリジナル曲'],
  },
  {
    id: 'niconico-kumikyoku',
    title: '組曲『ニコニコ動画』',
    artists: '宝灯桃汁 feat. 運営（ほうとう組。）',
    description:
      'あの懐かしい名曲 組曲「ニコニコ動画」をほうとう組。で歌ってみたナリ！\n#桃汁オフイベ2025 に向けて市民も歌を覚えてくれナリよな！',
    youtubeId: 'mVjPjlbldkU',
    youtubeUrl: 'https://www.youtube.com/watch?v=mVjPjlbldkU',
    releaseDate: '2025-02-18',
    tags: ['歌ってみた'],
  },
  {
    id: 'bling-bang-bang-born',
    title: 'Bling-Bang-Bang-Born',
    artists: '宝灯桃汁',
    description:
      'もしもエヴァンゲリオン パイロット、シンジ、アスカ、レイが「Bling-Bang-Bang-Born」を歌ってみたら！\n山梨ご当地VTuber宝灯桃汁が Creepy Nuts「Bling-Bang-Bang-Born」 × TV Anime「マッシュル-MASHLE-」をエヴァパイロットの声真似で歌います！',
    youtubeId: 'LObGOO2J7GE',
    youtubeUrl: 'https://www.youtube.com/watch?v=LObGOO2J7GE',
    releaseDate: '2024-03-24',
    tags: ['歌ってみた', '声真似'],
  },
  {
    id: 'animal',
    title: 'アニマル',
    artists: '宝灯桃汁',
    description:
      '山梨ご当地Vtuber宝灯桃汁がエヴァンゲリオンの碇シンジの声真似で「アニマル」叫んでみた！',
    youtubeId: 'D738ex9VZRA',
    youtubeUrl: 'https://www.youtube.com/watch?v=D738ex9VZRA',
    releaseDate: '2022-09-19',
    tags: ['歌ってみた', '声真似'],
  },
];
