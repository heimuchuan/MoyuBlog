import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, unstable_cache } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 列出所有分类（公开：前台筛选用；后台管理用）；走 tag 缓存
const getCategoriesCached = unstable_cache(
  async () =>
    prisma.projectCategory.findMany({
      orderBy: [{ order: "asc" }, { id: "asc" }],
    }),
  ["api-project-categories"],
  { revalidate: 3600, tags: ["projects"] }
);

export async function GET() {
  const list = await getCategoriesCached();
  return NextResponse.json(list);
}

// 新增分类（仅管理员）
export async function POST(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { key, name, order, active } = await req.json();
  const k = String(key || "").trim();
  const n = String(name || "").trim();
  if (!k || !n) {
    return NextResponse.json({ error: "标识和名称不能为空" }, { status: 400 });
  }
  if (!/^[a-z0-9-]+$/.test(k)) {
    return NextResponse.json({ error: "标识只能用小写字母、数字、连字符" }, { status: 400 });
  }
  try {
    const cat = await prisma.projectCategory.create({
      data: {
        key: k,
        name: n,
        order: Number.isFinite(Number(order)) ? Math.trunc(Number(order)) : 0,
        active: active !== false,
      },
    });
    revalidateTag("projects", { expire: 0 });
    return NextResponse.json(cat);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "标识已存在" }, { status: 400 });
    }
    throw e;
  }
}
