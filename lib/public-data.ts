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

export const getPostList = unstable_cache(
  async ({ page, q, category, tag }: PostListParams) => {
    const SIZE = 10;
    const where: Prisma.PostWhereInput = { published: true };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ];
    }
    if (category) where.category = { name: category };
    if (tag) where.tags = { some: { name: tag } };

    const [total, posts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        select: POST_LIST_SELECT,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * SIZE,
        take: SIZE,
      }),
    ]);
    return { total, posts };
  },
  ["post-list"],
  { tags: ["posts"], revalidate: 3600 },
);

// ── 首页聚合：最近 10 张照片 + 公开说说 + 最新文章 + 统计 ──
export const getHomeData = unstable_cache(
  async () => {
    const [photos, talks, latestPost, postCount, talkCount, photoCount] = await Promise.all([
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
      prisma.post.findFirst({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        select: { title: true, slug: true, excerpt: true, content: true, createdAt: true },
      }),
      prisma.post.count({ where: { published: true } }),
      prisma.talk.count({ where: { visibility: "public" } }),
      prisma.photo.count(),
    ]);

    let snippet: string | null = latestPost?.excerpt || null;
    if (latestPost && !snippet) {
      const plain = latestPost.content.replace(/[#>*`\-_]/g, "").replace(/\s+/g, " ").trim();
      snippet = plain.slice(0, 90) + (plain.length > 90 ? "…" : "");
    }

    return {
      photos,
      stats: { posts: postCount, talks: talkCount, photos: photoCount },
      talks: talks.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })),
      latestPost: latestPost
        ? {
            title: latestPost.title,
            slug: latestPost.slug,
            snippet,
            createdAt: latestPost.createdAt.toISOString(),
          }
        : null,
    };
  },
  ["home-data"],
  { tags: ["home", "photos", "talks", "posts"], revalidate: 600 },
);
