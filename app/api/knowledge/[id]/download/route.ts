import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { KNOWLEDGE_DIR } from "@/lib/knowledge-storage";
import { readUpload } from "@/lib/upload-storage";

type Params = { params: Promise<{ id: string }> };

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain; charset=utf-8",
};

// 下载知识库原始留档文件（仅管理员）
export async function GET(req: NextRequest, { params }: Params) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const doc = await prisma.knowledgeDoc.findUnique({ where: { id: Number(id) } });
  if (!doc?.storedFileName) {
    return NextResponse.json({ error: "文件不存在（可能是留档功能上线前上传的旧文档）" }, { status: 404 });
  }

  // 统一读取：Blob 引用走代理下载，本地引用读文件（basename 防路径穿越）
  const data = await readUpload(doc.storedFileName, KNOWLEDGE_DIR);
  if (!data) {
    return NextResponse.json({ error: "留档文件已丢失" }, { status: 404 });
  }

  const filename = encodeURIComponent(doc.fileName);
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": MIME[doc.fileType] || "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
      "Content-Length": String(data.length),
    },
  });
}
