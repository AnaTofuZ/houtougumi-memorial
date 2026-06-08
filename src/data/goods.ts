export interface GoodsItem {
  id: string;
  name: string;
  description: string;
  price?: string;
  image: string;
  shopUrl?: string;
  status: '販売中' | '販売終了' | '近日公開';
  members?: ('momojiru' | 'boss' | 'shirei')[];
}

export const goodsItems: GoodsItem[] = [
  {
    id: '1',
    name: 'ダミー商品名①',
    description: 'これはダミーの商品説明文です。グッズの説明文が入ります。',
    price: '¥0,000（税込）',
    image: '/images/goods/acrylstand.svg',
    shopUrl: 'https://example.com/shop',
    status: '販売中',
    members: ['momojiru', 'boss', 'shirei'],
  },
  {
    id: '2',
    name: 'ダミー商品名②',
    description: 'これはダミーの商品説明文です。グッズの説明文が入ります。',
    price: '¥0,000（税込）',
    image: '/images/goods/badge.svg',
    shopUrl: 'https://example.com/shop',
    status: '販売中',
    members: ['momojiru', 'boss', 'shirei'],
  },
  {
    id: '3',
    name: 'ダミー商品名③',
    description: 'これはダミーの商品説明文です。グッズの説明文が入ります。',
    price: '¥0,000（税込）',
    image: '/images/goods/clearfile.svg',
    shopUrl: '',
    status: '販売終了',
    members: ['momojiru', 'boss', 'shirei'],
  },
  {
    id: '4',
    name: 'ダミー商品名④',
    description: 'これはダミーの商品説明文です。グッズの説明文が入ります。',
    price: '¥0,000（税込）',
    image: '/images/goods/plushie-momojiru.svg',
    status: '近日公開',
    members: ['momojiru'],
  },
];
