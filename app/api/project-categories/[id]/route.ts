import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 修改分类（仅管理员）
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
    const n = String(name || "").trim();
    if (!n) return NextResponse.json({ error: "名称不能为空" }, { status: 400 });
    data.name = n;
  }
  if (order !== undefined) {
    const n = Number(order);
    if (!Number.isFinite(n)) return NextResponse.json({ error: "排序值无效" }, { status: 400 });
    data.order = Math.trunc(n);
  }
  if (typeof active === "boolean") data.active = active;
  const cat = await prisma.projectCategory
    .update({ where: { id: Number(id) }, data })
    .catch(() => null);
  if (!cat) return NextResponse.json({ error: "分类不存在" }, { status: 404 });
  revalidateTag("projects", { expire: 0 });
  return NextResponse.json(cat);
}

// 删除分类（仅管理员）：有项目关联时拒绝
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const count = await prisma.project.count({ where: { categoryId: Number(id) } });
  if (count > 0) {
    return NextResponse.json({ error: "该分类下还有项目，无法删除" }, { status: 400 });
  }
  await prisma.projectCategory.delete({ where: { id: Number(id) } }).catch(() => null);
  revalidateTag("projects", { expire: 0 });
  return NextResponse.json({ ok: true });
}
