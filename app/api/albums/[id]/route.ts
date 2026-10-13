import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 重命名相册（仅管理员）
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const { name } = await req.json();
  const trimmed = String(name || "").trim();
  if (!trimmed) {
    return NextResponse.json({ error: "相册名不能为空" }, { status: 400 });
  }
  if (trimmed.length > 30) {
    return NextResponse.json({ error: "相册名最长 30 字" }, { status: 400 });
  }

  const album = await prisma.album.update({
    where: { id: Number(id) },
    data: { name: trimmed },
  });
  revalidateTag("albums", { expire: 0 });
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
