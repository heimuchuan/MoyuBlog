// 服务端专用：Meting API（网易云）数据拉取与解析
import { parseLrc, type Playlist, type PlaylistMeta, type Song } from "./music";

const METING_API = process.env.METING_API || "https://api.injahow.cn/meting/";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

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
      headers: { "User-Agent": UA, Referer: "https://music.163.com/" },
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

// 从 URL 里取歌单 ID（供短链解析复用）
function idFromUrl(u: string): string | null {
  const m = u.match(/[?&]id=(\d+)/) ?? u.match(/playlist\/(\d+)/);
  return m ? m[1] : null;
}

// 跟随短链跳转解析歌单 ID：App 分享常给 163cn.tv 短链，本身不含 ID，需服务端跟随后取最终地址
export async function resolvePlaylistIdFromShortLink(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": UA },
    });
    const direct = idFromUrl(res.url);
    if (direct) return direct;
    // 少数短链直接返回落地页 HTML，从正文里再找一次
    const text = (await res.text()).slice(0, 200_000);
    const m = text.match(/playlist\/(\d+)/) ?? text.match(/[?&]id=(\d+)/);
    return m ? m[1] : null;
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

/* ─────────────── 网易云直连（配置 NETEASE_COOKIE 时启用，VIP 歌曲播完整版） ─────────────── */

const NETEASE_COOKIE_RAW = process.env.NETEASE_COOKIE?.trim() || "";

// 兼容用户只填了 MUSIC_U 的值（十六进制串）而没写 "MUSIC_U=" 前缀的情况
const NETEASE_COOKIE = NETEASE_COOKIE_RAW.includes("=")
  ? NETEASE_COOKIE_RAW
  : NETEASE_COOKIE_RAW
    ? `MUSIC_U=${NETEASE_COOKIE_RAW}`
    : "";

export function hasNeteaseCookie() {
  return NETEASE_COOKIE.length > 0;
}

function neteaseHeaders(): HeadersInit {
  // 网易云 web API 要求请求带客户端标识（os=pc / appver），否则 VIP 歌曲一律返回 null；
  // 这里统一给 Cookie 追加这些标识，用户只需配置 MUSIC_U 即可。
  const cookieParts = [NETEASE_COOKIE, "os=pc", "appver=3.0.0.1", "channel=netease"]
    .filter(Boolean)
    .join("; ");
  return {
    "User-Agent": UA,
    Referer: "https://music.163.com/",
    Cookie: cookieParts,
  };
}

export type NeteaseTrack = {
  id: number;
  name: string;
  ar?: { name: string }[];
  artists?: { name: string }[];
  al?: { picUrl?: string };
  album?: { picUrl?: string };
};

// 拉歌单全部曲目元信息：v6 detail 接口拿全量 trackIds（老 GET 接口匿名只有前 10 首），
// 再分批 song/detail 补齐名称/歌手/封面
export async function fetchNeteaseTracks(id: string): Promise<NeteaseTrack[] | null> {
  try {
    const res = await fetch("https://music.163.com/api/v6/playlist/detail", {
      method: "POST",
      headers: { ...neteaseHeaders(), "Content-Type": "application/x-www-form-urlencoded" },
      body: `id=${id}&n=1000`,
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { playlist?: { trackIds?: { id?: number }[] } };
    const trackIds = (data?.playlist?.trackIds ?? [])
      .map((t) => t.id)
      .filter((v): v is number => typeof v === "number");
    if (!trackIds.length) return null;

    // song/detail 单次建议不超过 200 个，避免 URL 超长
    const tracks: NeteaseTrack[] = [];
    for (let i = 0; i < trackIds.length; i += 200) {
      const batch = trackIds.slice(i, i + 200);
      const c = encodeURIComponent(JSON.stringify(batch.map((sid) => ({ id: sid }))));
      const r = await fetch(`https://music.163.com/api/v3/song/detail?c=${c}`, {
        headers: neteaseHeaders(),
        signal: AbortSignal.timeout(10000),
        next: { revalidate: 3600 },
      });
      if (!r.ok) continue;
      const d = (await r.json()) as { songs?: NeteaseTrack[] };
      if (Array.isArray(d?.songs)) tracks.push(...d.songs);
    }
    return tracks.length ? tracks : null;
  } catch {
    return null;
  }
}

// 实时解析单曲播放地址；VIP 歌曲需 NETEASE_COOKIE 才返回完整版，无版权返回 null
export async function fetchNeteaseSongUrl(songId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://music.163.com/api/song/enhance/player/url?ids=${encodeURIComponent(
        `[${songId}]`,
      )}&br=320000`,
      { headers: neteaseHeaders(), signal: AbortSignal.timeout(8000), cache: "no-store" },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { data?: { url?: string | null }[] };
    return data?.data?.[0]?.url ?? null;
  } catch {
    return null;
  }
}

// 拉歌词（原文 + 翻译合并成一段 LRC，交给 parseLrc 处理双语）
export async function fetchNeteaseLyric(songId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://music.163.com/api/song/lyric?id=${songId}&lv=1&tv=1`, {
      headers: neteaseHeaders(),
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { lrc?: { lyric?: string }; tlyric?: { lyric?: string } };
    const parts = [data?.lrc?.lyric, data?.tlyric?.lyric].filter(
      (v): v is string => typeof v === "string" && v.length > 0,
    );
    return parts.join("\n") || null;
  } catch {
    return null;
  }
}
