import { getImage } from 'astro:assets';
import kari from '../assets/images/kari.png';

export interface Illustration {
  src: string;
  width: number;
  height: number;
  alt: string;
}

const placeholder = await getImage({ src: kari, width: 640, format: 'webp' });
const placeholderImage = {
  src: placeholder.src,
  width: Number(placeholder.attributes.width),
  height: Number(placeholder.attributes.height),
};

export interface Archive {
  title: string;
  url: string;
  date: string;
  description?: string;
}

export interface MemberProfile {
  id: 'momojiru' | 'boss' | 'shirei';
  name: string;
  nameEn: string;
  color: string;
  colorLight: string;
  colorDark: string;
  tagline: string;
  profile: string;
  illustrations: Illustration[];
  episodes: { title: string; description: string }[];
  archives: Archive[];
  quotes: string[];
}

export const members: MemberProfile[] = [
  {
    id: 'momojiru',
    name: '宝灯桃汁',
    nameEn: 'Momojiru-chan',
    color: '#FFB7C5',
    colorLight: '#FFE4EC',
    colorDark: '#C55070',
    tagline: 'これはダミーのキャッチコピーです。',
    profile:
      'これはダミーのプロフィール文です。\n宝灯桃汁についての説明文が入ります。',
    illustrations: [
      { ...placeholderImage, alt: '宝灯桃汁 立ち絵 1（仮）' },
      { ...placeholderImage, alt: '宝灯桃汁 立ち絵 2（仮）' },
      { ...placeholderImage, alt: '宝灯桃汁 立ち絵 3（仮）' },
    ],
    episodes: [
      {
        title: 'ダミーエピソードタイトル①',
        description: 'これはダミーのエピソード説明文です。エピソードの内容が入ります。',
      },
      {
        title: 'ダミーエピソードタイトル②',
        description: 'これはダミーのエピソード説明文です。エピソードの内容が入ります。',
      },
    ],
    archives: [
      {
        title: 'ダミーアーカイブタイトル①',
        url: 'https://www.youtube.com/',
        date: '2023-04-01',
        description: 'これはダミーのアーカイブ説明文です。',
      },
    ],
    quotes: [
      '「ダミーの語録①が入ります」',
      '「ダミーの語録②が入ります」',
      '「ダミーの語録③が入ります」',
    ],
  },
  {
    id: 'boss',
    name: 'ボス',
    nameEn: 'Boss',
    color: '#B39DDB',
    colorLight: '#EDE4FF',
    colorDark: '#6B4D9E',
    tagline: 'これはダミーのキャッチコピーです。',
    profile:
      'これはダミーのプロフィール文です。\nボスについての説明文が入ります。',
    illustrations: [
      { ...placeholderImage, alt: 'ボス 立ち絵 1（仮）' },
      { ...placeholderImage, alt: 'ボス 立ち絵 2（仮）' },
      { ...placeholderImage, alt: 'ボス 立ち絵 3（仮）' },
    ],
    episodes: [
      {
        title: 'ダミーエピソードタイトル①',
        description: 'これはダミーのエピソード説明文です。エピソードの内容が入ります。',
      },
      {
        title: 'ダミーエピソードタイトル②',
        description: 'これはダミーのエピソード説明文です。エピソードの内容が入ります。',
      },
    ],
    archives: [
      {
        title: 'ダミーアーカイブタイトル①',
        url: 'https://www.youtube.com/',
        date: '2023-04-01',
        description: 'これはダミーのアーカイブ説明文です。',
      },
    ],
    quotes: [
      '「ダミーの語録①が入ります」',
      '「ダミーの語録②が入ります」',
      '「ダミーの語録③が入ります」',
    ],
  },
  {
    id: 'shirei',
    name: '司令官',
    nameEn: 'Shirei-kan',
    color: '#7ECEC4',
    colorLight: '#C8F0EC',
    colorDark: '#4BA89E',
    tagline: 'これはダミーのキャッチコピーです。',
    profile:
      'これはダミーのプロフィール文です。\n司令官についての説明文が入ります。',
    illustrations: [
      { ...placeholderImage, alt: '司令官 立ち絵 1（仮）' },
      { ...placeholderImage, alt: '司令官 立ち絵 2（仮）' },
      { ...placeholderImage, alt: '司令官 立ち絵 3（仮）' },
    ],
    episodes: [
      {
        title: 'ダミーエピソードタイトル①',
        description: 'これはダミーのエピソード説明文です。エピソードの内容が入ります。',
      },
      {
        title: 'ダミーエピソードタイトル②',
        description: 'これはダミーのエピソード説明文です。エピソードの内容が入ります。',
      },
    ],
    archives: [
      {
        title: 'ダミーアーカイブタイトル①',
        url: 'https://www.youtube.com/',
        date: '2023-04-01',
        description: 'これはダミーのアーカイブ説明文です。',
      },
    ],
    quotes: [
      '「ダミーの語録①が入ります」',
      '「ダミーの語録②が入ります」',
      '「ダミーの語録③が入ります」',
    ],
  },
];

export function getMember(id: string): MemberProfile | undefined {
  return members.find((m) => m.id === id);
}
