import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractText, chunkText, type FileType } from "@/lib/document";
import { getEmbedding } from "@/lib/rag";

const TYPE_MAP: Record<string, FileType> = { pdf: "pdf", docx: "docx", txt: "txt" };

// 上传并向量化知识库文档（仅管理员）
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "请上传文件" }, { status: 400 });
  }

  const fileName = file.name;
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const fileType = TYPE_MAP[ext];
  if (!fileType) {
    return NextResponse.json({ error: "仅支持 pdf / docx / txt" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let text: string;
  try {
    text = await extractText(fileType, buffer);
  } catch (e) {
    return NextResponse.json({ error: "解析失败：" + (e as Error).message }, { status: 400 });
  }
  if (!text.trim()) {
    return NextResponse.json({ error: "未能从文件中提取到文字" }, { status: 400 });
  }

  const chunks = chunkText(text);
  const title = String(form.get("title") || fileName.replace(/\.[^.]+$/, "")).trim();

  const doc = await prisma.knowledgeDoc.create({
    data: { title, fileName, fileType, content: text, status: "processing" },
  });

  try {
    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk);
      await prisma.knowledgeChunk.create({ data: { docId: doc.id, content: chunk, embedding } });
    }
    const updated = await prisma.knowledgeDoc.update({
      where: { id: doc.id },
      data: { status: "processed" },
    });
    return NextResponse.json({ ...updated, chunkCount: chunks.length });
  } catch (e) {
    await prisma.knowledgeDoc.update({ where: { id: doc.id }, data: { status: "failed" } });
    return NextResponse.json({ error: "向量化失败：" + (e as Error).message }, { status: 500 });
  }
}