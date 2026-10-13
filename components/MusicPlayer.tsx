"use client";

import { useMusic } from "@/components/music/MusicContext";

export default function MusicPlayer() {
  const {
    songs,
    currentSong: song,
    playing,
    current,
    duration,
    mode,
    toggle,
    next,
    prev,
    seek,
    cycleMode,
  } = useMusic();

  if (!song) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">歌单加载中…</p>
      </div>
    );
  }

  function fmt(s: number) {
    if (!s || Number.isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <div className="relative flex h-full flex-col">
      {/* ── 顶部组：黑胶唱片 + 歌曲信息（靠上） ── */}
      <div className="flex items-center gap-4">
        {/* 黑胶唱片（播放时旋转），放大到 80px */}
        <div className="relative h-20 w-20 shrink-0">
          <div
            className={`relative h-20 w-20 overflow-hidden rounded-full shadow-lg transition-transform duration-700 ${
              playing ? "animate-[spin_6s_linear_infinite]" : ""
            }`}
            style={{
              background:
                "repeating-radial-gradient(circle at 50% 50%, #1a1a1e 0 2px, #26262c 2px 3px)",
            }}
          >
            <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 shadow-inner" />
            <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-900" />
          </div>
          {/* 唱臂 */}
          <div
            className="absolute -right-1 -top-1.5 h-7 w-0.5 origin-top-right rounded-full bg-zinc-400 transition-transform duration-500 dark:bg-zinc-500"
            style={{ transform: playing ? "rotate(32deg)" : "rotate(12deg)" }}
          />
          {/* 中心小图标 */}
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90" />
        </div>

        {/* 歌曲信息 */}
        <div className="min-w-0 flex-1">
          <span className="mb-1 inline-block rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-violet-500">
            CLOUD MUSIC
          </span>
          <div className="truncate text-lg font-bold leading-tight text-zinc-900 dark:text-white">
            {song.title}
          </div>
          <div className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
            {song.artist}
          </div>
        </div>
      </div>

      {/* ── 中间组：编曲信息 + 进度条（my-auto 垂直居中，吃掉富余高度） ── */}
      <div className="my-auto w-full py-4">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="min-w-0 flex-1 truncate text-violet-500">编曲：{song.artist}</span>
          <span
            className={`inline-block h-3.5 w-0.5 bg-violet-400 ${
              playing ? "animate-pulse" : "opacity-30"
            }`}
          />
        </div>

        {/* 进度条：细长横条 + 圆点滑块 */}
        <div className="mt-3.5 flex items-center gap-2.5">
          <span className="w-9 shrink-0 text-right text-xs tabular-nums text-zinc-500">
            {fmt(current)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="播放进度"
            className="h-1 min-w-0 flex-1 cursor-pointer accent-violet-500"
          />
          <span className="w-9 shrink-0 text-xs tabular-nums text-zinc-500">{fmt(duration)}</span>
        </div>
      </div>

      {/* ── 底部组：控制按钮 + 循环模式（靠下） ── */}
      <div>
        <div className="flex items-center justify-center gap-7">
          <button
            onClick={prev}
            disabled={!songs.length}
            aria-label="上一首"
            className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-500 transition hover:bg-black/5 hover:text-zinc-700 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-zinc-200"
          >
            <PrevIcon />
          </button>
          <button
            onClick={toggle}
            aria-label={playing ? "暂停" : "播放"}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500 text-white shadow-lg transition hover:bg-violet-600 hover:shadow-xl"
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            onClick={next}
            disabled={!songs.length}
            aria-label="下一首"
            className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-500 transition hover:bg-black/5 hover:text-zinc-700 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-zinc-200"
          >
            <NextIcon />
          </button>
        </div>

        {/* 循环模式指示 */}
        <div className="mt-3 flex items-center justify-center">
          <button
            onClick={cycleMode}
            aria-label={mode === "all" ? "顺序播放" : mode === "one" ? "单曲循环" : "随机播放"}
            title={mode === "all" ? "顺序播放" : mode === "one" ? "单曲循环" : "随机播放"}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs transition hover:bg-black/5 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-200 ${
              mode === "all" ? "text-zinc-500" : "text-violet-500"
            }`}
          >
            {mode === "all" ? <RepeatIcon /> : mode === "one" ? <RepeatOneIcon /> : <ShuffleIcon />}
            <span>{mode === "all" ? "顺序播放" : mode === "one" ? "单曲循环" : "随机播放"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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
