"use client";

import { useMusic } from "./MusicContext";
import { MusicIcon } from "@/components/Icons";

// 首页歌词横条：深色毛玻璃 + 频谱条 + 当前歌词 + 音符图标，状态全部来自全局 MusicContext
export default function LyricBar() {
  const { currentSong, current, playing } = useMusic();
  const lyrics = currentSong?.lyrics ?? [];
  const activeLine = lyrics.reduce(
    (acc, l, i) => (current >= l.time ? i : acc),
    0,
  );

  return (
    <div className="flex items-center gap-4 rounded-full border border-white/10 bg-zinc-900/60 px-5 py-3 shadow-lg backdrop-blur-xl dark:bg-zinc-950/60">
      {/* 左侧：3 根紫色频谱条 */}
      <div className="flex h-5 items-end gap-[2px]">
        {[0, 0.12, 0.24].map((d, i) => (
          <span
            key={i}
            className="w-[3px] origin-bottom rounded-full bg-violet-500"
            style={{
              animation: "equalizer-bar 1.2s ease-in-out infinite",
              animationDelay: `${d}s`,
              animationPlayState: playing ? "running" : "paused",
              opacity: playing ? 0.9 : 0.35,
              height: i === 1 ? "20px" : "16px",
            }}
          />
        ))}
      </div>

      {/* 中间：当前歌词（单行，切换时淡入） */}
      <div className="min-w-0 flex-1 text-center">
        {lyrics.length === 0 ? (
          <span className="text-sm text-white/40">暂无歌词</span>
        ) : (
          <p
            key={activeLine}
            className="animate-[lyric-in_0.3s_ease-out_forwards] truncate text-sm text-white"
          >
            {lyrics[activeLine]?.text}
            {lyrics[activeLine]?.trans ? (
              <span className="ml-2 text-xs text-white/50">{lyrics[activeLine].trans}</span>
            ) : null}
          </p>
        )}
      </div>

      {/* 右侧：音符图标 */}
      <MusicIcon className="h-4 w-4 shrink-0 text-white/60" />
    </div>
  );
}
