export interface Song {
  id: string;
  title: string;
  artists: string;
  description: string;
  youtubeId?: string;
  youtubeUrl?: string;
  releaseDate: string;
  thumbnail?: string;
  tags: string[];
  featured?: boolean;
}

export const songs: Song[] = [
  {
    id: 'song-dummy-1',
    title: 'ダミー楽曲タイトル①',
    artists: 'ほうとう組',
    description:
      'これはダミーの曲説明文です。オリジナル楽曲についての紹介文が入ります。',
    youtubeId: 'dQw4w9WgXcQ',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    releaseDate: '2023-05-20',
    tags: ['オリジナル曲', 'ほうとう組'],
    featured: true,
  },
  {
    id: 'song-dummy-2',
    title: 'ダミー楽曲タイトル②',
    artists: 'ほうとう組',
    description: 'これはダミーの曲説明文です。楽曲の説明文が入ります。',
    releaseDate: '2024-01-01',
    tags: ['オリジナル曲'],
  },
];

export const featuredSong = songs.find((s) => s.featured) ?? songs[0];
