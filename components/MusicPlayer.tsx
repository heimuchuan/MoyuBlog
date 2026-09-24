"use client";

import { useEffect, useRef, useState } from "react";
import { type Playlist } from "@/lib/music";

export default function MusicPlayer({
  playlists,
  onTimeChange,
  onSongChange,
  onPlayingChange,
}: {
  playlists: Playlist[];
  onTimeChange?: (t: number) => void;
  onSongChange?: (playlistIndex: number, songIndex: number) => void;
  onPlayingChange?: (playing: boolean) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [songIndex, setSongIndex] = useState(0);
  const [plListOpen, setPlListOpen] = useState(false);
  const [songListOpen, setSongListOpen] = useState(false);
  const [mode, setMode] = useState<"all" | "one" | "shuffle">("all");

  const pl = playlists[playlistIndex];
  const song = pl?.songs[songIndex];

  // 歌单/歌曲变化时通知父组件（用于同步歌词）
  useEffect(() => {
    onSongChange?.(playlistIndex, songIndex);
  }, [playlistIndex, songIndex, onSongChange]);

  // 播放状态变化时通知父组件（用于联动歌词卡律动柱状图）
  useEffect(() => {
    onPlayingChange?.(playing);
  }, [playing, onPlayingChange]);

  // playlists 变化时，若索引越界则归零
  useEffect(() => {
    if (!playlists.length) {
      setPlaylistIndex(0);
      setSongIndex(0);
      return;
    }
    if (playlistIndex >= playlists.length) setPlaylistIndex(0);
  }, [playlists, playlistIndex]);

  if (!song) {
    return (
      <p className="text-sm text-zinc-400 dark:text-zinc-500">
        歌单还是空的，在 public/music 下建文件夹，每个文件夹就是一个歌单，把 .mp3 和同名 .lrc 丢进去即可
        自动加载。
      </p>
    );
  }

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.pause();
    else a.play();
    setPlaying(!playing);
  }

  function playSong(pi: number, si: number) {
    setPlaylistIndex(pi);
    setSongIndex(si);
    setCurrent(0);
    setDuration(0);
    setPlaying(false);
    setPlListOpen(false);
    setSongListOpen(false);
    requestAnimationFrame(() => {
      const a = audioRef.current;
      if (a) a.play();
      setPlaying(true);
    });
  }

  function selectPlaylist(pi: number) {
    // 切歌单：从新歌单第一首开始播
    playSong(pi, 0);
  }
function prev() {
    playSong(playlistIndex, (songIndex - 1 + pl.songs.length) % pl.songs.length);
  }
  function next() {
    if (mode === "shuffle") {
      // 单曲歌单直接原地重播
      if (pl.songs.length <= 1) return playSong(playlistIndex, 0);
      let r = songIndex;
      while (r === songIndex) r = Math.floor(Math.random() * pl.songs.length);
      return playSong(playlistIndex, r);
    }
    playSong(playlistIndex, (songIndex + 1) % pl.songs.length);
  }

  function onEnded() {
    if (mode === "one") {
      // 单曲循环：当前曲目重播
      const a = audioRef.current;
      if (a) {
        a.currentTime = 0;
        a.play();
        setPlaying(true);
      }
      return;
    }
    next();
  }

  function cycleMode() {
    setMode((m) => (m === "all" ? "one" : m === "one" ? "shuffle" : "all"));
  }

  function onTime(e: React.SyntheticEvent<HTMLAudioElement>) {
    const a = e.currentTarget;
    setCurrent(a.currentTime);
    setDuration(a.duration || 0);
    onTimeChange?.(a.currentTime);
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const a = audioRef.current;
    if (!a) return;
    const t = Number(e.target.value);
    a.currentTime = t;
    setCurrent(t);
    onTimeChange?.(t);
  }

  function fmt(s: number) {
    if (!s || Number.isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <div className="relative p-1">
      <audio
        ref={audioRef}
        src={song.url}
        onTimeUpdate={onTime}
        onLoadedMetadata={onTime}
        onEnded={onEnded}
      />

      {/* 歌单名按钮：单独一个下拉选歌单 */}
      <div className="relative">
        <button
          onClick={() => setPlListOpen((v) => !v)}
          className="mb-2 flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-1 text-xs text-zinc-600 transition hover:bg-black/10 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/20"
        >
          <span className="text-zinc-500">🎵</span>
          <span className="truncate">{pl.name}</span>
          <CaretIcon />
        </button>

        {plListOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setPlListOpen(false)} />
            <div className="scrollbar-none absolute left-0 top-full z-50 mt-1 max-h-56 w-48 overflow-y-auto rounded-2xl border border-white/60 bg-white/90 p-1 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/95">
              {playlists.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => selectPlaylist(i)}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                    i === playlistIndex
                      ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
                      : "text-zinc-700 hover:bg-black/5 dark:text-zinc-200 dark:hover:bg-white/10"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  <span className="text-xs tabular-nums text-zinc-400">{p.songs.length}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label={playing ? "暂停" : "播放"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white transition hover:bg-indigo-600"
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">
            {song.title} · <span className="text-zinc-500">{song.artist}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs tabular-nums text-zinc-500">{fmt(current)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={current}
              onChange={seek}
              className="h-1 flex-1 cursor-pointer accent-indigo-500"
            />
            <span className="text-xs tabular-nums text-zinc-500">{fmt(duration)}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-black/5 pt-2 dark:border-white/10">
        <button
          onClick={prev}
          aria-label="上一首"
          className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-500 transition hover:bg-black/5 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-200"
        >
          <PrevIcon /> 上一首
        </button>
        {/* 播放模式切换：顺序 → 单曲循环 → 随机 */}
        <button
          onClick={cycleMode}
          aria-label={mode === "all" ? "顺序播放" : mode === "one" ? "单曲循环" : "随机播放"}
          title={mode === "all" ? "顺序播放" : mode === "one" ? "单曲循环" : "随机播放"}
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs transition hover:bg-black/5 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-200 ${
            mode === "all" ? "text-zinc-500" : "text-indigo-500"
          }`}
        >
          {mode === "all" ? <RepeatIcon /> : mode === "one" ? <RepeatOneIcon /> : <ShuffleIcon />}
        </button>
        {/* 歌曲列表按钮：独立下拉选当前歌单的歌 */}
        <div className="relative">
          <button
            onClick={() => setSongListOpen((v) => !v)}
            aria-label="歌曲列表"
            className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-500 transition hover:bg-black/5 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-200"
          >
            歌曲 · {songIndex + 1}/{pl.songs.length} <ListIcon />
          </button>

          {songListOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setSongListOpen(false)} />
              <div className="scrollbar-none absolute right-0 top-full z-50 mt-1 max-h-56 w-52 overflow-y-auto rounded-2xl border border-white/60 bg-white/90 p-1 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/95">
                {pl.songs.map((s, i) => (
                  <button
                    key={s.url}
                    onClick={() => playSong(playlistIndex, i)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition ${
                      i === songIndex
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
                        : "text-zinc-700 hover:bg-black/5 dark:text-zinc-200 dark:hover:bg-white/10"
                    }`}
                  >
                    <span className="w-4 shrink-0 text-center text-xs tabular-nums text-zinc-400">
                      {i === songIndex ? "♪" : i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {s.title}
                      {s.artist ? <span className="text-zinc-400"> · {s.artist}</span> : null}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <button
          onClick={next}
          aria-label="下一首"
          className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-zinc-500 transition hover:bg-black/5 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-200"
        >
          下一首 <NextIcon />
        </button>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}

function PrevIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6h2v12H6zM18 6l-8 6 8 6z" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 6h2v12h-2zM6 6l8 6-8 6z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 6h16v2H4zM4 11h16v2H4zM4 16h16v2H4z" />
    </svg>
  );
}

function CaretIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 10l5 5 5-5z" />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11v-1a4 4 0 014-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v1a4 4 0 01-4 4H3" />
    </svg>
  );
}

function RepeatOneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11v-1a4 4 0 014-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v1a4 4 0 01-4 4H3" />
      <path d="M11 10h1v4" />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3h5v5" />
      <path d="M4 20L21 3" />
      <path d="M21 16v5h-5" />
      <path d="M15 15l6 6" />
      <path d="M4 4l5 5" />
    </svg>
  );
}