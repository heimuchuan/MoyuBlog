import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_LEN = 500;

// 发布说说（仅管理员）
export async function POST(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { content, visibility } = await req.json();
  const text = String(content || "").trim();
  if (!text) {
    return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
  }
  if (text.length > MAX_LEN) {
    return NextResponse.json({ error: `不能超过 ${MAX_LEN} 字` }, { status: 400 });
  }
  const vis = visibility === "private" ? "private" : "public";
  const talk = await prisma.talk.create({ data: { content: text, visibility: vis } });
  return NextResponse.json(talk);
}

// 切换说说公开/私密（仅管理员）
export async function PATCH(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id, visibility } = await req.json();
  const vis = visibility === "private" ? "private" : "public";
  const talk = await prisma.talk
    .update({ where: { id: Number(id) }, data: { visibility: vis } })
    .catch(() => null);
  if (!talk) {
    return NextResponse.json({ error: "说说不存在" }, { status: 404 });
  }
  return NextResponse.json(talk);
}

// 删除说说（仅管理员）
export async function DELETE(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await req.json();
  await prisma.talk.delete({ where: { id: Number(id) } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
