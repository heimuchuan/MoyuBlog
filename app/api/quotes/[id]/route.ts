﻿﻿﻿import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_LEN = 200;

// 修改金句（仅管理员）
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const { content, active } = await req.json();
  const text = String(content || "").trim();
  if (!text) {
    return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
  }
  if (text.length > MAX_LEN) {
    return NextResponse.json({ error: `不能超过 ${MAX_LEN} 字` }, { status: 400 });
  }
  const data: { content: string; active?: boolean } = { content: text };
  if (typeof active === "boolean") data.active = active;
  const quote = await prisma.quote
    .update({ where: { id: Number(id) }, data })
    .catch(() => null);
  if (!quote) {
    return NextResponse.json({ error: "金句不存在" }, { status: 404 });
  }
  revalidateTag("quotes", { expire: 0 });
  return NextResponse.json(quote);
}

// 删除金句（仅管理员）
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.quote.delete({ where: { id: Number(id) } }).catch(() => null);
  revalidateTag("quotes", { expire: 0 });
  return NextResponse.json({ ok: true });
}
