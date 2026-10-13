// 歌单与歌词类型 + LRC 解析工具
// 音源来自 Meting API（网易云歌单），服务端拉取播放地址与 LRC 文本后解析，
// 无需在本地维护音频/歌词文件。

export type LyricLine = { time: number; text: string; trans?: string };

export type Song = {
  url: string;
  title: string;
  artist: string;
  pic?: string; // 专辑封面（Meting 返回）
  lyrics: LyricLine[];
};

// 歌单元信息（列表展示用，不含全部歌曲）
export type PlaylistMeta = {
  id: string;
  name: string;
  cover?: string; // 歌单封面（取首曲专辑图）
  songCount?: number;
};

// 一个完整歌单
export type Playlist = PlaylistMeta & {
  songs: Song[];
};

// 解析用户输入：支持纯数字 ID，或网易云歌单链接
// 例：https://music.163.com/#/playlist?id=18414534798
//     https://music.163.com/playlist/18414534798/xxx
export function parsePlaylistId(input: string): string | null {
  const s = input.trim();
  if (/^\d+$/.test(s)) return s;
  const m = s.match(/[?&]id=(\d+)/) ?? s.match(/playlist\/(\d+)/);
  return m ? m[1] : null;
}

// 读取环境变量里配置的精选歌单：NETEASE_PLAYLISTS="id:名称,id:名称"
// 兼容旧变量 NETEASE_PLAYLIST_ID / NETEASE_PLAYLIST_NAME
export function getConfiguredPlaylists(): { id: string; name: string }[] {
  const raw = process.env.NETEASE_PLAYLISTS;
  if (raw) {
    const list = raw
      .split(",")
      .map((item) => {
        const [id, ...rest] = item.trim().split(":");
        return { id: id?.trim() ?? "", name: rest.join(":").trim() || "未命名歌单" };
      })
      .filter((p) => /^\d+$/.test(p.id));
    if (list.length) return list;
  }
  const legacyId = process.env.NETEASE_PLAYLIST_ID;
  if (legacyId) return [{ id: legacyId, name: process.env.NETEASE_PLAYLIST_NAME || "我的歌单" }];
  return [{ id: "18414534798", name: "我的歌单" }];
}

// 把一段 LRC 歌词文本解析成按时间排序的歌词行，并顺带提取歌名/歌手元信息
// 支持 [mm:ss]、[mm:ss.x]、[mm:ss.xx]、[mm:ss.xxx]，以及一行多时间标签。
// 双语歌词（一行原文 + 一行翻译共用同一时间戳）会被合并为一条 { text, trans }，
// 避免解析出两条 time 相同的歌词导致高亮错乱。
export function parseLrc(text: string): { title?: string; artist?: string; lyrics: LyricLine[] } {
  const rows: LyricLine[] = [];
  let title: string | undefined;
  let artist: string | undefined;

  for (const line of text.split(/\r?\n/)) {
    const ti = line.match(/\[ti:(.*?)\]/i);
    const ar = line.match(/\[ar:(.*?)\]/i);
    if (ti) title = ti[1].trim();
    if (ar) artist = ar[1].trim();

    const times: number[] = [];
    let m: RegExpExecArray | null;
    const re = /\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;
    while ((m = re.exec(line)) !== null) {
      const min = parseInt(m[1], 10);
      const sec = parseInt(m[2], 10);
      const frac = m[3] ? parseInt(m[3].padEnd(3, "0"), 10) / 1000 : 0;
      times.push(min * 60 + sec + frac);
    }

    const body = line.replace(/\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g, "").trim();
    if (!times.length || !body) continue;
    for (const t of times) rows.push({ time: t, text: body });
  }

  rows.sort((a, b) => a.time - b.time);

  // 合并同一时间戳的相邻行：外语原文为主行，中文翻译为副行（trans）
  const lyrics: LyricLine[] = [];
  for (const row of rows) {
    const last = lyrics[lyrics.length - 1];
    if (last && Math.abs(last.time - row.time) < 0.001 && !last.trans) {
      const lastIsZh = isChineseTranslation(last.text);
      const rowIsZh = isChineseTranslation(row.text);
      // 前一行为中文翻译、后一行为外语原文：交换，让外语做主行
      if (lastIsZh && !rowIsZh) {
        lyrics[lyrics.length - 1] = { time: last.time, text: row.text, trans: last.text };
      } else {
        last.trans = row.text;
      }
    } else {
      lyrics.push({ time: row.time, text: row.text });
    }
  }

  return { title, artist, lyrics };
}

// 判断一行是否为「中文翻译」：含汉字且不含假名（区分日文原文与中文译文）
function isChineseTranslation(s: string): boolean {
  return /[\u4e00-\u9fa5]/.test(s) && !/[\u3040-\u30ff]/.test(s);
}