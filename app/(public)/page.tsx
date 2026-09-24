"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { Black_Ops_One } from "next/font/google";
import MusicPlayer from "@/components/MusicPlayer";
import { type Playlist } from "@/lib/music";

const industrialFont = Black_Ops_One({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const IDLE_MS = 60_000; // 60 秒无操作触发清屏

const techStack = ["Next.js", "React", "TypeScript", "Tailwind", "Prisma", "PostgreSQL"];

const entries = [
  { href: "/projects", label: "项目", desc: "我做过的东西", img: "/瞄准.jpg", cls: "col-span-1 md:col-span-2 md:row-span-2" },
  { href: "/posts", label: "文章", desc: "随笔与记录", img: "/枯荣.jpg", cls: "col-span-1 md:row-span-2" },
  { href: "/photos", label: "照片", desc: "生活碎片", img: "/开心.jpg", cls: "col-span-1 md:row-span-2" },
  { href: "/music", label: "音乐", desc: "歌单与心情", img: "/休息.jpg", cls: "col-span-1" },
  { href: "/talks", label: "说说", desc: "碎碎念", img: "/半遮面.jpg", cls: "col-span-1" },
  { href: "/about", label: "关于", desc: "关于我", img: "/回眸.jpg", cls: "col-span-1 md:col-span-2" },
];

// 页面左上（欢迎卡/音乐卡）。清屏时向左右两侧飞出并淡出
function scatterStyle(cleared: boolean, dir: "left" | "right", delay: number) {
  if (!cleared) return undefined;
  const x = dir === "left" ? "-60vw" : "60vw";
  return {
    transform: `translateX(${x}) translateY(6rem) rotate(${dir === "left" ? "-12deg" : "12deg"})`,
    opacity: 0,
    transitionDelay: `${delay}ms`,
  } as const;
}

// 入口卡片：配图背景 + 悬浮放大/遮罩/光斑/文字上移
function EntryCard({ s, i, cleared, cls }: {
  s: (typeof entries)[number];
  i: number;
  cleared: boolean;
  cls: string;
}) {
  return (
    <Link
      href={s.href}
      className={`group relative block overflow-hidden rounded-2xl bg-zinc-900 transition-all duration-700 ease-out hover:-translate-y-0.5 hover:shadow-xl ${cls}`}
      style={{
        ...scatterStyle(cleared, i % 2 === 0 ? "left" : "right", 160 + i * 60),
        animation: cleared ? undefined : `layout-enter 0.7s ease-out ${i * 60}ms backwards`,
      }}
    >
      <img src={s.img} alt={s.label} className="absolute inset-0 h-full w-full object-cover object-[50%_25%] transition-transform duration-700 ease-out group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-700 ease-out" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/2 top-0 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[400%]" />
      </div>
      <div className="relative flex h-full flex-col justify-end p-5 text-white">
        <div className="font-semibold drop-shadow-sm transition-transform duration-700 ease-out group-hover:-translate-y-1">{s.label}</div>
        <div className="mt-0.5 text-xs text-white/85 transition-transform duration-700 ease-out group-hover:-translate-y-1">{s.desc}</div>
      </div>
    </Link>
  );
}

// 中枢链路卡片：上下两段，上部图片 + 下部文字描述
function HubCard({ s, i, cleared, cls }: {
  s: (typeof entries)[number];
  i: number;
  cleared: boolean;
  cls: string;
}) {
  return (
    <Link
      href={s.href}
      className={`group relative flex flex-col overflow-hidden rounded-2xl bg-zinc-900/30 transition-all duration-700 ease-out hover:-translate-y-0.5 hover:shadow-xl ${cls}`}
      style={{
        ...scatterStyle(cleared, i % 2 === 0 ? "left" : "right", 160 + i * 60),
        animation: cleared ? undefined : `layout-enter 0.7s ease-out ${i * 60}ms backwards`,
      }}
    >
      {/* 上部：图片 */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <img src={s.img} alt={s.label} className="h-full w-full object-cover object-[50%_25%] transition-transform duration-700 ease-out group-hover:scale-110" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-1/2 top-0 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[400%]" />
        </div>
      </div>
      {/* 下部：文字描述（半透明毛玻璃，贴合背景） */}
      <div className="flex shrink-0 flex-col gap-0.5 bg-zinc-900/40 px-5 py-4 text-white backdrop-blur-md">
        <div className="font-semibold transition-transform duration-700 ease-out group-hover:-translate-y-0.5">{s.label}</div>
        <div className="text-xs text-white/70">{s.desc}</div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [cleared, setCleared] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearedRef = useRef(false);
  const [now, setNow] = useState<Date | null>(null);
  const [lyricTime, setLyricTime] = useState(0);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [songIndex, setSongIndex] = useState(0);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [layout, setLayout] = useState<"matrix" | "hub">("matrix");
  const lyrics = playlists[playlistIndex]?.songs[songIndex]?.lyrics ?? [];
  const activeLine = lyrics.reduce(
    (acc, l, i) => (lyricTime >= l.time ? i : acc),
    0,
  );
  const hh = now ? String(now.getHours()).padStart(2, "0") : "--";
  const mm = now ? String(now.getMinutes()).padStart(2, "0") : "--";
  const ss = now ? String(now.getSeconds()).padStart(2, "0") : "--";

  // 实时时钟
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // 从服务端拉取歌单（扫描 public/music，子文件夹 = 歌单）
  useEffect(() => {
    fetch("/api/music")
      .then((r) => r.json())
      .then((d) => setPlaylists(Array.isArray(d?.playlists) ? d.playlists : []))
      .catch(() => setPlaylists([]));
  }, []);

  // 检测用户活动：无操作则清屏，有操作则恢复并重置计时
  useEffect(() => {
    const ACTIVITY_EVENTS = ["pointermove", "pointerdown", "keydown", "scroll", "wheel", "touchstart"];

    const onActivity = () => {
      if (clearedRef.current) {
        clearedRef.current = false;
        setCleared(false);
        window.dispatchEvent(new CustomEvent("bg-restore"));
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        clearedRef.current = true;
        setCleared(true);
        window.dispatchEvent(new CustomEvent("bg-clear"));
      }, IDLE_MS);
    };

    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity));
    onActivity();

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // 双击卡片之外的空白区域，主动触发清屏
  const handleDoubleClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".glass")) return;
    clearedRef.current = true;
    setCleared(true);
    window.dispatchEvent(new CustomEvent("bg-clear"));
  };

  // 中枢链路锚点拖动：按住锚点上下拖动控制页面滑动
  const dragRef = useRef<{ startY: number; startScrollY: number; startProgress: number } | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  // 当前滚动相对中枢卡片段的进度（rail 顶端在视口顶部时=0，rail 底端在视口底部时=1）
  // rail 顶端在视口下方时为负数，rail 底端在视口上方时 >1
  const computeProgress = () => {
    const rail = railRef.current;
    if (!rail) return 0;
    const rect = rail.getBoundingClientRect();
    const vh = window.innerHeight;
    const range = rect.height - vh;
    if (range <= 0) return 0;
    return -rect.top / range;
  };

  // 夹取到 [0,1]：锚点只在 rail 顶端与底端之间滑动，不会跑出视口
  const clampProgress = (p: number) => Math.max(0, Math.min(1, p));

  // 锚点贴着中线按进度上下移动，直接改 DOM 避免 React 重渲染
  const applyAnchorProgress = (progress: number) => {
    if (!anchorRef.current) return;
    anchorRef.current.style.top = `${clampProgress(progress) * 100}%`;
  };

  // 监听滚动，把页面滚动进度映射为锚点沿中线的位置（0~1），rAF 节流
  // useEffect 内同步调用 init 设置锚点初始位置，避免 style.top 为空导致跳变；
  // 下一帧再用 rAF 二次初始化（rail 内图片等异步内容可能影响首帧测量）
  useEffect(() => {
    if (layout !== "hub") return;
    const init = () => {
      const rail = railRef.current;
      if (!rail) return;
      const rect = rail.getBoundingClientRect();
      const vh = window.innerHeight;
      const range = rect.height - vh;
      if (range <= 0) {
        applyAnchorProgress(0);
        return;
      }
      const progress = -rect.top / range;
      applyAnchorProgress(progress);
      // 若 rail 顶端还在视口下方（progress<0），自动平滑滚到 rail 顶端，
      // 让 progress=0、锚点贴在 rail 顶端，拖动即可立即 1:1 跟手
      if (progress < -0.02) {
        const hubTop = rect.top + window.scrollY;
        window.scrollTo({ top: hubTop, behavior: "smooth" });
      }
    };
    init();
    const raf = requestAnimationFrame(init);
    const onScroll = () => {
      if (draggingRef.current || rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        // 回调执行时可能已进入拖动状态，需再次检查避免覆盖 pointermove 设置的位置
        if (draggingRef.current) return;
        applyAnchorProgress(computeProgress());
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [layout]);

  const onAnchorPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    // 拖动期间禁用 transition，保证 1:1 跟手不延迟
    if (anchorRef.current) anchorRef.current.style.transition = "none";
    // 记录按下时的滚动位置与「夹取后的进度起点」，作为拖动 1:1 跟手的基准
    const startProgress = clampProgress(computeProgress());
    dragRef.current = { startY: e.clientY, startScrollY: window.scrollY, startProgress };
    // 立即把锚点设到 startProgress 对应位置，防止初始化未生效时锚点位置错误
    applyAnchorProgress(startProgress);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onAnchorPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const rail = railRef.current;
    if (!rail) return;
    const rect = rail.getBoundingClientRect();
    const vh = window.innerHeight;
    const range = rect.height - vh;
    // 指针位移 → 页面滚动位移：拖动 vh 像素正好滚过整段 rail
    const scale = vh > 0 ? Math.max(range, 0) / vh : 0;
    const target = d.startScrollY + (e.clientY - d.startY) * scale;
    // 用 instant 强制瞬移（CSS 已去掉全局 smooth，不会再被覆盖）
    window.scrollTo({ top: target, behavior: "instant" });
    // 锚点位置 = 起点进度 + 指针位移/视口高，严格 1:1 跟手，且夹取在 [0,1] 不跑出 rail
    const progress = d.startProgress + (e.clientY - d.startY) / vh;
    applyAnchorProgress(progress);
  };
  const onAnchorPointerEnd = () => {
    dragRef.current = null;
    draggingRef.current = false;
    // 松开后启用 transition，让锚点平滑过渡到当前 scrollY 对应位置
    // （若 smooth 自动滚动未完成，progress<0 会被夹回 0，此时锚点是平滑弹回而非瞬跳）
    if (anchorRef.current) anchorRef.current.style.transition = "top 0.3s ease";
    applyAnchorProgress(computeProgress());
  };

  return (
    <div
      className={`min-h-full w-full ${cleared ? "overflow-hidden" : ""}`}
      onDoubleClick={handleDoubleClick}
    >
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
      {/* 便当盒网格：4 列 + 固定行高，横竖错落 */}
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:auto-rows-[9rem]">
        {/* 欢迎卡：竖向大卡 2x2 */}
        <div
          className="glass col-span-2 flex flex-col justify-center rounded-2xl p-5 transition-all duration-700 ease-out md:row-span-2"
          style={scatterStyle(cleared, "left", 0)}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-stretch gap-5">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                <img src="/个人照片.jpg" alt="头像" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-2xl font-bold tracking-tight">Relief</div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">摆了...随便玩玩</p>
              </div>
            </div>
            <MusicPlayer
              playlists={playlists}
              onTimeChange={setLyricTime}
              onSongChange={(pi, si) => {
                setPlaylistIndex(pi);
                setSongIndex(si);
              }}
              onPlayingChange={setMusicPlaying}
            />
          </div>
        </div>

        {/* 歌词卡：竖卡 */}
        <div
          className="glass col-span-2 flex flex-col justify-center rounded-2xl p-5 transition-all duration-700 ease-out md:row-span-2"
          style={scatterStyle(cleared, "right", 80)}
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl">
              <img src="/听歌.jpg" alt="歌词配图" className="h-full w-full object-cover" />
            </div>
            <span className="text-sm font-semibold text-zinc-500">🎶 歌词</span>
            {/* 律动柱状图：5 根竖条柔和呼吸，随播放状态启停 */}
            <div className="ml-auto flex h-8 items-end gap-0.5">
              {[0, 0.15, 0.3, 0.1, 0.2].map((d, i) => (
                <span
                  key={i}
                  className="w-[3px] h-8 origin-bottom rounded-full bg-[#5d7a8a] transition-opacity duration-500"
                  style={{
                    animation: "equalizer-bar 1.6s ease-in-out infinite",
                    animationDelay: `${d}s`,
                    animationPlayState: musicPlaying ? "running" : "paused",
                    opacity: musicPlaying ? 1 : 0.4,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="relative h-40 overflow-hidden">
            {lyrics.length === 0 ? (
              <p className="text-sm text-zinc-400 dark:text-zinc-500">暂无歌词</p>
            ) : (
              <div
                className="transition-transform duration-300 ease-out"
                style={{ transform: `translateY(${68 - activeLine * 24}px)` }}
              >
                {lyrics.map((l, i) => (
                  <p
                    key={`${l.time}-${i}`}
                    className={`h-6 truncate leading-6 transition-colors ${
                      i === activeLine
                        ? "font-semibold text-zinc-900 dark:text-white"
                        : "text-zinc-400 dark:text-zinc-500"
                    }`}
                  >
                    {l.text}
                    {l.trans ? (
                      <span className="ml-2 text-xs text-zinc-400 dark:text-zinc-500">
                        {l.trans}
                      </span>
                    ) : null}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 时间 + 技术栈卡：横卡，占满整行，含布局切换按钮 */}
        <div
          className="glass col-span-2 flex flex-row items-center justify-between gap-4 rounded-2xl p-5 transition-all duration-700 ease-out md:col-span-4"
          style={scatterStyle(cleared, "right", 120)}
        >
          <div className="flex min-w-0 flex-col gap-3">
            <p className="industrial-zh text-sm">这里记录着我的摸鱼生活, 期待放假ing</p>
            <div className="inline-flex self-start items-center gap-0.5 rounded-md border border-[#5d7a8a]/30 bg-white/30 p-0.5 backdrop-blur-sm dark:bg-white/5">
              {(
                [
                  { key: "matrix", label: "矩阵网格" },
                  { key: "hub", label: "中枢链路" },
                ] as const
              ).map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setLayout(m.key)}
                  className={`rounded-sm px-3 py-1 text-sm font-medium tracking-wide transition-all duration-500 ${
                    layout === m.key
                      ? "bg-[#5d7a8a] text-white shadow-sm"
                      : "text-[#5d7a8a]/70 hover:text-[#5d7a8a] hover:bg-[#5d7a8a]/10"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <div className={`flex items-baseline leading-none ${industrialFont.className}`}>
              <span className="rust-text relative text-3xl tracking-wide">{hh}</span>
              <span className="rust-text relative text-xl opacity-70">:{mm}</span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">:{ss}</span>
            </div>
            <div className="flex flex-wrap justify-end gap-1.5">
              {techStack.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/40 px-2.5 py-0.5 text-xs text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 入口卡片（矩阵网格）：直接在 grid 内按错落 span 排布 */}
        {layout === "matrix" &&
          entries.map((s, i) => <EntryCard key={s.href} s={s} i={i} cleared={cleared} cls={s.cls} />)}
      </div>

      {/* 入口卡片（中枢链路）：独立于固定行高 grid，避免 grid 尾部空行导致 footer 悬空 */}
      {layout === "hub" && (
        <div ref={railRef} className="relative mt-6 flex flex-col gap-6 py-2">
          {/* 中线：贯穿卡片上下 */}
          <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-gradient-to-b from-transparent via-zinc-500/60 to-transparent dark:via-zinc-400/50" />
          {entries.map((s, i) => {
            const left = i % 2 === 0;
            const heights = ["h-[28rem]", "h-80", "h-96", "h-72", "h-96", "h-80"];
            return (
              <div
                key={s.href}
                className={`flex items-stretch ${left ? "justify-start pr-[calc(50%+3.5rem)]" : "justify-end pl-[calc(50%+3.5rem)]"}`}
              >
                <HubCard s={s} i={i} cleared={cleared} cls={`w-full ${heights[i]}`} />
              </div>
            );
          })}

          {/* 锚点：贴在中线上，仅在卡片区域内滑动，可拖动控制滚动 */}
          <div
            ref={anchorRef}
            className="absolute left-1/2 top-0 z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none select-none active:cursor-grabbing"
            onPointerDown={onAnchorPointerDown}
            onPointerMove={onAnchorPointerMove}
            onPointerUp={onAnchorPointerEnd}
            onPointerCancel={onAnchorPointerEnd}
          >
            <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-500 shadow-md ring-4 ring-white/40 transition-colors dark:bg-zinc-300 dark:ring-white/20" />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}