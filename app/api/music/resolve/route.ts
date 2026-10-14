import { NextResponse } from "next/server";
import { extractUrl, parsePlaylistInput } from "@/lib/music";
import { resolvePlaylistIdFromShortLink } from "@/lib/music-server";

export const dynamic = "force-dynamic";

// 解析访客粘贴的任意内容为歌单 ID：能直接解析的本地处理；短链（163cn.tv）走服务端跟随跳转
// GET /api/music/resolve?input=<粘贴的链接或整段分享文案>
export async function GET(req: Request) {
  const input = new URL(req.url).searchParams.get("input") ?? "";
  const direct = parsePlaylistInput(input);
  if (direct) return NextResponse.json({ id: direct });

  const url = extractUrl(input);
  if (!url) {
    return NextResponse.json({ error: "无法识别，请粘贴网易云歌单链接或歌单 ID" }, { status: 400 });
  }
  const id = await resolvePlaylistIdFromShortLink(url);
  if (!id) {
    return NextResponse.json({ error: "链接解析失败，请改用歌单链接或歌单 ID" }, { status: 404 });
  }
  return NextResponse.json({ id });
}
