export type TimelineCategory = '配信' | 'オフイベ' | 'グッズ販売' | '思い出';

export interface TimelineEvent {
  id: string;
  date: string;
  category: TimelineCategory;
  title: string;
  description: string;
  link?: string;
}

export const categoryColors: Record<TimelineCategory, string> = {
  '配信': '#2AD1B2',
  'オフイベ': '#EE3F87',
  'グッズ販売': '#40ACFA',
  '思い出': '#FF6FA8',
};


export const timeline: TimelineEvent[] = [
  {
    id: '1',
    date: '2023-04-01',
    category: '配信',
    title: 'ダミーイベントタイトル①',
    description: 'これはダミーのイベント説明文です。あゆみの内容が入ります。',
  },
  {
    id: '2',
    date: '2023-05-20',
    category: '配信',
    title: 'ダミーイベントタイトル②',
    description: 'これはダミーのイベント説明文です。あゆみの内容が入ります。',
    link: 'https://www.youtube.com/',
  },
  {
    id: '3',
    date: '2023-07-15',
    category: 'グッズ販売',
    title: 'ダミーイベントタイトル③',
    description: 'これはダミーのイベント説明文です。あゆみの内容が入ります。',
  },
  {
    id: '4',
    date: '2023-09-03',
    category: 'オフイベ',
    title: 'ダミーイベントタイトル④',
    description: 'これはダミーのイベント説明文です。あゆみの内容が入ります。',
  },
  {
    id: '5',
    date: '2023-10-31',
    category: '思い出',
    title: 'ダミーイベントタイトル⑤',
    description: 'これはダミーのイベント説明文です。あゆみの内容が入ります。',
  },
  {
    id: '6',
    date: '2024-01-01',
    category: '配信',
    title: 'ダミーイベントタイトル⑥',
    description: 'これはダミーのイベント説明文です。あゆみの内容が入ります。',
  },
  {
    id: '7',
    date: '2024-03-14',
    category: 'グッズ販売',
    title: 'ダミーイベントタイトル⑦',
    description: 'これはダミーのイベント説明文です。あゆみの内容が入ります。',
  },
  {
    id: '8',
    date: '2024-06-01',
    category: 'オフイベ',
    title: 'ダミーイベントタイトル⑧',
    description: 'これはダミーのイベント説明文です。あゆみの内容が入ります。',
  },
];
