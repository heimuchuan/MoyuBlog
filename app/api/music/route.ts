import { NextResponse } from "next/server";
import { readdirSync, readFileSync, existsSync } from "fs";
import path from "path";
import { parseLrc, type Song, type Playlist } from "@/lib/music";

// 每次请求都实时扫描，便于随时放新歌（无需重启）
export const dynamic = "force-dynamic";

const AUDIO_RE = /\.(mp3|m4a|wav|ogg|flac)$/i;

// 递归扫描 public/music：每个子文件夹 = 一个歌单，根目录直放的文件归入「默认」歌单
export async function GET() {
  const dir = path.join(process.cwd(), "public", "music");
  const groups = new Map<string, Song[]>();

  if (!existsSync(dir)) return NextResponse.json({ playlists: [] });

  // 递归收集所有音频文件路径，并保留相对于 music 根目录的位置信息
  function collectAudio(current: string, relDir: string, out: { filePath: string; relDir: string }[]) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      const rel = relDir ? `${relDir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) collectAudio(full, rel, out);
      else if (AUDIO_RE.test(entry.name)) out.push({ filePath: full, relDir });
    }
  }

  const list: { filePath: string; relDir: string }[] = [];
  collectAudio(dir, "", list);

  for (const { filePath, relDir } of list) {
    // 歌单名 = 文件所在的顶层子文件夹；根目录直放则归「默认」
    const groupName = relDir.split("/")[0] || "默认";

    const fileName = path.basename(filePath);
    const base = fileName.replace(/\.[^.]+$/, "");
    // url 相对 public 目录，子目录一并保留
    const rel = path.relative(path.join(process.cwd(), "public"), filePath);
    const url = `/${rel.split(path.sep).join("/")}`;

    let title = base;
    let artist = "";
    let lyrics: Song["lyrics"] = [];

    // 同名 .lrc（同目录下）存在则解析歌词与元信息
    const lrcPath = filePath.replace(/\.[^.]+$/, ".lrc");
    if (existsSync(lrcPath)) {
      try {
        const text = readFileSync(lrcPath, "utf-8");
        const parsed = parseLrc(text);
        if (parsed.title) title = parsed.title;
        if (parsed.artist) artist = parsed.artist;
        lyrics = parsed.lyrics;
      } catch {
        // 歌词解析失败时降级为无歌词，不影响歌曲播放
      }
    }

    if (!groups.has(groupName)) groups.set(groupName, []);
    groups.get(groupName)!.push({ url, title, artist, lyrics });
  }

  const playlists: Playlist[] = [...groups.entries()].map(([name, songs]) => ({ name, songs }));

  return NextResponse.json({ playlists });
}