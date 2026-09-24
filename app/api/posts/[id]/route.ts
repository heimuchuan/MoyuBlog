import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// 更新文章（仅管理员）
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const { title, content, excerpt, published, categoryId, tags } = body;
  if (!title || !content) {
    return NextResponse.json({ error: "标题和内容不能为空" }, { status: 400 });
  }
  const tagArray = Array.isArray(tags) ? tags.map((t: unknown) => String(t).trim()).filter(Boolean) : [];
  const post = await prisma.post.update({
    where: { id: Number(id) },
    data: {
      title,
      content,
      excerpt: excerpt || null,
      published: !!published,
      categoryId: categoryId ? Number(categoryId) : null,
      tags: tagArray.length
        ? { set: [], connectOrCreate: tagArray.map((name: string) => ({ where: { name }, create: { name } })) }
        : { set: [] },
    },
    include: { category: true, tags: true },
  });
  return NextResponse.json(post);
}

// 删除文章（仅管理员）
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.post.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}