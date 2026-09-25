"use client";

import { useEffect, useState } from "react";
import { Black_Ops_One } from "next/font/google";
import MusicPlayer from "@/components/MusicPlayer";
import PhotosCard, { type HomePhoto } from "@/components/home/PhotosCard";
import TalksCard, { type HomeTalk } from "@/components/home/TalksCard";
import ArticleFeaturedCard, { type HomePost } from "@/components/home/ArticleFeaturedCard";
import MiniEntryCard, { type MiniEntry } from "@/components/home/MiniEntryCard";
import SiteInfoCard from "@/components/home/SiteInfoCard";
import Reveal from "@/components/home/Reveal";
import { MusicIcon } from "@/components/Icons";
import { type Playlist } from "@/lib/music";

const industrialFont = Black_Ops_One({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const techStack = ["Next.js", "React", "TypeScript", "Tailwind", "Prisma", "PostgreSQL"];

// 右侧中间：3 个小缩略图入口
const miniEntries: MiniEntry[] = [
  { href: "/posts", label: "文章", img: "/wither-bloom.jpg" },
  { href: "/music", label: "音乐", img: "/rest.jpg" },
  { href: "/projects", label: "项目", img: "/aiming.jpg" },
];

export default function HomePage() {
  const [now, setNow] = useState<Date | null>(null);
  const [lyricTime, setLyricTime] = useState(0);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [songIndex, setSongIndex] = useState(0);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [photos, setPhotos] = useState<HomePhoto[]>([]);
  const [talks, setTalks] = useState<HomeTalk[]>([]);
  const [latestPost, setLatestPost] = useState<HomePost | null>(null);
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

  // 首页聚合内容：最近照片 + 公开说说 + 最新文章
  useEffect(() => {
    fetch("/api/home")
      .then((r) => r.json())
      .then((d) => {
        setPhotos(Array.isArray(d?.photos) ? d.photos : []);
        setTalks(Array.isArray(d?.talks) ? d.talks : []);
        setLatestPost(d?.latestPost ?? null);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-full w-full">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        {/* ── 上半区：欢迎介绍 60% + 歌词 40% ── */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[3fr_2fr]">
          <Reveal className="h-full">
            <div className="glass flex h-full flex-col justify-center rounded-3xl p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-stretch gap-5">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                    <img src="/avatar.jpg" alt="头像" className="h-full w-full object-cover" />
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
          </Reveal>

          <Reveal delay={80} className="h-full">
            <div className="glass flex h-full flex-col justify-center rounded-3xl p-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl">
                  <img src="/listening.jpg" alt="歌词配图" className="h-full w-full object-cover" />
                </div>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-zinc-500">
                  <MusicIcon className="h-4 w-4 text-[#5d7a8a]" />
                  歌词
                </span>
                {/* 律动柱状图：5 根竖条柔和呼吸，随播放状态启停 */}
                <div className="ml-auto flex h-8 items-end gap-0.5">
                  {[0, 0.15, 0.3, 0.1, 0.2].map((d, i) => (
                    <span
                      key={i}
                      className="h-8 w-[3px] origin-bottom rounded-full bg-[#5d7a8a] transition-opacity duration-500"
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
          </Reveal>
        </div>

        {/* ── 时间 + 技术栈卡（整行） ── */}
        <Reveal delay={120} className="mt-5">
          <div className="glass flex flex-row items-center justify-between gap-4 rounded-3xl p-5">
            <p className="industrial-zh min-w-0 text-sm">这里记录着我的摸鱼生活, 期待放假ing</p>
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
        </Reveal>

        {/* ── 入口卡片区：左 40% 照片纵向轮播大卡 ｜ 右 60% 文章/三缩略图/动态+随笔 ── */}
        <section className="mt-5 flex flex-col gap-5 lg:flex-row">
          {/* 左：照片大卡 */}
          <Reveal className="lg:w-[40%] lg:shrink-0">
            <PhotosCard photos={photos} />
          </Reveal>

          {/* 右：三段 */}
          <div className="flex flex-col gap-5 lg:w-[60%]">
            {/* 顶部：横向文章卡 */}
            <Reveal delay={60}>
              <ArticleFeaturedCard post={latestPost} />
            </Reveal>

            {/* 中间：3 个小缩略图卡 */}
            <div className="grid grid-cols-3 gap-3 sm:gap-5">
              {miniEntries.map((e, i) => (
                <Reveal key={e.href} delay={100 + i * 70}>
                  <MiniEntryCard entry={e} />
                </Reveal>
              ))}
            </div>

            {/* 底部：动态（说说卡，占满右侧） */}
            <Reveal delay={120}>
              <TalksCard talks={talks} cls="" />
            </Reveal>
          </div>
        </section>

        {/* 备案/站点信息：单独成行的长条卡 */}
        <Reveal delay={80} className="mt-5">
          <SiteInfoCard />
        </Reveal>
      </div>
    </div>
  );
}
