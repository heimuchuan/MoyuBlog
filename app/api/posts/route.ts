import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils";

// 创建文章（仅管理员）
export async function POST(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const body = await req.json();
  const { title, content, excerpt, published, categoryId, tags } = body;
  if (!title || !content) {
    return NextResponse.json({ error: "标题和内容不能为空" }, { status: 400 });
  }
  const tagArray = Array.isArray(tags) ? tags.map((t: unknown) => String(t).trim()).filter(Boolean) : [];
  const post = await prisma.post.create({
    data: {
      title,
      content,
      excerpt: excerpt || null,
      slug: await uniqueSlug(title),
      published: !!published,
      authorId: Number(session.user.id),
      categoryId: categoryId ? Number(categoryId) : null,
      tags: tagArray.length
        ? { connectOrCreate: tagArray.map((name: string) => ({ where: { name }, create: { name } })) }
        : undefined,
    },
    include: { category: true, tags: true },
  });
  return NextResponse.json(post);
}
