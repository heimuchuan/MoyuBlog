import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 知识库文档列表（仅管理员）
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const docs = await prisma.knowledgeDoc.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { chunks: true } } },
  });
  return NextResponse.json(docs);
}

// 删除知识库文档（仅管理员，级联删除其切片）
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await req.json();
  await prisma.knowledgeDoc.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}