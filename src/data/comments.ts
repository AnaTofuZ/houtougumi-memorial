export interface FanComment {
  id: string;
  handle: string;
  comment: string;
  date?: string;
  platform?: 'Twitter' | 'YouTube' | 'その他';
}

export const fanComments: FanComment[] = [
  {
    id: '1',
    handle: '@dummy_001',
    comment: 'これはダミーのコメントです。ファンコメントの文章が入ります。',
    date: '2024-04-10',
    platform: 'Twitter',
  },
  {
    id: '2',
    handle: '@dummy_002',
    comment: 'こちらもダミーのコメントです。実際のファンコメントが入ります。',
    date: '2024-03-25',
    platform: 'Twitter',
  },
  {
    id: '3',
    handle: '@dummy_003',
    comment: 'ダミーテキストが入ります。ファンの声の文章がここに並びます。',
    date: '2024-02-18',
    platform: 'YouTube',
  },
  {
    id: '4',
    handle: '@dummy_004',
    comment: 'こちらはダミーのコメントです。正式なコメントは後日更新予定です。',
    date: '2024-01-30',
    platform: 'Twitter',
  },
  {
    id: '5',
    handle: '@dummy_005',
    comment: 'ダミーコメント⑤。ファンコメントの文章が入ります。',
    date: '2024-05-12',
    platform: 'Twitter',
  },
  {
    id: '6',
    handle: '@dummy_006',
    comment: 'ダミーコメント⑥。実際のファンの声がここに掲載されます。',
    date: '2024-04-28',
    platform: 'YouTube',
  },
  {
    id: '7',
    handle: '@dummy_007',
    comment: 'ダミーコメント⑦。ファンコメントの文章が入ります。',
    date: '2024-05-20',
    platform: 'Twitter',
  },
  {
    id: '8',
    handle: '@dummy_008',
    comment: 'ダミーコメント⑧。正式なコメントは後日更新予定です。',
    date: '2024-03-01',
    platform: 'Twitter',
  },
];
