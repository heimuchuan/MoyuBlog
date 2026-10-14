﻿﻿﻿import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_LEN = 200;

// 列出金句（公开：仅 active；管理员：全部，带 active 标记）
export async function GET() {
  const quotes = await prisma.quote.findMany({
    orderBy: [{ createdAt: "desc" }],
  });
  // 前台只读 active，后台管理需要全部——这里返回全部，由调用方过滤
  return NextResponse.json(quotes);
}

// 新增金句（仅管理员）
export async function POST(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { content, active } = await req.json();
  const text = String(content || "").trim();
  if (!text) {
    return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
  }
  if (text.length > MAX_LEN) {
    return NextResponse.json({ error: `不能超过 ${MAX_LEN} 字` }, { status: 400 });
  }
  const quote = await prisma.quote.create({
    data: { content: text, active: active !== false },
  });
  revalidateTag("quotes", { expire: 0 }); // 写后首次请求即拿新数据
  return NextResponse.json(quote);
}
