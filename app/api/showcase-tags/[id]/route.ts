import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_LEN = 20;

// 修改大屏标签（仅管理员）：name/order/active 部分更新
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const { name, order, active } = await req.json();
  const data: { name?: string; order?: number; active?: boolean } = {};
  if (name !== undefined) {
    const text = String(name || "").trim();
    if (!text) {
      return NextResponse.json({ error: "标签不能为空" }, { status: 400 });
    }
    if (text.length > MAX_LEN) {
      return NextResponse.json({ error: `标签不能超过 ${MAX_LEN} 字` }, { status: 400 });
    }
    data.name = text;
  }
  if (order !== undefined) {
    const n = Number(order);
    if (!Number.isFinite(n)) {
      return NextResponse.json({ error: "排序值无效" }, { status: 400 });
    }
    data.order = Math.trunc(n);
  }
  if (typeof active === "boolean") data.active = active;
  const tag = await prisma.showcaseTag
    .update({ where: { id: Number(id) }, data })
    .catch(() => null);
  if (!tag) {
    return NextResponse.json({ error: "标签不存在" }, { status: 404 });
  }
  revalidateTag("showcase-tags", { expire: 0 });
  return NextResponse.json(tag);
}

// 删除大屏标签（仅管理员）
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.showcaseTag.delete({ where: { id: Number(id) } }).catch(() => null);
  revalidateTag("showcase-tags", { expire: 0 });
  return NextResponse.json({ ok: true });
}
