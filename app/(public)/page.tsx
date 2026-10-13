"use client";

import { useEffect, useState } from "react";
import MusicPlayer from "@/components/MusicPlayer";
import LyricBar from "@/components/music/LyricBar";
import PhotosCard, { type HomePhoto } from "@/components/home/PhotosCard";
import TalksCard, { type HomeTalk } from "@/components/home/TalksCard";
import ArticleFeaturedCard, { type HomePost } from "@/components/home/ArticleFeaturedCard";
import MiniEntryCard, { type MiniEntry } from "@/components/home/MiniEntryCard";
import SiteInfoCard from "@/components/home/SiteInfoCard";
import Reveal from "@/components/home/Reveal";
import FloatingClock from "@/components/home/FloatingClock";
import TimeWidget from "@/components/home/TimeWidget";
import { GithubIcon, MailIcon } from "@/components/Icons";

// 社交链接（可自行增删）
const socialLinks = [
  { href: "https://github.com/heimuchuan", label: "GitHub", Icon: GithubIcon },
  { href: "mailto:hi@moyublog.com", label: "邮箱", Icon: MailIcon },
];

// 右侧中间：3 个小缩略图入口
const miniEntries: MiniEntry[] = [
  { href: "/posts", label: "文章", img: "/wither-bloom.jpg" },
  { href: "/music", label: "音乐", img: "/rest.jpg" },
  { href: "/projects", label: "项目", img: "/aiming.jpg" },
];

export default function HomePage() {
  const [photos, setPhotos] = useState<HomePhoto[]>([]);
  const [talks, setTalks] = useState<HomeTalk[]>([]);
  const [latestPost, setLatestPost] = useState<HomePost | null>(null);
  const [stats, setStats] = useState({ posts: 0, talks: 0, photos: 0 });

  // 首页聚合内容：最近照片 + 公开说说 + 最新文章（歌单由全局 MusicProvider 管理）
  useEffect(() => {
    fetch("/api/home")
      .then((r) => r.json())
      .then((d) => {
        setPhotos(Array.isArray(d?.photos) ? d.photos : []);
        setTalks(Array.isArray(d?.talks) ? d.talks : []);
        setLatestPost(d?.latestPost ?? null);
        if (d?.stats) setStats(d.stats);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-full w-full">
      {/* 右上角悬浮时钟（桌面端显示） */}
      <FloatingClock />
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        {/* ── 上半区：欢迎介绍 60% + 音乐播放器 40% ── */}
        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-[3fr_2fr]">
          <Reveal className="min-w-0">
            <div className="glass flex h-full flex-col rounded-3xl px-6 pb-5 pt-6">
              {/* 左上：大尺寸渐变圆环头像 + 名字简介，垂直居中 */}
              <div className="flex items-center gap-5">
                <div className="shrink-0 rounded-full bg-gradient-to-br from-indigo-400 via-violet-400 to-purple-500 p-[3px] shadow-md">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-white/70 dark:border-zinc-900/60 sm:h-28 sm:w-28">
                    <img
                      src="/avatar.jpg"
                      alt="头像"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                    Relief
                  </div>
                  <p className="mt-1 truncate text-sm text-zinc-500 dark:text-zinc-400">
                    摆了...随便玩玩
                  </p>
                </div>
              </div>

              {/* 底部：左统计 + 右社交，同一水平线底部对齐 */}
              <div className="mt-5 flex items-end justify-between gap-4">
                <div className="flex gap-5">
                  {[
                    { label: "文章", value: stats.posts, color: "text-indigo-500 dark:text-indigo-400" },
                    { label: "说说", value: stats.talks, color: "text-violet-500 dark:text-violet-400" },
                    { label: "照片", value: stats.photos, color: "text-pink-500 dark:text-pink-400" },
                  ].map((s) => (
                    <div key={s.label} className="flex flex-col items-center">
                      <span className={`text-lg font-bold tabular-nums leading-tight ${s.color}`}>
                        {s.value}
                      </span>
                      <span className="text-[11px] leading-tight text-zinc-400 dark:text-zinc-500">
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  {socialLinks.map(({ href, label, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      title={label}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/60 text-zinc-600 shadow-sm backdrop-blur transition hover:bg-white/90 hover:text-zinc-900 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/25 dark:hover:text-white"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>

              {/* 底部时间微件：mt-auto 固定卡片最底部，与右侧播放器卡等高 */}
              <div className="mt-auto pt-4">
                <TimeWidget />
              </div>
            </div>
          </Reveal>

          <Reveal delay={80} className="min-w-0">
            <div className="glass flex h-full flex-col rounded-3xl px-6 pb-5 pt-6">
              <MusicPlayer />
            </div>
          </Reveal>
        </div>

        {/* ── 歌词横条：状态来自全局 MusicContext，与播放器实时联动 ── */}
        <Reveal delay={120} className="mt-5">
          <LyricBar />
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
