import source from '../../data/x/arigato-nasu-houtougumi.json';
import fanCommentIds from '../../data/x/fan-comment-ids.json';

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

const postsById = new Map(source.posts.map((post) => [post.id, post]));
const assetRoot = 'https://assets.houtougumi-memorial.anatofuz.net/comments/avatars';

export const fanComments: FanComment[] = fanCommentIds.flatMap((id) => {
  const post = postsById.get(id);
  if (!post) return [];
  const avatarName = new URL(post.author.avatarUrl).pathname.split('/').at(-1);
  if (!avatarName) return [];
  return [{
    id,
    name: post.author.displayName,
    handle: post.author.handle,
    comment: post.text,
    date: post.postedAt.slice(0, 10),
    sourceLink: post.url,
    avatar: `${assetRoot}/${avatarName}`,
    platform: 'X',
  }];
});

if (fanComments.length !== fanCommentIds.length) throw new Error('ファンコメントの元投稿が不足しています');
