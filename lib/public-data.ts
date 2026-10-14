// 前台公开数据统一走缓存层：云端数据库公网延迟高（单次查询数百 ms~数秒），
// 用 unstable_cache 按 tag 缓存；后台写操作（发文/传图/发说说）后 revalidateTag 立即失效。
import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ── 照片墙：相册两层结构（只含有照片的相册 + 未分组散片），日期转 ISO 规避缓存反序列化 ──
export type PublicPhotoItem = {
  id: number;
  title: string | null;
  fileName: string;
  albumId: number | null;
  createdAt: string;
};
export type PublicAlbumItem = {
  id: number;
  name: string;
  featured: boolean;
  coverPhotoId: number | null;
  createdAt: string;
  updatedAt: string;
  photos: PublicPhotoItem[];
};
export type PublicAlbumsData = {
  albums: PublicAlbumItem[];
  unassigned: PublicPhotoItem[];
};

export const getPublicAlbums = unstable_cache(
  async (): Promise<PublicAlbumsData> => {
    const [albums, unassigned] = await Promise.all([
      prisma.album.findMany({
        where: { photos: { some: {} } },
        orderBy: { updatedAt: "desc" },
        include: { photos: { orderBy: { createdAt: "desc" } } },
      }),
      prisma.photo.findMany({
        where: { albumId: null },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const toItem = (p: (typeof albums)[number]["photos"][number]): PublicPhotoItem => ({
      id: p.id,
      title: p.title,
      fileName: p.fileName,
      albumId: p.albumId,
      createdAt: p.createdAt.toISOString(),
    });

    return {
      albums: albums.map((a) => ({
        id: a.id,
        name: a.name,
        featured: a.featured,
        coverPhotoId: a.coverPhotoId,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
        photos: a.photos.map(toItem),
      })),
      unassigned: unassigned.map(toItem),
    };
  },
  ["public-albums"],
  { tags: ["albums", "photos"], revalidate: 3600 },
);

// ── 说说时间线：公开说说，最多 200 条 ──
export const getPublicTalks = unstable_cache(
  async () =>
    prisma.talk.findMany({
      where: { visibility: "public" },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ["public-talks"],
  { tags: ["talks"], revalidate: 3600 },
);

// ── 文章列表（分页/搜索/分类/标签参数自动参与缓存键），只取列表字段，不拉正文 ──
const POST_LIST_SELECT = {
  slug: true,
  title: true,
  excerpt: true,
  createdAt: true,
  publishAt: true,
  views: true,
  category: { select: { name: true } },
  tags: { select: { name: true } },
} satisfies Prisma.PostSelect;

export type PostListParams = {
  page: number;
  q?: string;
  category?: string;
  tag?: string;
};

// 缓存层只保存「全部已发布文章」超集（含定时未到点者，故到点后无需重建缓存即可上线）；
// 剔除未到点文章与分页在请求时进行，避免缓存把「当前时间」这一判断冻结在缓存创建时刻。
const getPostListCached = unstable_cache(
  async ({ q, category, tag }: Omit<PostListParams, "page">) => {
    const where: Prisma.PostWhereInput = { published: true };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ];
    }
    if (category) where.category = { name: category };
    if (tag) where.tags = { some: { name: tag } };

    const list = await prisma.post.findMany({
      where,
      select: POST_LIST_SELECT,
      orderBy: { createdAt: "desc" },
      take: 500, // 个人博客量级：一次缓存全量列表字段（不含正文）
    });
    // 发布时间显式转 ISO，规避缓存反序列化后 Date 变字符串的类型错位
    return list.map((p) => ({
      ...p,
      publishAt: p.publishAt ? p.publishAt.toISOString() : null,
    }));
  },
  ["post-list"],
  { tags: ["posts"], revalidate: 3600 },
);

const POST_PAGE_SIZE = 10;

export async function getPostList({ page, q, category, tag }: PostListParams) {
  const all = await getPostListCached({ q, category, tag });
  const now = Date.now();
  // 定时发布：到点前不对前台可见
  const due = all.filter((p) => !p.publishAt || new Date(p.publishAt).getTime() <= now);
  const start = (page - 1) * POST_PAGE_SIZE;
  return {
    total: due.length,
    posts: due.slice(start, start + POST_PAGE_SIZE),
  };
}

// ── 站点头像：SiteConfig 键值（key=avatar），后台换头像后 revalidateTag 立即失效 ──
export const getSiteAvatar = unstable_cache(
  async (): Promise<string | null> => {
    const row = await prisma.siteConfig.findUnique({ where: { key: "avatar" } });
    return row?.value ?? null;
  },
  ["site-avatar"],
  { tags: ["site-config"], revalidate: 3600 },
);

// ── 精选歌单：后台配置（默认播放的歌单排最前）；后台增删改后 revalidateTag("music") 立即失效 ──
export type PublicPlaylist = {
  playlistId: string;
  name: string;
  cover: string | null;
  songCount: number;
  isDefault: boolean;
};

export const getFeaturedPlaylists = unstable_cache(
  async (): Promise<PublicPlaylist[]> => {
    const rows = await prisma.playlist.findMany({
      where: { active: true },
      orderBy: [{ isDefault: "desc" }, { order: "asc" }, { id: "asc" }],
      select: { playlistId: true, name: true, cover: true, songCount: true, isDefault: true },
    });
    return rows;
  },
  ["featured-playlists"],
  { tags: ["music"], revalidate: 3600 },
);

// ── 文章详情：slug 参与缓存键；Date 转 ISO 规避缓存反序列化；未发布/不存在返回 null ──
export const getPostDetail = unstable_cache(
  async (slug: string) => {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: { category: true, tags: true, author: { select: { name: true } } },
    });
    if (!post) return null;
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      views: post.views,
      published: post.published,
      authorName: post.author.name,
      categoryName: post.category?.name ?? null,
      tags: post.tags.map((t) => t.name),
      createdAt: post.createdAt.toISOString(),
      publishAt: post.publishAt ? post.publishAt.toISOString() : null,
    };
  },
  ["post-detail"],
  { tags: ["posts"], revalidate: 3600 },
);

// ── 首页聚合：照片卡 + 公开说说 + 最新文章 + 统计 ──
export const getHomeData = unstable_cache(
  async () => {
    const [featuredAlbums, recentPhotos, talks, postCandidates, postCount, talkCount, photoCount] =
      await Promise.all([
        // 勾选「首页展示」的相册（含照片按时间倒序）
        prisma.album.findMany({
          where: { featured: true, photos: { some: {} } },
          orderBy: { updatedAt: "desc" },
          select: {
            name: true,
            photos: {
              orderBy: { createdAt: "desc" },
              select: { id: true, fileName: true, title: true, createdAt: true },
            },
          },
        }),
        prisma.photo.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, fileName: true, title: true },
        }),
        prisma.talk.findMany({
          where: { visibility: "public" },
          orderBy: { createdAt: "desc" },
          take: 100,
          select: { id: true, content: true, createdAt: true },
        }),
        // 最近 10 篇候选：缓存内不判断时间，由调用方按当前时间挑第一篇已到点的（保证定时文章到点即上线）
        prisma.post.findMany({
          where: { published: true },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { title: true, slug: true, excerpt: true, content: true, createdAt: true, publishAt: true },
        }),
        prisma.post.count({ where: { published: true } }),
        prisma.talk.count({ where: { visibility: "public" } }),
        prisma.photo.count(),
      ]);

    // 照片卡：优先展示勾选的相册（多册照片按时间倒序混合取 10 张，附相册名），未勾选时回退全站最近 10 张
    const featuredPhotos = featuredAlbums
      .flatMap((a) =>
        a.photos.map((p) => ({
          id: p.id,
          fileName: p.fileName,
          title: p.title,
          albumName: a.name,
          createdAt: p.createdAt,
        }))
      )
      .sort((x, y) => y.createdAt.getTime() - x.createdAt.getTime())
      .slice(0, 10)
      .map(({ id, fileName, title, albumName }) => ({ id, fileName, title, albumName }));
    const photos =
      featuredPhotos.length > 0
        ? featuredPhotos
        : recentPhotos.map((p) => ({ ...p, albumName: null }));

    const recentPosts = postCandidates.map((p) => {
      let snippet = p.excerpt || null;
      if (!snippet) {
        const plain = p.content.replace(/[#>*`\-_]/g, "").replace(/\s+/g, " ").trim();
        snippet = plain.slice(0, 90) + (plain.length > 90 ? "…" : "");
      }
      return {
        title: p.title,
        slug: p.slug,
        snippet,
        createdAt: p.createdAt.toISOString(),
        publishAt: p.publishAt ? p.publishAt.toISOString() : null,
      };
    });

    return {
      photos,
      stats: { posts: postCount, talks: talkCount, photos: photoCount },
      talks: talks.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })),
      recentPosts,
    };
  },
  ["home-data"],
  { tags: ["home", "photos", "talks", "posts", "albums"], revalidate: 600 },
);

// ── 项目列表：仅启用项，带分类；后台改后 revalidateTag("projects") 立即失效 ──
export type PublicProject = {
  id: number;
  slug: string;
  title: string;
  description: string;
  cover: string | null;
  date: string;
  tags: string[];
  categoryKey: string;
  categoryName: string;
  url: string;
  span: string;
};

export const getPublicProjects = unstable_cache(
  async (): Promise<PublicProject[]> => {
    const rows = await prisma.project.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { id: "asc" }],
      include: { category: true },
    });
    return rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      cover: p.cover,
      date: p.date,
      tags: JSON.parse(p.tags || "[]"),
      categoryKey: p.category.key,
      categoryName: p.category.name,
      url: p.url,
      span: p.span,
    }));
  },
  ["public-projects"],
  { tags: ["projects"], revalidate: 3600 },
);

// 项目分类：仅启用项，供前台筛选
export type PublicProjectCategory = {
  id: number;
  key: string;
  name: string;
};

export const getPublicProjectCategories = unstable_cache(
  async (): Promise<PublicProjectCategory[]> => {
    return prisma.projectCategory.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { id: "asc" }],
      select: { id: true, key: true, name: true },
    });
  },
  ["public-project-categories"],
  { tags: ["projects"], revalidate: 3600 },
);

// ── 首页背景弹幕：仅返回启用项，按 order 排序 ──
export type PublicDanmaku = {
  id: number;
  text: string;
  top: number;
  dur: number;
};

export const getDanmakuList = unstable_cache(
  async (): Promise<PublicDanmaku[]> => {
    const list = await prisma.danmaku.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { id: "asc" }],
      select: { id: true, text: true, top: true, dur: true },
    });
    return list;
  },
  ["danmaku-list"],
  { tags: ["danmaku"], revalidate: 3600 },
);

// 留言墙（大屏公开区，最新在前，最多 60 条）
export type PublicGuestbookMessage = {
  id: number;
  name: string;
  content: string;
  avatarUrl: string | null;
  githubLogin: string | null;
  createdAt: string;
};

export const getGuestbookMessages = unstable_cache(
  async (): Promise<PublicGuestbookMessage[]> => {
    const list = await prisma.guestbookMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 60,
      select: {
        id: true,
        name: true,
        content: true,
        avatarUrl: true,
        githubLogin: true,
        createdAt: true,
      },
    });
    return list.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }));
  },
  ["guestbook-list"],
  { tags: ["guestbook"], revalidate: 60 },
);
