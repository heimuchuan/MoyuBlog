import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 创建分类（仅管理员）
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { name } = await req.json();
  if (!name || !String(name).trim()) {
    return NextResponse.json({ error: "分类名不能为空" }, { status: 400 });
  }
  const category = await prisma.category.create({ data: { name: String(name).trim() } });
  return NextResponse.json(category);
}