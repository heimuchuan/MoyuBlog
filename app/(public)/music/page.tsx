"use client";

import { useState } from "react";
import MusicPlayer from "@/components/MusicPlayer";
import { useMusic } from "@/components/music/MusicContext";
import { extractUrl, parsePlaylistInput, type PlaylistMeta } from "@/lib/music";

export default function MusicPage() {
  const {
    metas,
    tempMetas,
    activeMeta,
    songs,
    songIndex,
    playing,
    loadingPlaylist,
    openPlaylist,
    removeTempPlaylist,
    playAt,
  } = useMusic();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [openingId, setOpeningId] = useState<string | null>(null);
  const busy = openingId !== null;

  async function handleOpen(id: string) {
    setError("");
    setOpeningId(id);
    // 精选歌单不进"我的歌单"；自定义歌单打开时原地更新信息
    const isFeatured = metas.some((m) => m.id === id);
    const r = await openPlaylist(id, true, !isFeatured);
    if (!r.ok) setError(r.error || "歌单打开失败");
    setOpeningId(null);
  }

  // 移除临时歌单；若正在播放它，自动切到第一个可用歌单（回退到精选不触发收藏）
  function handleRemove(id: string) {
    const wasActive = activeMeta?.id === id;
    removeTempPlaylist(id);
    if (wasActive) {
      const nextFeatured = metas[0];
      const nextTemp = tempMetas.find((m) => m.id !== id);
      if (nextFeatured) void openPlaylist(nextFeatured.id, false, false);
      else if (nextTemp) void openPlaylist(nextTemp.id, false, false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setError("");
    setOpeningId("__parse");
    // 本地能解析就直接拿 ID；短链（163cn.tv）交给服务端跟随跳转解析
    let id = parsePlaylistInput(text);
    if (!id) {
      const url = extractUrl(text);
      if (!url) {
        setError("无法识别，请粘贴网易云歌单链接或歌单 ID");
        setOpeningId(null);
        return;
      }
      const res = await fetch(`/api/music/resolve?input=${encodeURIComponent(text)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.id) {
        setError(data.error || "链接解析失败，请改用歌单链接或歌单 ID");
        setOpeningId(null);
        return;
      }
      id = data.id as string;
    }
    setInput("");
    await handleOpen(id);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6">
      {/* 标题：紧凑靠左，减少顶部留白 */}
      <h1 className="text-2xl font-bold tracking-tight">音乐</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        来自网易云音乐的公开歌单 · 点击歌单或歌曲即可播放
      </p>

      {/* 精选歌单 */}
      <section className="mt-4">
        <h2 className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300">精选歌单</h2>
        {metas.length === 0 ? (
          <div className="flex gap-3">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-[76px] w-52 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5"
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {metas.map((m) => (
              <PlaylistCard
                key={m.id}
                meta={m}
                active={m.id === activeMeta?.id}
                busy={busy}
                onOpen={() => handleOpen(m.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 临时歌单（访客导入，仅本次会话有效） */}
      {tempMetas.length > 0 && (
        <section className="mt-4">
          <h2 className="mb-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
            临时歌单
            <span className="ml-2 text-xs font-normal text-zinc-400">
              {tempMetas.length} 个 · 仅本次浏览有效，刷新后自动清空
            </span>
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tempMetas.map((m) => (
              <PlaylistCard
                key={m.id}
                meta={m}
                active={m.id === activeMeta?.id}
                busy={busy}
                onOpen={() => handleOpen(m.id)}
                onRemove={() => handleRemove(m.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 控制栏：输入框与按钮合并为一个毛玻璃整体 */}
      <form
        onSubmit={handleSubmit}
        className="mt-3 flex items-center gap-2 rounded-full border border-white/20 bg-white/40 px-2 py-1.5 pl-5 shadow-sm backdrop-blur-md transition focus-within:border-violet-400/50 focus-within:ring-2 focus-within:ring-violet-400/15 dark:border-white/10 dark:bg-white/5"
      >
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError("");
          }}
          placeholder="粘贴网易云歌单链接、ID，或 App 分享的整段文字"
          className="min-w-0 flex-1 border-none bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy}
          className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-violet-600 transition hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-40 dark:text-violet-300 dark:hover:bg-violet-400/10"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
          {busy ? "加载中" : "打开歌单"}
        </button>
      </form>
      {error && <p className="mt-2 pl-2 text-xs text-rose-500">{error}</p>}

      {/* 主体：左 4 列播放器（吸顶、自适应高度） ｜ 右 8 列歌曲列表；items-start 防拉伸 */}
      <section className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        {/* 左：播放器 + 当前歌单信息（h-fit 不被右列拉长，sticky 跟随滚动） */}
        <div className="lg:sticky lg:top-24 lg:col-span-4 lg:h-fit lg:self-start">
          <div className="glass flex h-fit flex-col rounded-3xl px-6 pb-5 pt-6">
            <MusicPlayer />
            {/* 底部当前歌单条：拉长卡片，与右侧列表卡对齐 */}
            <div className="mt-4 flex items-center gap-3 border-t border-black/5 pt-4 dark:border-white/10">
              <PlaylistCover cover={activeMeta?.cover} active={false} small />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  {activeMeta ? activeMeta.name : "歌单加载中…"}
                </div>
                <div className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                  {songs.length ? `${songs.length} 首歌曲` : "正在获取歌单"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右：我的歌单（大毛玻璃卡，标题固定，内部细滚动条） */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/20 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-white/5 lg:col-span-8 lg:max-h-[calc(100vh-170px)]">
          {/* 固定标题栏：显示当前歌单名 */}
          <div className="flex shrink-0 items-baseline justify-between gap-3 border-b border-black/5 px-5 pb-3 pt-4 dark:border-white/10">
            <h2 className="truncate text-base font-semibold text-zinc-800 dark:text-zinc-100">
              {activeMeta ? activeMeta.name : "歌单"}
            </h2>
            <span className="shrink-0 text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
              {songs.length} 首
            </span>
          </div>

          {/* 歌曲滚动区 */}
          {songs.length === 0 ? (
            <div className="flex h-56 items-center justify-center text-sm text-zinc-400">
              {loadingPlaylist ? "歌曲加载中…" : "歌单里还没有歌曲"}
            </div>
          ) : (
            <ul className="music-scroll min-h-0 flex-1 overflow-y-auto px-2 py-2">
              {songs.map((s, i) => {
                const active = i === songIndex;
                return (
                  <li key={`${s.title}-${i}`} className="relative">
                    {/* 当前播放：左侧紫色竖向指示线 */}
                    {active && (
                      <span className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-full bg-violet-500" />
                    )}
                    <button
                      onClick={() => playAt(i)}
                      className={`flex w-full items-center gap-3 rounded-xl py-3 pl-4 pr-3 text-left transition-colors ${
                        active
                          ? "bg-purple-500/15"
                          : "hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                    >
                      {/* 序号 / 播放中律动 */}
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                        {active && playing ? (
                          <MiniEq />
                        ) : (
                          <span
                            className={`text-xs tabular-nums ${
                              active
                                ? "font-semibold text-violet-500"
                                : "text-zinc-400 dark:text-zinc-500"
                            }`}
                          >
                            {i + 1}
                          </span>
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`truncate text-sm ${
                            active
                              ? "font-medium text-violet-700 dark:text-violet-300"
                              : "text-zinc-800 dark:text-zinc-100"
                          }`}
                        >
                          {s.title}
                        </div>
                        <div className="mt-0.5 truncate text-xs text-zinc-400 dark:text-zinc-500">
                          {s.artist}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

// 横滑歌单卡片：点击切换；有 onRemove 时右上角显示悬停删除钮
function PlaylistCard({
  meta,
  active,
  busy,
  onOpen,
  onRemove,
}: {
  meta: PlaylistMeta;
  active: boolean;
  busy: boolean;
  onOpen: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="group relative w-52 shrink-0">
      <button
        onClick={onOpen}
        disabled={busy}
        className={`flex w-full items-center gap-3 rounded-2xl border p-2 text-left backdrop-blur transition-all duration-300 disabled:opacity-60 ${
          active
            ? "border-violet-400/60 bg-violet-500/10 shadow-md"
            : "border-white/20 bg-white/10 hover:bg-white/20 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        }`}
      >
        <PlaylistCover cover={meta.cover} active={active} />
        <div className="min-w-0 flex-1">
          <div
            className={`truncate text-sm font-semibold ${
              active
                ? "text-violet-600 dark:text-violet-300"
                : "text-zinc-800 dark:text-zinc-100"
            }`}
          >
            {meta.name}
          </div>
          <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {meta.songCount ?? 0} 首
          </div>
        </div>
      </button>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`删除歌单 ${meta.name}`}
          title="移除这个歌单"
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800/80 text-white opacity-0 shadow-md backdrop-blur transition hover:bg-rose-500 focus:opacity-100 group-hover:opacity-100"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}

// 歌单封面：有图用图，无图用紫渐变音符占位
function PlaylistCover({
  cover,
  active,
  small,
}: {
  cover?: string;
  active: boolean;
  small?: boolean;
}) {
  const size = small ? "h-11 w-11 rounded-lg" : "h-14 w-14 rounded-xl";
  const icon = small ? 18 : 22;
  return (
    <div
      className={`relative ${size} shrink-0 overflow-hidden shadow-sm ring-2 transition ${
        active ? "ring-violet-400/70" : "ring-transparent"
      }`}
    >
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-400 to-purple-600">
          <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
      )}
    </div>
  );
}

// 当前播放曲目的迷你三柱律动
function MiniEq() {
  return (
    <span className="flex h-3.5 items-end gap-[2px]">
      {[0, 0.15, 0.3].map((d, i) => (
        <span
          key={i}
          className="w-[2.5px] origin-bottom rounded-full bg-violet-500"
          style={{
            height: i === 1 ? "14px" : "10px",
            animation: "equalizer-bar 1.2s ease-in-out infinite",
            animationDelay: `${d}s`,
          }}
        />
      ))}
    </span>
  );
}
