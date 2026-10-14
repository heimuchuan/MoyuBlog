import { NextResponse } from "next/server";
import { parsePlaylistId } from "@/lib/music";
import {
  fetchNeteaseLyric,
  fetchNeteasePlaylistName,
  fetchNeteaseTracks,
  fetchPlaylist,
  hasNeteaseCookie,
  type NeteaseTrack,
} from "@/lib/music-server";
import { parseLrc, type Playlist, type Song } from "@/lib/music";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function artistOf(t: NeteaseTrack) {
  return (t.ar ?? t.artists ?? []).map((a: { name: string }) => a.name).join("/") || "未知歌手";
}

function coverOf(t: NeteaseTrack) {
  return t.al?.picUrl ?? t.album?.picUrl ?? undefined;
}

// 直连模式：网易云官方接口拉曲目 + 歌词，播放地址统一指向本站 stream 代理（实时解析，VIP 完整版）
async function fetchPlaylistDirect(id: string, name: string): Promise<Playlist | null> {
  const tracks = await fetchNeteaseTracks(id);
  if (!tracks?.length) return null;

  const lyricTexts = await Promise.all(tracks.map((t) => fetchNeteaseLyric(String(t.id))));
  const songs: Song[] = tracks.map((t, i) => ({
    // 相对路径指向本站代理，播放时由服务端带 Cookie 实时解析最新 CDN 地址
    url: `/api/music/stream?id=${t.id}`,
    title: t.name,
    artist: artistOf(t),
    pic: coverOf(t),
    lyrics: lyricTexts[i] ? parseLrc(lyricTexts[i] as string).lyrics : [],
  }));

  return {
    id,
    name,
    cover: songs.map((s) => s.pic).find(Boolean),
    songCount: songs.length,
    songs,
  };
}

// 按歌单 ID（或网易云歌单链接）取完整歌单：歌曲 + 播放地址 + 歌词
// GET /api/music/songs?id=18414534798
export async function GET(req: Request) {
  const rawId = new URL(req.url).searchParams.get("id") ?? "";
  const id = parsePlaylistId(rawId);
  if (!id) {
    return NextResponse.json({ error: "无效的歌单 ID 或链接" }, { status: 400 });
  }

  // 后台配置过的歌单用后台名称；访客临时导入的歌单尝试取网易云真实名称，失败兜底 "歌单 {id}"
  const configured = await prisma.playlist
    .findUnique({ where: { playlistId: id }, select: { name: true } })
    .catch(() => null);
  const name =
    configured?.name ?? (await fetchNeteasePlaylistName(id)) ?? `歌单 ${id}`;

  // 配置了网易云 Cookie 时走直连（VIP 歌曲完整版）；失败降级 Meting
  let playlist: Playlist | null = null;
  if (hasNeteaseCookie()) {
    playlist = await fetchPlaylistDirect(id, name);
  }
  playlist ??= await fetchPlaylist(id, name);

  if (!playlist) {
    return NextResponse.json(
      { error: "歌单不存在、为空或为私密歌单" },
      { status: 404 },
    );
  }
  return NextResponse.json({ playlist });
}
