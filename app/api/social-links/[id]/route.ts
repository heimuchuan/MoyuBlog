import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SOCIAL_ICON_KEYS } from "@/components/Icons";

const MAX_LABEL = 30;
const HREF_RE = /^(https?:\/\/|mailto:)/i;

// 修改社交链接（仅管理员）：label/href/icon/order/active 部分更新
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const { label, href, icon, order, active } = await req.json();
  const data: { label?: string; href?: string; icon?: string; order?: number; active?: boolean } = {};
  if (label !== undefined) {
    const text = String(label || "").trim();
    if (!text) {
      return NextResponse.json({ error: "名称不能为空" }, { status: 400 });
    }
    if (text.length > MAX_LABEL) {
      return NextResponse.json({ error: `名称不能超过 ${MAX_LABEL} 字` }, { status: 400 });
    }
    data.label = text;
  }
  if (href !== undefined) {
    const url = String(href || "").trim();
    if (!url || !HREF_RE.test(url)) {
      return NextResponse.json(
        { error: "链接需以 https://、http:// 或 mailto: 开头" },
        { status: 400 }
      );
    }
    data.href = url;
  }
  if (icon !== undefined) {
    const iconKey = String(icon);
    data.icon = SOCIAL_ICON_KEYS.includes(iconKey) ? iconKey : "link";
  }
  if (order !== undefined) {
    const n = Number(order);
    if (!Number.isFinite(n)) {
      return NextResponse.json({ error: "排序值无效" }, { status: 400 });
    }
    data.order = Math.trunc(n);
  }
  if (typeof active === "boolean") data.active = active;
  const link = await prisma.socialLink
    .update({ where: { id: Number(id) }, data })
    .catch(() => null);
  if (!link) {
    return NextResponse.json({ error: "链接不存在" }, { status: 404 });
  }
  revalidateTag("social-links", { expire: 0 });
  return NextResponse.json(link);
}

// 删除社交链接（仅管理员）
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.socialLink.delete({ where: { id: Number(id) } }).catch(() => null);
  revalidateTag("social-links", { expire: 0 });
  return NextResponse.json({ ok: true });
}
