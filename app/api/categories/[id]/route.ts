import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// 重命名分类（仅管理员）
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const { name } = await req.json();
  if (!name || !String(name).trim()) {
    return NextResponse.json({ error: "分类名不能为空" }, { status: 400 });
  }
  const category = await prisma.category.update({
    where: { id: Number(id) },
    data: { name: String(name).trim() },
  });
  return NextResponse.json(category);
}

// 删除分类（仅管理员）
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.category.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}