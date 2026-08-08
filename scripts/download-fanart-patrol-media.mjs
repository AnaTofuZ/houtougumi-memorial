import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';

const patrolIds = [
  '2037893657194586243',
  '2027387357377540403',
  '2007799837836918835',
  '2002204877871804552',
  '2001714895591739614',
  '1940050099478176052',
  '1754856000287584395',
  '1754399243337687412',
  '1753767815000301601',
  '1751240487963639956',
  '1747955296373469191',
  '1747955118174245044',
  '1746505379364913274',
  '1710673234084135297',
  '1623348747945254912',
  '1613551507919732736',
  '1575733994544455680',
  '1572594612702973954',
  '1556961476069376002',
];

const collageIds = [
  '2066722842973196697', '2056652444453769464', '2053340748343660978', '2049823748493365281',
  '2043533149721051359', '2033691829112345064', '2033550549162062265', '2030521865299689758',
  '2012101140973039704', '1992092373594358073', '1985634764897075590', '1985623516390310320',
  '1984241378533216556', '1984186307351036213', '1976052152700371323', '1961349346181402814',
  '1959525585161531556', '1957793416059691184', '1957792785911746660', '1946528746267455563',
  '1942779218213134358', '1939121629004734494', '1938117214881911264', '1938024958078361620',
  '1931956545245634989', '1925328374115049495', '1908655225487171692', '1908127523453784346',
  '1883640755081908672', '1875134474100547881', '1872411143266029977', '1867511962877538794',
  '1838529130666610764', '1838162499591700749', '1830923519892541935', '1822574858489782473',
  '1819909024152002712', '1819015903759270243', '1819012553215017092', '1819011113968943483',
  '1818648349698081170', '1818647197787078847', '1818645776568140018', '1818638292067532941',
  '1818635666613583957', '1818635313881006207', '1818632839057096882', '1814604149935513987',
  '1812050304277623095', '1809826387534180666', '1805810602826514472', '1805552596805108153',
  '1804282883278016582', '1793190930381410594', '1762870585477226832', '1754193272493465835',
  '1754178852535062572', '1742623314697388506', '1740960906253918668', '1736842979267199269',
  '1736676323622563869', '1733396626285429129', '1733038995662328225', '1732249446937976924',
  '1729256600052117610', '1727503934959632840', '1725799359747645692', '1719996995178524738',
  '1719657070671298921', '1719653354266329501', '1701468787491684509', '1700324894775664880',
  '1699787202241384623', '1699410746856407226', '1684685342513729536', '1680919845154746369',
  '1680522417238597633', '1672503272618463233', '1664847857227055105', '1664844678552854529',
  '1663600726839529473', '1662641270530138112', '1662474379786321921', '1662470055224020995',
  '1661801514523049984', '1661798876049981441', '1660898666763149312', '1660630583385673728',
  '1660627233906790400', '1660622173944549379', '1660613401817792512', '1660610684022059008',
  '1660609859128299520', '1660542629749358592', '1660541201764995072', '1660290392250806272',
  '1660283842249515009', '1660264403181391872', '1660261482914013186', '1660259143268327424',
  '1660146565842100224', '1660033790570553344', '1659900638690689026', '1659879744543002628',
  '1659823660557905920', '1659769517231476736', '1659766294194032642', '1659715796002820097',
  '1659652678555947008', '1659591746911875075', '1659576907678244866', '1659574287253245952',
  '1659570704197767169', '1659565159772475394', '1659559312568754177', '1659558818874019841',
  '1659553295239901185', '1659542319882960898', '1659540456156573696', '1659537377323524097',
  '1659532967398760448', '1659529252365279233',
];

const collage = process.argv.includes('--collage');
const ids = collage ? collageIds : patrolIds;
const slug = collage ? 'collage' : 'patrol';
const query = collage ? '#桃汁クソコラグランプリ' : '#桃汁パトロール';

const exportUrl = new URL(`../data/fanart-twitter-${slug}-export.json`, import.meta.url);
const manifestUrl = new URL(`../data/fanart-${slug}-media.json`, import.meta.url);
const imageOutputUrl = new URL(`../src/assets/images/fanart/twitter-${slug}/`, import.meta.url);
const videoOutputUrl = new URL(collage ? '../public/media/fanart/collage/' : '../public/media/fanart-patrol/', import.meta.url);
const checkOnly = process.argv.includes('--check');
const mediaOnly = process.argv.includes('--media-only');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const request = async (url) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'houtougumi-memorial fanart archival/1.0' },
    });
    if (response.ok) return response;
    if (attempt === 2) throw new Error(`${response.status}: ${url}`);
    await wait(5_000 * (attempt + 1));
  }
};

const getTweet = async (id) => {
  const response = await request(`https://api.fxtwitter.com/status/${id}`);
  const tweet = (await response.json()).tweet;
  if (!tweet) throw new Error(`投稿を取得できません: ${id}`);
  await wait(1_200);
  return tweet;
};

const media = (tweet) => (tweet?.media?.all ?? []).map((item) => ({
  type: item.type === 'photo' ? 'image' : 'video',
  id: item.id,
  sourceUrl: item.type === 'photo' ? item.url : item.url,
  posterUrl: item.thumbnail_url,
  width: item.width,
  height: item.height,
  duration: item.duration,
}));

const structuredTweet = (tweet) => ({
  sourceUrl: tweet.url,
  id: tweet.id,
  author: {
    name: tweet.author.name,
    handle: `@${tweet.author.screen_name}`,
    url: tweet.author.url,
  },
  postedAt: new Date(tweet.created_at).toISOString(),
  text: tweet.text,
  media: media(tweet),
});

const imageName = (rawUrl) => {
  const url = new URL(rawUrl);
  const extension = url.searchParams.get('format') ?? basename(url.pathname).match(/\.([^.]+)$/)?.[1];
  const mediaIdWithExtension = url.pathname.match(/\/(?:media|amplify_video_thumb|ext_tw_video_thumb|tweet_video_thumb)\/([^/]+)/)?.[1];
  const mediaId = mediaIdWithExtension && basename(mediaIdWithExtension, `.${extension}`);
  if (!extension || !mediaId) throw new Error(`画像名を判定できません: ${rawUrl}`);
  return `${mediaId}.${extension === 'jpeg' ? 'jpg' : extension}`;
};

const imageSource = (rawUrl) => {
  const url = new URL(rawUrl);
  if (url.pathname.startsWith('/media/')) url.searchParams.set('name', 'orig');
  return url.href;
};

const videoName = (rawUrl) => {
  const url = new URL(rawUrl);
  const mediaId = url.pathname.match(/\/(?:amplify_video|ext_tw_video)\/([^/]+)/)?.[1]
    ?? (url.pathname.startsWith('/tweet_video/') ? basename(url.pathname, '.mp4') : undefined);
  if (!mediaId) throw new Error(`動画名を判定できません: ${rawUrl}`);
  return `${mediaId}.mp4`;
};

const download = async (url, destination, expectedType) => {
  try {
    await access(destination);
    return;
  } catch {}
  const response = await request(url);
  if (!response.headers.get('content-type')?.startsWith(expectedType)) {
    throw new Error(`${expectedType}ではありません: ${url}`);
  }
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  await wait(1_200);
};

const allMedia = (posts) => posts.flatMap((post) => [post, post.replyTo].filter(Boolean).flatMap((tweet) => tweet.media));

if (checkOnly) {
  const source = JSON.parse(await readFile(exportUrl, 'utf8'));
  const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
  if (source.count !== ids.length || new Set(source.posts.map((post) => post.id)).size !== ids.length) {
    throw new Error('投稿件数またはIDが不正です');
  }
  if (!collage && !source.posts.find((post) => post.id === '2002204877871804552')?.replyTo?.media.length) {
    throw new Error('返信元メディアがありません');
  }
  for (const item of allMedia(manifest.posts)) {
    const path = item.type === 'image' ? new URL(`..${item.assetPath}`, import.meta.url) : new URL(`../public${item.localPath}`, import.meta.url);
    await access(path);
  }
  console.log(`${source.count} posts and ${allMedia(manifest.posts).length} media files present`);
  process.exit(0);
}

await mkdir(imageOutputUrl, { recursive: true });
await mkdir(videoOutputUrl, { recursive: true });

let posts;
if (mediaOnly) {
  posts = JSON.parse(await readFile(exportUrl, 'utf8')).posts;
} else {
  posts = [];
  for (const [index, id] of ids.entries()) {
    const tweet = await getTweet(id);
    const post = structuredTweet(tweet);
    post.replyTo = null;
    if (!post.media.length && tweet.replying_to_status) {
      post.replyTo = structuredTweet(await getTweet(tweet.replying_to_status));
    }
    posts.push(post);
    console.log(`tweet ${index + 1}/${ids.length}: ${id}`);
  }

  const exported = {
    exportedAt: new Date().toISOString(),
    query,
    source: 'X latest search',
    count: posts.length,
    posts,
  };
  await writeFile(exportUrl, `${JSON.stringify(exported, null, 2)}\n`);
}

const files = new Map();
for (const item of allMedia(posts)) {
  if (item.type === 'image') {
    const name = imageName(item.sourceUrl);
    item.sourceUrl = imageSource(item.sourceUrl);
    item.assetPath = `/src/assets/images/fanart/twitter-${slug}/${name}`;
    files.set(name, { url: item.sourceUrl, destination: new URL(name, imageOutputUrl), type: 'image/' });
  } else {
    const name = videoName(item.sourceUrl);
    item.localPath = collage ? `/media/fanart/collage/${name}` : `/media/fanart-patrol/${name}`;
    files.set(name, { url: item.sourceUrl, destination: new URL(name, videoOutputUrl), type: 'video/' });
    const posterName = imageName(item.posterUrl);
    item.posterUrl = imageSource(item.posterUrl);
    item.posterAssetPath = `/src/assets/images/fanart/twitter-${slug}/${posterName}`;
    files.set(posterName, { url: item.posterUrl, destination: new URL(posterName, imageOutputUrl), type: 'image/' });
  }
}

let completed = 0;
for (const [name, file] of files) {
  await download(file.url, file.destination, file.type);
  console.log(`media ${++completed}/${files.size}: ${name}`);
}

const manifest = {
  generatedAt: new Date().toISOString(),
  source: `data/fanart-twitter-${slug}-export.json`,
  posts,
};
await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${posts.length} posts and ${files.size} media files downloaded`);
