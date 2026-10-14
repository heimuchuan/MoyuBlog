import { NextResponse } from "next/server";
import { getFeaturedPlaylists } from "@/lib/public-data";

export const dynamic = "force-dynamic";

// 精选歌单列表（后台配置，读库并走 unstable_cache；后台写操作后 revalidateTag 立即失效）
export async function GET() {
  const rows = await getFeaturedPlaylists();
  const playlists = rows.map((p) => ({
    id: p.playlistId,
    name: p.name,
    cover: p.cover ?? undefined,
    songCount: p.songCount,
  }));
  // 禁止浏览器缓存：后台改配置后前台应及时刷新（服务端已有 unstable_cache 兜性能）
  return NextResponse.json({ playlists }, { headers: { "Cache-Control": "no-store" } });
}
