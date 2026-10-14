import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_LEN = 100;

// 修改弹幕（仅管理员）：text/top/dur/order/active 部分更新
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const { text, top, dur, order, active } = await req.json();
  const data: { text?: string; top?: number; dur?: number; order?: number; active?: boolean } = {};
  if (text !== undefined) {
    const content = String(text || "").trim();
    if (!content) {
      return NextResponse.json({ error: "弹幕内容不能为空" }, { status: 400 });
    }
    if (content.length > MAX_LEN) {
      return NextResponse.json({ error: `弹幕不能超过 ${MAX_LEN} 字` }, { status: 400 });
    }
    data.text = content;
  }
  if (top !== undefined) {
    const n = Number(top);
    if (!Number.isFinite(n)) {
      return NextResponse.json({ error: "垂直位置无效" }, { status: 400 });
    }
    data.top = Math.max(0, Math.min(100, n));
  }
  if (dur !== undefined) {
    const n = Number(dur);
    if (!Number.isFinite(n)) {
      return NextResponse.json({ error: "滚动时长无效" }, { status: 400 });
    }
    data.dur = Math.max(5, Math.min(60, Math.trunc(n)));
  }
  if (order !== undefined) {
    const n = Number(order);
    if (!Number.isFinite(n)) {
      return NextResponse.json({ error: "排序值无效" }, { status: 400 });
    }
    data.order = Math.trunc(n);
  }
  if (typeof active === "boolean") data.active = active;
  const danmaku = await prisma.danmaku
    .update({ where: { id: Number(id) }, data })
    .catch(() => null);
  if (!danmaku) {
    return NextResponse.json({ error: "弹幕不存在" }, { status: 404 });
  }
  revalidateTag("danmaku", { expire: 0 });
  return NextResponse.json(danmaku);
}

// 删除弹幕（仅管理员）
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.danmaku.delete({ where: { id: Number(id) } }).catch(() => null);
  revalidateTag("danmaku", { expire: 0 });
  return NextResponse.json({ ok: true });
}
