import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MAX_LEN = 100;

// 列出所有弹幕（后台用，含停用项）
export async function GET() {
  const list = await prisma.danmaku.findMany({
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
  return NextResponse.json(list);
}

// 新增弹幕（仅管理员）
export async function POST(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { text, top, dur, order, active } = await req.json();
  const content = String(text || "").trim();
  if (!content) {
    return NextResponse.json({ error: "弹幕内容不能为空" }, { status: 400 });
  }
  if (content.length > MAX_LEN) {
    return NextResponse.json({ error: `弹幕不能超过 ${MAX_LEN} 字` }, { status: 400 });
  }
  const topVal = Number(top);
  const durVal = Number(dur);
  const orderVal = Number(order);
  const danmaku = await prisma.danmaku.create({
    data: {
      text: content,
      top: Number.isFinite(topVal) ? Math.max(0, Math.min(100, topVal)) : 0,
      dur: Number.isFinite(durVal) ? Math.max(5, Math.min(60, Math.trunc(durVal))) : 18,
      order: Number.isFinite(orderVal) ? Math.trunc(orderVal) : 0,
      active: active !== false,
    },
  });
  revalidateTag("danmaku", { expire: 0 });
  return NextResponse.json(danmaku);
}
