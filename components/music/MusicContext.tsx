"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { type Playlist, type PlaylistMeta, type Song } from "@/lib/music";

type Mode = "all" | "one" | "shuffle";

type MusicContextValue = {
  metas: PlaylistMeta[]; // 后台配置的精选歌单
  tempMetas: PlaylistMeta[]; // 访客本次导入的临时歌单（仅内存，刷新/关页即清空）
  activeMeta?: PlaylistMeta; // 当前歌单元信息
  songs: Song[]; // 当前歌单歌曲
  songIndex: number;
  currentSong?: Song;
  playing: boolean;
  current: number;
  duration: number;
  mode: Mode;
  loadingPlaylist: boolean;
  openPlaylist: (
    id: string,
    autoplay?: boolean,
    save?: boolean,
  ) => Promise<{ ok: boolean; error?: string }>;
  removeTempPlaylist: (id: string) => void;
  playAt: (index: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (t: number) => void;
  cycleMode: () => void;
};

// 旧版本把「我的歌单」存在本地浏览器里，现已改为后台配置 + 临时歌单，挂载时清理一次存量数据
const LEGACY_STORAGE_KEY = "moyu_custom_playlists";

const MusicContext = createContext<MusicContextValue | null>(null);

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic 必须在 MusicProvider 内使用");
  return ctx;
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [metas, setMetas] = useState<PlaylistMeta[]>([]);
  const [tempMetas, setTempMetas] = useState<PlaylistMeta[]>([]);
  const [activeMeta, setActiveMeta] = useState<PlaylistMeta>();
  const [songs, setSongs] = useState<Song[]>([]);
  const [songIndex, setSongIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mode, setMode] = useState<Mode>("all");
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);

  const currentSong = songs[songIndex];

  // 初始：拉精选歌单列表，并自动加载第一个歌单（不自动播放）
  useEffect(() => {
    let cancelled = false;
    fetch("/api/music")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !Array.isArray(d?.playlists)) return;
        setMetas(d.playlists);
        const first = d.playlists[0] as PlaylistMeta | undefined;
        if (first) openPlaylist(first.id, false, false);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 清理旧版本遗留的本地「我的歌单」数据（现改为后台配置 + 临时歌单，不再落本地）
  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      /* 存储不可用时忽略 */
    }
  }, []);

  // 移除一个临时歌单（若正在播放它，由页面决定切到哪个歌单）
  const removeTempPlaylist = useCallback((id: string) => {
    setTempMetas((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // 打开任意歌单（后台精选，或访客导入的临时歌单）
  // save=true 时加入"临时歌单"（仅本次会话）；初始自动加载精选歌单时传 false
  const openPlaylist = useCallback(
    async (id: string, autoplay = true, save = true) => {
      setLoadingPlaylist(true);
      try {
        const res = await fetch(`/api/music/songs?id=${encodeURIComponent(id)}`);
        const data = (await res.json()) as { playlist?: Playlist; error?: string };
        if (!res.ok || !data.playlist) {
          return { ok: false, error: data.error || "歌单加载失败" };
        }
        const pl = data.playlist;
        setActiveMeta({
          id: pl.id,
          name: pl.name,
          cover: pl.cover,
          songCount: pl.songCount,
        });
        // 加入"临时歌单"（已存在则原地更新，新导入的插到最前）
        if (save) {
          setTempMetas((prev) => {
            const meta: PlaylistMeta = {
              id: pl.id,
              name: pl.name,
              cover: pl.cover,
              songCount: pl.songCount,
            };
            const rest = prev.filter((m) => m.id !== pl.id);
            return rest.length === prev.length ? [meta, ...prev] : prev.map((m) => (m.id === pl.id ? meta : m));
          });
        }
        setSongs(pl.songs);
        setSongIndex(0);
        setCurrent(0);
        setDuration(0);
        setPlaying(false);
        if (autoplay) {
          requestAnimationFrame(() => {
            const a = audioRef.current;
            if (a) {
              a.currentTime = 0;
              void a.play().catch(() => {});
            }
            setPlaying(true);
          });
        }
        return { ok: true };
      } catch {
        return { ok: false, error: "网络错误，歌单加载失败" };
      } finally {
        setLoadingPlaylist(false);
      }
    },
    [],
  );

  const playAt = useCallback(
    (index: number) => {
      if (!songs.length) return;
      setSongIndex(index);
      setCurrent(0);
      setDuration(0);
      setPlaying(false);
      requestAnimationFrame(() => {
        const a = audioRef.current;
        if (a) {
          a.currentTime = 0;
          void a.play().catch(() => {});
        }
        setPlaying(true);
      });
    },
    [songs.length],
  );

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a || !songs.length) return;
    if (playing) a.pause();
    else void a.play().catch(() => {});
    setPlaying((p) => !p);
  }, [playing, songs.length]);

  const next = useCallback(() => {
    if (!songs.length) return;
    if (mode === "shuffle") {
      if (songs.length <= 1) return playAt(0);
      let r = songIndex;
      while (r === songIndex) r = Math.floor(Math.random() * songs.length);
      return playAt(r);
    }
    playAt((songIndex + 1) % songs.length);
  }, [songs.length, mode, songIndex, playAt]);

  const prev = useCallback(() => {
    if (!songs.length) return;
    playAt((songIndex - 1 + songs.length) % songs.length);
  }, [songs.length, songIndex, playAt]);

  const seek = useCallback((t: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = t;
    setCurrent(t);
  }, []);

  const cycleMode = useCallback(() => {
    setMode((m) => (m === "all" ? "one" : m === "one" ? "shuffle" : "all"));
  }, []);

  const value = useMemo<MusicContextValue>(
    () => ({
      metas,
      tempMetas,
      activeMeta,
      removeTempPlaylist,
      songs,
      songIndex,
      currentSong,
      playing,
      current,
      duration,
      mode,
      loadingPlaylist,
      openPlaylist,
      playAt,
      toggle,
      next,
      prev,
      seek,
      cycleMode,
    }),
    [
      metas,
      tempMetas,
      removeTempPlaylist,
      activeMeta,
      songs,
      songIndex,
      currentSong,
      playing,
      current,
      duration,
      mode,
      loadingPlaylist,
      openPlaylist,
      playAt,
      toggle,
      next,
      prev,
      seek,
      cycleMode,
    ],
  );

  return (
    <MusicContext.Provider value={value}>
      {children}
      {/* 全局唯一 audio 元素，跨页面持续播放 */}
      <audio
        ref={audioRef}
        src={currentSong?.url}
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          setCurrent(a.currentTime);
          setDuration(a.duration || 0);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onEnded={() => {
          if (mode === "one") {
            const a = audioRef.current;
            if (a) {
              a.currentTime = 0;
              void a.play().catch(() => {});
              setPlaying(true);
            }
            return;
          }
          next();
        }}
      />
    </MusicContext.Provider>
  );
}
