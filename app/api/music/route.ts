import { NextResponse } from "next/server";
import { getConfiguredPlaylists } from "@/lib/music";
import { fetchPlaylistMeta } from "@/lib/music-server";

export const dynamic = "force-dynamic";

// 精选歌单列表（轻量元信息：封面/歌曲数，不含歌曲与歌词）
export async function GET() {
  const configured = getConfiguredPlaylists();
  const metas = await Promise.all(
    configured.map((p) => fetchPlaylistMeta(p.id, p.name)),
  );
  const playlists = metas.filter((m): m is NonNullable<typeof m> => m !== null);
  return NextResponse.json({ playlists });
}
