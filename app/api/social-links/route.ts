import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SOCIAL_ICON_KEYS } from "@/components/Icons";

export const dynamic = "force-dynamic";

const MAX_LABEL = 30;
const HREF_RE = /^(https?:\/\/|mailto:)/i;

// 列出社交链接（公开：前台过滤 active；管理员需要全部）
export async function GET() {
  const links = await prisma.socialLink.findMany({
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
  return NextResponse.json(links);
}

// 新增社交链接（仅管理员）
export async function POST(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { label, href, icon, order, active } = await req.json();
  const text = String(label || "").trim();
  const url = String(href || "").trim();
  if (!text) {
    return NextResponse.json({ error: "名称不能为空" }, { status: 400 });
  }
  if (text.length > MAX_LABEL) {
    return NextResponse.json({ error: `名称不能超过 ${MAX_LABEL} 字` }, { status: 400 });
  }
  if (!url || !HREF_RE.test(url)) {
    return NextResponse.json(
      { error: "链接需以 https://、http:// 或 mailto: 开头" },
      { status: 400 }
    );
  }
  const iconKey = String(icon || "link");
  const n = Number(order);
  const link = await prisma.socialLink.create({
    data: {
      label: text,
      href: url,
      icon: SOCIAL_ICON_KEYS.includes(iconKey) ? iconKey : "link",
      order: Number.isFinite(n) ? Math.trunc(n) : 0,
      active: active !== false,
    },
  });
  revalidateTag("social-links", { expire: 0 });
  return NextResponse.json(link);
}
