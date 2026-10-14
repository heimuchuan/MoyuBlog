import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchPlaylistMeta } from "@/lib/music-server";

// 修改歌单（仅管理员）：name/order/active/isDefault/refreshMeta 部分更新
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const numericId = Number(id);
  const body = await req.json().catch(() => ({}));

  const data: {
    name?: string;
    order?: number;
    active?: boolean;
    cover?: string | null;
    songCount?: number;
  } = {};

  if (body.name !== undefined) {
    const text = String(body.name || "").trim();
    if (!text) return NextResponse.json({ error: "歌单名不能为空" }, { status: 400 });
    if (text.length > 60) return NextResponse.json({ error: "歌单名不能超过 60 字" }, { status: 400 });
    data.name = text;
  }
  if (body.order !== undefined) {
    const n = Number(body.order);
    if (!Number.isFinite(n)) return NextResponse.json({ error: "排序值无效" }, { status: 400 });
    data.order = Math.trunc(n);
  }
  if (typeof body.active === "boolean") data.active = body.active;

  // 重新抓取封面与曲目数（歌单内容变化后手动刷新）
  if (body.refreshMeta === true) {
    const current = await prisma.playlist.findUnique({ where: { id: numericId } });
    if (!current) return NextResponse.json({ error: "歌单不存在" }, { status: 404 });
    const meta = await fetchPlaylistMeta(current.playlistId, current.name);
    if (!meta) return NextResponse.json({ error: "歌单信息获取失败" }, { status: 400 });
    data.cover = meta.cover ?? null;
    data.songCount = meta.songCount ?? 0;
  }

  // 设为默认播放时一并启用（默认歌单若被停用会从前台消失）
  if (body.isDefault === true) data.active = true;

  const updated = await prisma.$transaction(async (tx) => {
    // 设默认播放：先把其它歌单的 isDefault 清掉，保证全局仅一个
    if (body.isDefault === true) {
      await tx.playlist.updateMany({ where: { id: { not: numericId } }, data: { isDefault: false } });
    }
    return tx.playlist
      .update({
        where: { id: numericId },
        data: { ...data, ...(body.isDefault === true ? { isDefault: true } : {}) },
      })
      .catch(() => null);
  });

  if (!updated) {
    return NextResponse.json({ error: "歌单不存在" }, { status: 404 });
  }
  revalidateTag("music", { expire: 0 });
  return NextResponse.json(updated);
}

// 删除歌单（仅管理员）
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.playlist.delete({ where: { id: Number(id) } }).catch(() => null);
  revalidateTag("music", { expire: 0 });
  return NextResponse.json({ ok: true });
}
