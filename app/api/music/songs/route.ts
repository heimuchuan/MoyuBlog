import { NextResponse } from "next/server";
import { getConfiguredPlaylists, parsePlaylistId } from "@/lib/music";
import { fetchNeteasePlaylistName, fetchPlaylist } from "@/lib/music-server";

export const dynamic = "force-dynamic";

// 按歌单 ID（或网易云歌单链接）取完整歌单：歌曲 + 播放地址 + 歌词
// GET /api/music/songs?id=18414534798
export async function GET(req: Request) {
  const rawId = new URL(req.url).searchParams.get("id") ?? "";
  const id = parsePlaylistId(rawId);
  if (!id) {
    return NextResponse.json({ error: "无效的歌单 ID 或链接" }, { status: 400 });
  }

  // 精选歌单用配置名；用户导入的歌单尝试取网易云真实名称，失败兜底 "歌单 {id}"
  const configured = getConfiguredPlaylists().find((p) => p.id === id);
  const name =
    configured?.name ?? (await fetchNeteasePlaylistName(id)) ?? `歌单 ${id}`;

  const playlist = await fetchPlaylist(id, name);
  if (!playlist) {
    return NextResponse.json(
      { error: "歌单不存在、为空或为私密歌单" },
      { status: 404 },
    );
  }
  return NextResponse.json({ playlist });
}
