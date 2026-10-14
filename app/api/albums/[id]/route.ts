import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 更新相册（仅管理员）：重命名和/或切换首页展示
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const data: { name?: string; featured?: boolean } = {};
  if (body.name !== undefined) {
    const trimmed = String(body.name || "").trim();
    if (!trimmed) {
      return NextResponse.json({ error: "相册名不能为空" }, { status: 400 });
    }
    if (trimmed.length > 30) {
      return NextResponse.json({ error: "相册名最长 30 字" }, { status: 400 });
    }
    data.name = trimmed;
  }
  if (body.featured !== undefined) {
    data.featured = Boolean(body.featured);
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "没有需要更新的内容" }, { status: 400 });
  }

  const album = await prisma.album
    .update({ where: { id: Number(id) }, data })
    .catch(() => null);
  if (!album) {
    return NextResponse.json({ error: "相册不存在" }, { status: 404 });
  }
  // featured 变化影响首页照片卡聚合，需同时失效 home 缓存
  revalidateTag("albums", { expire: 0 });
  if (data.featured !== undefined) revalidateTag("home", { expire: 0 });
  return NextResponse.json(album);
}

// 删除相册（仅管理员）：相册内照片变为「未分组」，不删照片
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.album.delete({ where: { id: Number(id) } }).catch(() => null);
  revalidateTag("albums", { expire: 0 });
  return NextResponse.json({ ok: true });
}
