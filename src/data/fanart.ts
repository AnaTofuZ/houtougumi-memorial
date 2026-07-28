export interface FanArt {
  id: string;
  src: string;
  alt: string;
  artist: string;
  artistLink?: string;
  tags?: string[];
  members?: ('momojiru' | 'boss' | 'shirei')[];
}

// ↓ ファンイラストの情報に書き換えてください
// 画像は public/images/fanart/ に配置してください
export const fanarts: FanArt[] = [
  {
    id: '1',
    src: '/images/kari.png',
    alt: 'ほうとう組 ファンアート 1',
    artist: '（作者名）',
    tags: ['3人'],
    members: ['momojiru', 'boss', 'shirei'],
  },
  {
    id: '2',
    src: '/images/kari.png',
    alt: 'ほうとう組 ファンアート 2',
    artist: '（作者名）',
    tags: ['宝灯桃汁'],
    members: ['momojiru'],
  },
  {
    id: '3',
    src: '/images/kari.png',
    alt: 'ほうとう組 ファンアート 3',
    artist: '（作者名）',
    tags: ['ボス'],
    members: ['boss'],
  },
  {
    id: '4',
    src: '/images/kari.png',
    alt: 'ほうとう組 ファンアート 4',
    artist: '（作者名）',
    tags: ['司令官'],
    members: ['shirei'],
  },
  {
    id: '5',
    src: '/images/kari.png',
    alt: 'ほうとう組 ファンアート 5',
    artist: '（作者名）',
    tags: ['3人'],
    members: ['momojiru', 'boss', 'shirei'],
  },
  {
    id: '6',
    src: '/images/kari.png',
    alt: 'ほうとう組 ファンアート 6',
    artist: '（作者名）',
    tags: ['宝灯桃汁', 'ボス'],
    members: ['momojiru', 'boss'],
  },
];
