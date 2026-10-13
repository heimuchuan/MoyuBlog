// 服务端专用：Meting API（网易云）数据拉取与解析
import { parseLrc, type Playlist, type PlaylistMeta, type Song } from "./music";

const METING_API = process.env.METING_API || "https://api.injahow.cn/meting/";

type MetingSong = {
  name: string;
  artist: string;
  url: string; // Meting 的 type=url 链接，播放时自动解析为最新真实地址，不怕过期
  pic?: string; // 专辑封面
  lrc: string; // Meting 的 type=lrc 链接，返回 LRC 文本
};

async function fetchJson<T>(url: string, revalidate = 3600): Promise<T | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      next: { revalidate },
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

async function fetchRaw(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 86400 }, // 歌词基本不变，缓存一天
    });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

function playlistUrl(id: string) {
  return `${METING_API}?server=netease&type=playlist&id=${id}`;
}

// 尝试从网易云公开接口取歌单真实名称（Meting 不返回歌单名）；失败返回 null
export async function fetchNeteasePlaylistName(id: string): Promise<string | null> {
  try {
    const res = await fetch(`https://music.163.com/api/playlist/detail?id=${id}`, {
      signal: AbortSignal.timeout(6000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Referer: "https://music.163.com/",
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: { name?: string } };
    const name = data?.result?.name?.trim();
    return name || null;
  } catch {
    return null;
  }
}

// 只拉歌单原始列表（不带歌词），用于元信息/封面/歌曲数
async function fetchRawPlaylist(id: string): Promise<MetingSong[] | null> {
  const list = await fetchJson<MetingSong[]>(playlistUrl(id));
  return Array.isArray(list) && list.length ? list : null;
}

// 歌单元信息：封面取首曲专辑图
export async function fetchPlaylistMeta(
  id: string,
  fallbackName: string,
): Promise<PlaylistMeta | null> {
  const list = await fetchRawPlaylist(id);
  if (!list) return null;
  return {
    id,
    name: fallbackName,
    cover: list[0]?.pic || list.find((s) => s.pic)?.pic,
    songCount: list.length,
  };
}

// 拉一首歌词并解析；失败降级为无歌词，不影响播放
async function fetchLyrics(lrcUrl: string): Promise<Song["lyrics"]> {
  const text = await fetchRaw(lrcUrl);
  return text ? parseLrc(text).lyrics : [];
}

// 完整歌单：歌曲 + 歌词（并发）
export async function fetchPlaylist(id: string, name: string): Promise<Playlist | null> {
  const list = await fetchRawPlaylist(id);
  if (!list) return null;

  const lyricsList = await Promise.all(list.map((s) => fetchLyrics(s.lrc)));
  const songs: Song[] = list.map((s, i) => ({
    url: s.url,
    title: s.name,
    artist: s.artist,
    pic: s.pic,
    lyrics: lyricsList[i],
  }));

  return { id, name, cover: songs.find((s) => s.pic)?.pic, songCount: songs.length, songs };
}
