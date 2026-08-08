import source from '../../data/x/arigato-nasu-houtougumi.json';
import excludedIds from '../../data/x/fan-comment-excluded-ids.json';
import sourceOverrides from '../../data/x/fan-comment-source-overrides.json';

export interface FanComment {
  id: string;
  name: string;
  handle: string;
  comment: string;
  date: string;
  sourceLink: string;
  avatar: string;
  platform: 'X';
}

const assetRoot = 'https://assets.houtougumi-memorial.anatofuz.net/comments/avatars';
const excluded = new Set(excludedIds);
const overrides = new Map(sourceOverrides.map(({ wrapperId, ...post }) => [wrapperId, post]));

export const fanComments: FanComment[] = source.posts.flatMap((post) => {
  if (excluded.has(post.id)) return [];
  const displayed = overrides.get(post.id) ?? post;
  const avatarName = new URL(post.author.avatarUrl).pathname.split('/').at(-1);
  if (!avatarName) return [];
  return [{
    id: displayed.id,
    name: post.author.displayName,
    handle: post.author.handle,
    comment: displayed.text,
    date: displayed.postedAt.slice(0, 10),
    sourceLink: displayed.url,
    avatar: `${assetRoot}/${avatarName}`,
    platform: 'X',
  }];
});

if (fanComments.length !== source.posts.length - excluded.size) throw new Error('ファンコメントの除外件数が不正です');
if (new Set(fanComments.map((comment) => comment.id)).size !== fanComments.length) throw new Error('ファンコメントが重複しています');
