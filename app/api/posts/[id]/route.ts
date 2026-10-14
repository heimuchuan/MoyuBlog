import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// 更新文章（仅管理员）
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const { title, content, excerpt, published, categoryId, tags, publishAt } = body;
  if (!title || !content) {
    return NextResponse.json({ error: "标题和内容不能为空" }, { status: 400 });
  }
  // 定时发布时间：为空表示不定时；非法格式直接拒绝；定了时间即视为已发布（避免「草稿+定时」矛盾状态）
  let publishAtDate: Date | null = null;
  if (publishAt) {
    const d = new Date(publishAt);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: "定时发布时间格式不正确" }, { status: 400 });
    }
    publishAtDate = d;
  }
  const tagArray = Array.isArray(tags) ? tags.map((t: unknown) => String(t).trim()).filter(Boolean) : [];
  const post = await prisma.post.update({
    where: { id: Number(id) },
    data: {
      title,
      content,
      excerpt: excerpt || null,
      published: publishAtDate ? true : !!published,
      publishAt: publishAtDate,
      categoryId: categoryId ? Number(categoryId) : null,
      tags: tagArray.length
        ? { set: [], connectOrCreate: tagArray.map((name: string) => ({ where: { name }, create: { name } })) }
        : { set: [] },
    },
    include: { category: true, tags: true },
  });
  revalidateTag("posts", { expire: 0 }); // 立即失效（Route Handler 内不用 max 的 stale-while-revalidate）
  return NextResponse.json(post);
}

// 删除文章（仅管理员）
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.post.delete({ where: { id: Number(id) } });
  revalidateTag("posts", { expire: 0 }); // 立即失效（Route Handler 内不用 max 的 stale-while-revalidate）
  return NextResponse.json({ ok: true });
}
