import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MAX_LEN = 20;

// 列出大屏标签（公开：前台过滤 active；管理员需要全部）
export async function GET() {
  const tags = await prisma.showcaseTag.findMany({
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
  return NextResponse.json(tags);
}

// 新增大屏标签（仅管理员）
export async function POST(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { name, order, active } = await req.json();
  const text = String(name || "").trim();
  if (!text) {
    return NextResponse.json({ error: "标签不能为空" }, { status: 400 });
  }
  if (text.length > MAX_LEN) {
    return NextResponse.json({ error: `标签不能超过 ${MAX_LEN} 字` }, { status: 400 });
  }
  const n = Number(order);
  const tag = await prisma.showcaseTag.create({
    data: {
      name: text,
      order: Number.isFinite(n) ? Math.trunc(n) : 0,
      active: active !== false,
    },
  });
  revalidateTag("showcase-tags", { expire: 0 });
  return NextResponse.json(tag);
}
