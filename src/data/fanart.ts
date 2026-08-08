import { getImage } from 'astro:assets';
import kari from '../assets/images/kari.png';

export interface FanArt {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  artist: string;
  artistLink?: string;
  tags?: string[];
  members?: ('momojiru' | 'boss' | 'shirei')[];
}

const placeholder = await getImage({ src: kari, width: 800, format: 'webp' });
const placeholderImage = {
  src: placeholder.src,
  width: Number(placeholder.attributes.width),
  height: Number(placeholder.attributes.height),
};

// ↓ ファンイラストの情報に書き換えてください
// 画像は src/assets/images/fanart/ に配置してください
export const fanarts: FanArt[] = [
  {
    id: '1',
    ...placeholderImage,
    alt: 'ほうとう組。ファンアート 1',
    artist: '（作者名）',
    tags: ['3人'],
    members: ['momojiru', 'boss', 'shirei'],
  },
  {
    id: '2',
    ...placeholderImage,
    alt: 'ほうとう組。ファンアート 2',
    artist: '（作者名）',
    tags: ['宝灯桃汁'],
    members: ['momojiru'],
  },
  {
    id: '3',
    ...placeholderImage,
    alt: 'ほうとう組。ファンアート 3',
    artist: '（作者名）',
    tags: ['ボス'],
    members: ['boss'],
  },
  {
    id: '4',
    ...placeholderImage,
    alt: 'ほうとう組。ファンアート 4',
    artist: '（作者名）',
    tags: ['司令官'],
    members: ['shirei'],
  },
  {
    id: '5',
    ...placeholderImage,
    alt: 'ほうとう組。ファンアート 5',
    artist: '（作者名）',
    tags: ['3人'],
    members: ['momojiru', 'boss', 'shirei'],
  },
  {
    id: '6',
    ...placeholderImage,
    alt: 'ほうとう組。ファンアート 6',
    artist: '（作者名）',
    tags: ['宝灯桃汁', 'ボス'],
    members: ['momojiru', 'boss'],
  },
];
