import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractUrl, parsePlaylistInput } from "@/lib/music";
import {
  fetchNeteasePlaylistName,
  fetchPlaylistMeta,
  resolvePlaylistIdFromShortLink,
} from "@/lib/music-server";

export const dynamic = "force-dynamic";

const orderBy = [{ isDefault: "desc" as const }, { order: "asc" as const }, { id: "asc" as const }];

// 列出全部歌单（前台只用 active 的，管理员需要全部）
export async function GET() {
  const rows = await prisma.playlist.findMany({ orderBy });
  return NextResponse.json(rows);
}

// 新增歌单（仅管理员）：粘贴链接/ID/整段分享文案即可，名称与封面自动抓取
export async function POST(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const input = String(body.input || "").trim();
  const providedName = String(body.name || "").trim();

  // 解析歌单 ID：本地能解析就直接用，短链交给服务端跟随跳转
  let id = parsePlaylistInput(input);
  if (!id) {
    const url = extractUrl(input);
    if (url) id = await resolvePlaylistIdFromShortLink(url);
  }
  if (!id) {
    return NextResponse.json({ error: "无法识别，请粘贴歌单链接或歌单 ID" }, { status: 400 });
  }

  const exists = await prisma.playlist.findUnique({ where: { playlistId: id } });
  if (exists) {
    return NextResponse.json({ error: "该歌单已存在" }, { status: 409 });
  }

  const neteaseName = await fetchNeteasePlaylistName(id);
  const name = providedName || neteaseName || `歌单 ${id}`;
  const meta = await fetchPlaylistMeta(id, name);
  if (!meta) {
    return NextResponse.json({ error: "歌单不存在、为空或为私密歌单" }, { status: 400 });
  }

  const n = Number(body.order);
  const row = await prisma.playlist.create({
    data: {
      playlistId: id,
      name,
      cover: meta.cover ?? null,
      songCount: meta.songCount ?? 0,
      order: Number.isFinite(n) ? Math.trunc(n) : 0,
      active: body.active !== false,
    },
  });

  revalidateTag("music", { expire: 0 });
  return NextResponse.json(row);
}
