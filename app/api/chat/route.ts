import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEmbedding, cosineSimilarity, askQuestion } from "@/lib/rag";

// RAG 问答（公开）
export async function POST(req: NextRequest) {
  const body = await req.json();
  const question = String(body?.question || "").trim();
  if (!question) {
    return NextResponse.json({ error: "问题不能为空" }, { status: 400 });
  }

  const chunks = await prisma.knowledgeChunk.findMany({
    where: { doc: { status: "processed" } },
    include: { doc: { select: { title: true } } },
  });

  if (chunks.length === 0) {
    return NextResponse.json({ answer: "知识库还是空的，请管理员先在后台导入文档。", sources: [] });
  }

  // 问题向量化 + 应用层余弦相似度排序取 Top-5
  const qv = await getEmbedding(question);
  const scored = chunks
    .map((c) => ({ chunk: c, score: cosineSimilarity(qv, c.embedding) }))
    .sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 5);

  const contexts = top.map((t) => ({ content: t.chunk.content, title: t.chunk.doc.title }));
  const answer = await askQuestion(question, contexts);

  const sources = top.map((t) => ({
    title: t.chunk.doc.title,
    content: t.chunk.content.slice(0, 200),
    score: Math.round(t.score * 100) / 100,
  }));

  await prisma.qALog.create({
    data: { question, answer, sources: JSON.stringify(sources) },
  });

  return NextResponse.json({ answer, sources });
}