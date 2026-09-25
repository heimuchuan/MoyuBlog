import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 首页聚合数据：最近 10 张照片 + 公开说说 + 最新一篇文章（公开接口，无鉴权）
export const dynamic = "force-dynamic";

export async function GET() {
  const [photos, talks, latestPost] = await Promise.all([
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
  ]);

  // 摘要兜底：没填摘要时从正文（纯文本 markdown）截取前 90 字
  let snippet: string | null = latestPost?.excerpt || null;
  if (latestPost && !snippet) {
    const plain = latestPost.content.replace(/[#>*`\-_]/g, "").replace(/\s+/g, " ").trim();
    snippet = plain.slice(0, 90) + (plain.length > 90 ? "…" : "");
  }

  return NextResponse.json({
    photos,
    talks: talks.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })),
    latestPost: latestPost
      ? {
          title: latestPost.title,
          slug: latestPost.slug,
          snippet,
          createdAt: latestPost.createdAt.toISOString(),
        }
      : null,
  });
}
