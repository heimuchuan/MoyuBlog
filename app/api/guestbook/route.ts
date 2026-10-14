import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getVisitorSession } from "@/lib/auth";
import { getGuestbookMessages } from "@/lib/public-data";
import { prisma } from "@/lib/prisma";

const NAME_MAX = 20;
const CONTENT_MAX = 200;

// 内存限流：匿名访客 1 条/分钟/IP，GitHub 登录用户 5 条/分钟
const hits = new Map<string, number[]>();
function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(key, arr);
    return true;
  }
  arr.push(now);
  hits.set(key, arr);
  return false;
}

function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

// 留言列表（公开，走 unstable_cache）
export async function GET() {
  const list = await getGuestbookMessages();
  return NextResponse.json(list);
}

// 发表留言（公开；GitHub 登录用户身份取自会话，无法伪造）
export async function POST(req: NextRequest) {
  const session = await getVisitorSession(req);
  const ip = clientIp(req);

  if (session?.user?.githubLogin) {
    if (limited(`gh:${session.user.githubLogin}`, 5, 60_000)) {
      return NextResponse.json({ error: "太快了，喝口水再来" }, { status: 429 });
    }
  } else if (limited(`ip:${ip}`, 1, 60_000)) {
    return NextResponse.json({ error: "太快了，1 分钟后再试" }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const content = String(body.content || "").trim();
  if (!content) {
    return NextResponse.json({ error: "留言内容不能为空" }, { status: 400 });
  }
  if (content.length > CONTENT_MAX) {
    return NextResponse.json({ error: `留言不能超过 ${CONTENT_MAX} 字` }, { status: 400 });
  }

  let name: string;
  let avatarUrl: string | null = null;
  let githubLogin: string | null = null;
  if (session?.user?.githubLogin) {
    name = String(session.user.name || session.user.githubLogin).slice(0, NAME_MAX);
    avatarUrl = session.user.avatarUrl ?? null;
    githubLogin = session.user.githubLogin;
  } else {
    name = String(body.name || "").trim().slice(0, NAME_MAX);
    if (!name) {
      return NextResponse.json({ error: "昵称不能为空" }, { status: 400 });
    }
  }

  const msg = await prisma.guestbookMessage.create({
    data: { name, content, avatarUrl, githubLogin, ip },
    select: {
      id: true,
      name: true,
      content: true,
      avatarUrl: true,
      githubLogin: true,
      createdAt: true,
    },
  });
  revalidateTag("guestbook", { expire: 0 });
  return NextResponse.json({ ...msg, createdAt: msg.createdAt.toISOString() }, { status: 201 });
}
