import merged from '../../data/fanart-twitter-merged.json';

interface FanArtBase {
  id: string;
  alt: string;
  artist: string;
  artistLink: string;
  sourceLink: string;
  tags: string[];
}

export interface FanArtImage extends FanArtBase {
  type: 'image';
  image: string;
}

export interface FanArtVideo extends FanArtBase {
  type: 'video';
  src: string;
  poster: string;
  width: number;
  height: number;
}

export type FanArt = FanArtImage | FanArtVideo;

interface MergedMedia {
  type: 'image' | 'video';
  url: string;
  posterUrl?: string;
  width?: number;
  height?: number;
}

const seen = new Set<string>();

export const fanarts: FanArt[] = merged.posts.flatMap((post) => {
  const common = {
    artist: post.author.name,
    artistLink: post.author.url,
    sourceLink: post.sourceUrl,
    tags: post.tags,
  };

  return (post.media as MergedMedia[]).flatMap((item): FanArt[] => {
    if (seen.has(item.url)) return [];
    seen.add(item.url);

    if (item.type === 'image') {
      return [{
        ...common,
        id: `image-${item.url.split('/').at(-1)}`,
        type: 'image',
        image: item.url,
        alt: `${post.author.name}さんの投稿画像`,
      }];
    }
    if (!item.posterUrl) return [];
    return [{
      ...common,
      id: `video-${item.url.split('/').at(-1)}`,
      type: 'video',
      src: item.url,
      poster: item.posterUrl,
      width: item.width ?? 0,
      height: item.height ?? 0,
      alt: `${post.author.name}さんの投稿動画`,
    }];
  });
});
