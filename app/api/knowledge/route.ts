import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { KNOWLEDGE_DIR } from "@/lib/knowledge-storage";
import { removeUpload } from "@/lib/upload-storage";

// 知识库文档列表（仅管理员）
export async function GET(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const docs = await prisma.knowledgeDoc.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { chunks: true } } },
  });
  return NextResponse.json(docs);
}

// 删除知识库文档（仅管理员，级联删除其切片 + 删除留档原文件）
export async function DELETE(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await req.json();
  const doc = await prisma.knowledgeDoc.delete({ where: { id: Number(id) } }).catch(() => null);
  if (doc?.storedFileName) {
    await removeUpload(doc.storedFileName, KNOWLEDGE_DIR);
  }
  return NextResponse.json({ ok: true });
}
