﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿"use client";

import { AnimatePresence, motion, useMotionValue, useTransform, useSpring, useAnimationFrame } from "framer-motion";
import {
  ArrowUpRight,
  ChevronDown,
  Rocket,
  Undo2,
} from "lucide-react";
import GuestbookWall from "./GuestbookWall";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SOCIAL_ICONS } from "@/components/Icons";
import SkillWheel from "@/components/home/SkillWheel";
import SearchBar from "@/components/home/SearchBar";
import TypewriterQuote from "@/components/home/TypewriterQuote";
import Avatar from "@/components/home/Avatar";

// 大屏模式专用背景：固定单张（不轮播）
const BG_IMAGE = "/yangwang.jpg";

// 以下文案均可替换：标签、金句、标题
// 标签/社交链接已改为后台可管理（数据库），以下仅作为接口无数据时的兜底默认值
const DEFAULT_TAGS = [
  "乐观开朗",
  "温柔体贴",
  "随和平切",
  "冷静沉着",
  "才思敏捷",
  "风趣幽默",
  "刚正不阿",
  "善解人意",
];

type SocialItem = { href: string; label: string; icon: string };

const DEFAULT_SOCIALS: SocialItem[] = [
  { href: "https://github.com/heimuchuan", label: "GitHub", icon: "github" },
  { href: "mailto:hi@moyublog.com", label: "邮箱", icon: "mail" },
];

// 3-2-3 金字塔切分：按 3:2:3 比例分三行，数量不定时自适应
function splitTagRows(tags: string[]): { rows: string[][]; bases: number[] } {
  const n = tags.length;
  if (!n) return { rows: [], bases: [] };
  const first = Math.round((n * 3) / 8);
  const mid = Math.round((n * 2) / 8);
  const rows = [tags.slice(0, first), tags.slice(first, first + mid), tags.slice(first + mid)].filter(
    (r) => r.length > 0
  );
  const bases: number[] = [];
  let acc = 0;
  for (const row of rows) {
    bases.push(acc);
    acc += row.length;
  }
  return { rows, bases };
}

const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

// 确定性伪随机：同一 index 每次渲染结果一致（刷新不跳变），range 为 ±幅值
function pseudo(i: number, seed: number, range: number): number {
  const v = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return (v - Math.floor(v) - 0.5) * 2 * range;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function ShowcaseMode({ show, onExit }: { show: boolean; onExit: () => void }) {
  return (
    <AnimatePresence>
      {show && <ShowcaseLayer key="showcase" onExit={onExit} />}
    </AnimatePresence>
  );
}

function ShowcaseLayer({ onExit }: { onExit: () => void }) {
  const [now, setNow] = useState<Date | null>(null);
  const [quotes, setQuotes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>(DEFAULT_TAGS);
  const [socials, setSocials] = useState<SocialItem[]>(DEFAULT_SOCIALS);
  const [projects, setProjects] = useState<{
    slug: string;
    title: string;
    desc: string;
    cover: string | null;
    url: string;
  }[]>([]);
  // 展开描述面板的项目 slug（右下角箭头切换，同时只展开一个）
  const [openDesc, setOpenDesc] = useState<string | null>(null);

  // 时间卡 3D 鼠标跟随倾斜：鼠标偏移映射到 rotateX/rotateY
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);
  const cardRotateY = useTransform(cardX, [-0.5, 0.5], [15, -15]);
  const cardRotateX = useTransform(cardY, [-0.5, 0.5], [-15, 15]);
  const handleCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    cardX.set((e.clientX - rect.left) / rect.width - 0.5);
    cardY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleCardLeave = () => {
    cardX.set(0);
    cardY.set(0);
  };

  // 雷达圆环旋转速度：悬停时弹簧平滑加速，离开时回弹
  const spinSpeed = useSpring(1, { stiffness: 60, damping: 20 });
  const angle1 = useMotionValue(0);
  const angle2 = useMotionValue(0);
  const angle3 = useMotionValue(0);
  useAnimationFrame((_t, delta) => {
    const s = spinSpeed.get();
    angle1.set(angle1.get() + delta * 0.04 * s);
    angle2.set(angle2.get() - delta * 0.025 * s);
    angle3.set(angle3.get() + delta * 0.02 * s);
  });
  const handleRadarHoverStart = () => spinSpeed.set(2.8);
  const handleRadarHoverEnd = () => spinSpeed.set(1);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // 项目数据：从后台接口拉取（仅启用项），封面走统一地址转换
  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((list) => {
        if (!Array.isArray(list)) return;
        setProjects(
          list
            .filter((p: any) => p.active)
            .map((p: any) => ({
              slug: p.slug,
              title: p.title,
              desc: p.description,
              cover: p.cover
                ? p.cover.startsWith("http") || p.cover.startsWith("/")
                  ? p.cover
                  : `/uploads/projects/${p.cover}`
                : null,
              url: p.url,
            }))
        );
      })
      .catch(() => {});
  }, []);

  // 拉取启用的金句（多条循环打字）
  useEffect(() => {
    fetch("/api/quotes", { next: { tags: ["quotes"], revalidate: 0 } } as RequestInit)
      .then((r) => r.json())
      .then((arr) => {
        if (Array.isArray(arr)) {
          const texts = arr
            .filter((q: { active?: boolean; content?: string }) => q.active !== false && q.content)
            .map((q: { content: string }) => q.content);
          if (texts.length) setQuotes(texts);
        }
      })
      .catch(() => {});

    // 拉取大屏标签（active 过滤 + 按 order 排序；接口无数据时保留默认值）
    fetch("/api/showcase-tags")
      .then((r) => r.json())
      .then((arr) => {
        if (Array.isArray(arr)) {
          const names = arr
            .filter((t: { active?: boolean; name?: string }) => t.active !== false && t.name)
            .sort(
              (a: { order: number; id: number }, b: { order: number; id: number }) =>
                a.order - b.order || a.id - b.id
            )
            .map((t: { name: string }) => t.name);
          if (names.length) setTags(names);
        }
      })
      .catch(() => {});

    // 拉取社交链接（active 过滤 + 按 order 排序；接口无数据时保留默认值）
    fetch("/api/social-links")
      .then((r) => r.json())
      .then((arr) => {
        if (Array.isArray(arr)) {
          const list = arr
            .filter(
              (l: { active?: boolean; href?: string; label?: string }) =>
                l.active !== false && l.href && l.label
            )
            .sort(
              (a: { order: number; id: number }, b: { order: number; id: number }) =>
                a.order - b.order || a.id - b.id
            )
            .map((l: { href: string; label: string; icon: string }) => ({
              href: l.href,
              label: l.label,
              icon: l.icon,
            }));
          if (list.length) setSocials(list);
        }
      })
      .catch(() => {});
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const timeText = now ? `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}` : "--:--:--";
  const dateText = now
    ? `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日 星期${weekDays[now.getDay()]}`
    : "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03, pointerEvents: "none" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden bg-[#0d1117]"
    >
      {/* ── 固定高清背景 + 轻度锐化（原图仅 1024px，放大后用卷积锐化补偿） ── */}
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <filter id="showcase-sharpen">
          <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="0 -0.45 0  -0.45 2.8 -0.45  0 -0.45 0" />
        </filter>
      </svg>
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${BG_IMAGE}')`,
          filter: "url(#showcase-sharpen) contrast(1.05) saturate(1.06)",
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/55" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(8,10,18,0.5)_100%)]" />

      {/* ── 内容层：桌面端严格一屏，移动端可滚动 ── */}
      <div className="relative flex min-h-[100dvh] flex-col px-5 pb-5 pt-8 sm:px-8 sm:pt-10 lg:px-10">
        {/* ══ 顶部行：左 Hero 列（标题+搜索框，左对齐） ｜ 时间卡绝对定位不撑高行 ══
            sm~xl 区间预留底部 padding：时间卡 absolute 高度约 480px，会溢出到下方金句区；
            xl 以上金句区有 min-height 兜底自然错开，无需预留 */}
        <div className="relative flex items-start justify-between gap-4 sm:max-xl:pb-60 xl:pl-96">
          {/* 左：Hero 列竖排，同一左对齐轴线；移动端顶部补小头像 */}
          <div className="flex min-w-0 flex-1 flex-col items-start gap-4 pt-1">
            <div className="inline-block rounded-full bg-gradient-to-br from-indigo-400 via-violet-400 to-purple-500 p-[3px] shadow-xl xl:hidden">
              <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-white/80 sm:h-20 sm:w-20">
                <Avatar className="h-full w-full object-cover" />
              </div>
            </div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              initial="hidden"
              animate="show"
              className="text-left text-3xl font-black italic tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.55)] sm:text-5xl lg:text-6xl"
            >
              HI, I&apos;M RELIEF
            </motion.h1>
            {/* 复合搜索框：与标题同左缘，宽约半屏 */}
            <motion.div
              variants={fadeUp}
              custom={2}
              initial="hidden"
              animate="show"
              className="hidden w-full max-w-[52vw] sm:block"
            >
              <SearchBar />
            </motion.div>
          </div>

          {/* 右上：时间雷达大卡 */}
          <motion.div
            variants={fadeUp}
            custom={3}
            initial="hidden"
            animate="show"
            className="glass-dark mt-14 flex w-[148px] flex-col items-center rounded-2xl px-3 py-3 sm:absolute sm:right-0 sm:top-[4.25rem] sm:mt-0 sm:w-96 sm:px-10 sm:py-9 lg:top-20"
          >
            <div className="text-4xl font-bold tabular-nums tracking-tight text-white [font-feature-settings:'tnum'] [text-shadow:_0_4px_12px_rgba(0,0,0,0.8)] [font-family:var(--font-rajdhani)] sm:text-6xl">
              {timeText}
            </div>
            <div className="mt-1 hidden text-xs font-light tracking-widest text-white/40 sm:block">{dateText}</div>
            <motion.div
              className="group relative mt-3 h-24 w-24 cursor-pointer sm:mt-5 sm:h-56 sm:w-56"
              onMouseMove={handleCardMove}
              onMouseLeave={handleCardLeave}
              onHoverStart={handleRadarHoverStart}
              onHoverEnd={handleRadarHoverEnd}
              style={{ rotateX: cardRotateX, rotateY: cardRotateY, transformPerspective: 1000 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              whileHover={{ scale: 1.12 }}
            >
              {/* 悬停发光光晕 */}
              <div className="absolute inset-0 rounded-full bg-cyan-400/30 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              <motion.svg viewBox="0 0 160 160" style={{ rotate: angle1 }} className="absolute inset-0 h-full w-full">
                <circle cx="80" cy="80" r="72" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="120 60 40 90" opacity="0.4" className="transition-opacity duration-500 group-hover:opacity-90" />
                <circle cx="150" cy="80" r="3" fill="#22d3ee" opacity="0.6" className="transition-opacity duration-500 group-hover:opacity-100" />
              </motion.svg>
              <motion.svg viewBox="0 0 160 160" style={{ rotate: angle2 }} className="absolute inset-0 h-full w-full">
                <circle cx="80" cy="80" r="54" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="70 50 100 40" opacity="0.35" className="transition-opacity duration-500 group-hover:opacity-85" />
                <circle cx="80" cy="26" r="2.5" fill="#a78bfa" opacity="0.5" className="transition-opacity duration-500 group-hover:opacity-100" />
              </motion.svg>
              <motion.svg viewBox="0 0 160 160" style={{ rotate: angle3 }} className="absolute inset-0 h-full w-full">
                <circle cx="80" cy="80" r="36" fill="none" stroke="#67e8f9" strokeWidth="1.5" strokeDasharray="40 30 60 30" opacity="0.3" className="transition-opacity duration-500 group-hover:opacity-80" />
              </motion.svg>
              {/* 中心点：悬停放大 + 发光脉冲 */}
              <motion.div
                className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)] sm:h-4 sm:w-4"
                animate={{ boxShadow: ["0 0 12px rgba(34,211,238,0.9)", "0 0 24px rgba(34,211,238,1)", "0 0 12px rgba(34,211,238,0.9)"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.8 }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* ══ 中下区：左栏绝对定位不占流；右侧金句+项目卡，xl 下左移避开左栏 ══
            去掉 min-h-0：让中下区可以按内容撑高，从而在卡片增多时交给整页向下滚动，而不是被压缩成一屏 */}
        <div className="flex flex-1 pt-4 xl:pl-96">
          {/* ── 左栏（仅桌面）：fixed 钉在视口，页面滚动时位置不变 ── */}
          <div className="fixed bottom-5 left-5 top-6 z-10 hidden w-72 flex-col justify-evenly sm:left-8 lg:left-10 xl:flex">
            {/* 大头像：水平居中 */}
            <motion.div
              variants={fadeUp}
              custom={0}
              initial="hidden"
              animate="show"
              className="flex justify-center"
            >
              <div className="rounded-full bg-gradient-to-br from-indigo-400 via-violet-400 to-purple-500 p-[3px] shadow-xl">
                <div className="h-32 w-32 overflow-hidden rounded-full border-2 border-white/80 2xl:h-36 2xl:w-36">
                  <Avatar className="h-full w-full object-cover" />
                </div>
              </div>
            </motion.div>

            {/* Tags 玻璃卡 */}
            <motion.div
              variants={fadeUp}
              custom={4}
              initial="hidden"
              animate="show"
            >
              <div className="glass-dark w-full rounded-2xl p-6">
                <div className="mb-4 text-center text-2xl font-semibold tracking-widest text-white/90">Tags</div>
                {/* 3-2-3 金字塔排列：按 3:2:3 比例自适应切行；i 为全局索引，保持错落连续 */}
                <div className="flex flex-col items-center gap-3">
                  {(() => {
                    const { rows, bases } = splitTagRows(tags);
                    return rows.map((row, r) => {
                      const base = bases[r];
                      return (
                        <div key={r} className="flex items-center justify-center gap-2">
                          {row.map((t, k) => {
                            const i = base + k;
                          return (
                            <motion.span
                              key={t}
                              initial={false}
                              animate={{
                                y: i % 2 === 0 ? 4 : -4, // 偶数下沉 / 奇数上浮，锯齿错落
                                rotate: pseudo(i, 13, 1), // ±1° 微旋转
                                scale: 1,
                              }}
                              whileHover={{ y: 0, rotate: 0, scale: 1.06 }}
                              transition={{ type: "spring", stiffness: 300, damping: 18 }}
                              style={{ marginLeft: pseudo(i, 21, 3), marginRight: pseudo(i, 29, 3) }}
                              className="cursor-default rounded-full bg-white/10 px-4 py-2 text-base font-medium text-white/85 transition-colors hover:bg-cyan-400/30"
                            >
                              {t}
                            </motion.span>
                          );
                          })}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </motion.div>

            {/* 技能轮盘：半透明渐变扇形 + 白缝，悬停单片外扩并显示技能名 */}
            <motion.div
              variants={fadeUp}
              custom={5}
              initial="hidden"
              animate="show"
              className="flex justify-center"
            >
              <SkillWheel className="w-48 2xl:w-56" />
            </motion.div>

            {/* 社交链接行（后台可管理，active 数据从接口拉取） */}
            <motion.div
              variants={fadeUp}
              custom={6}
              initial="hidden"
              animate="show"
              className="flex items-center justify-center gap-2"
            >
              {socials.map((s) => {
                const Icon = SOCIAL_ICONS[s.icon] ?? SOCIAL_ICONS.link;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="glass-dark flex h-10 w-10 items-center justify-center rounded-full text-white/85 transition hover:bg-white/20 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </motion.div>

            {/* 返回阅读模式：折返图标，最底单独成行 */}
            <motion.div
              variants={fadeUp}
              custom={7}
              initial="hidden"
              animate="show"
              className="flex justify-center"
            >
              <button
                onClick={onExit}
                aria-label="返回阅读模式"
                title="返回阅读模式"
                className="glass-dark flex h-10 w-10 items-center justify-center rounded-full text-white/85 transition hover:bg-white/20 hover:text-white"
              >
                <Undo2 className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </button>
            </motion.div>
          </div>

          {/* ── 右栏：中央金句 + 底部项目卡 ── */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* 金句：与搜索框同宽，内部居中排版；光标初始位于容器中点，文字向两侧均匀扩展。
                弹性撑满多余高度，让它与下方项目区维持当前的视觉间距；xl/2xl 再加一个 min-height 兜底：
                当项目卡片增多、内容超过一屏时，金句区不被压缩，多余内容向下滚动（项目区只向下生长）。
                兜底高度 = 一屏高 - 金句区以外的固定高度，其中卡片只按【一排】计——
                多排时总高超过一屏，靠整页滚动而不是挤压金句区间距。 */}
            <div className="flex flex-1 items-center py-4 xl:min-h-[calc(100dvh_-_31rem)] 2xl:min-h-[calc(100dvh_-_33rem)]">
              <motion.div
                variants={fadeUp}
                custom={3}
                initial="hidden"
                animate="show"
                className="flex min-h-[3.5rem] w-full max-w-[52vw] items-center justify-center text-center"
              >
                <TypewriterQuote
                  texts={quotes}
                  className="text-center text-xl font-black leading-relaxed tracking-wide text-white [text-shadow:_2px_0_0_rgba(0,0,0,0.38),-2px_0_0_rgba(0,0,0,0.38),0_2px_0_rgba(0,0,0,0.38),0_-2px_0_rgba(0,0,0,0.38),2px_2px_0_rgba(0,0,0,0.38),-2px_2px_0_rgba(0,0,0,0.38),2px_-2px_0_rgba(0,0,0,0.38),-2px_-2px_0_rgba(0,0,0,0.38),0_4px_12px_rgba(0,0,0,0.8)] sm:text-2xl lg:text-3xl"
                />
              </motion.div>
            </div>

            {/* 移动端：社交+退出横排（项目区上方） */}
            <div className="mb-3 flex items-center justify-between xl:hidden">
              <div className="flex items-center gap-2">
                {socials.map((s) => {
                  const Icon = SOCIAL_ICONS[s.icon] ?? SOCIAL_ICONS.link;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.label}
                      className="glass-dark flex h-9 w-9 items-center justify-center rounded-full text-white/85"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
              <button
                onClick={onExit}
                className="glass-dark flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-white/85"
              >
                <Undo2 className="h-4 w-4" strokeWidth={1.8} />
                返回博客
              </button>
            </div>

            {/* 项目区标题 */}
            <div className="mb-4 flex items-center justify-between px-1 text-xl font-medium tracking-widest text-white/70">
              <span className="flex items-center gap-2.5">
                <Rocket className="h-5 w-5" strokeWidth={1.8} />
                部署项目
              </span>
              <Link
                href="/projects"
                className="hidden items-center gap-1 text-[11px] text-white/55 transition hover:text-white xl:flex"
              >
                全部项目 <ArrowUpRight className="h-3 w-3" strokeWidth={1.8} />
              </Link>
            </div>

            {/* 项目卡：桌面 4 列两排，移动两列。
                大圆角磨砂玻璃整体卡：封面居上完整露出；下方磨砂信息条只含标题+
                极简「前往」（唯一跳转入口）+ 细线圆箭头；箭头向下展开完整描述，不遮挡封面 */}
            <div className="grid grid-cols-2 items-start gap-3 sm:gap-4 xl:grid-cols-4">
              {projects.map((p, i) => {
                const open = openDesc === p.slug;
                return (
                  <motion.div key={p.slug} variants={fadeUp} custom={8 + i * 0.5} initial="hidden" animate="show">
                    <div className="overflow-hidden rounded-xl shadow-lg ring-1 ring-white/10">
                      {/* 封面：约 16:11，始终完整露出 */}
                      <div className="relative h-36 sm:h-40 xl:h-44 2xl:h-52">
                        {p.cover ? (
                          <img
                            src={p.cover}
                            alt={p.title}
                            className="absolute inset-0 h-full w-full object-cover object-[50%_25%]"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-[#5d7a8a]/70 to-[#1a1e29]" />
                        )}
                      </div>

                      {/* 磨砂信息条：标题 + 前往/箭头 */}
                      <div className="bg-white/10 px-3.5 pb-3.5 pt-3 backdrop-blur-2xl">
                        <div className="truncate text-base font-semibold text-white">{p.title}</div>
                        <div className="mt-2.5 flex items-center justify-between">
                          {/* 前往（卡片唯一跳转入口）：极简图标+文字 */}
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="-ml-3 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white/85 transition hover:bg-white/[0.12] hover:text-cyan-300 hover:shadow-[0_2px_10px_rgba(0,0,0,0.28)]"
                          >
                            <Rocket className="h-3.5 w-3.5 text-cyan-300" strokeWidth={2} />
                            前往
                          </a>
                          {/* 描述开关：细线小圆箭头 */}
                          <button
                            type="button"
                            onClick={() => setOpenDesc(open ? null : p.slug)}
                            aria-label={open ? "收起描述" : "查看描述"}
                            title={open ? "收起描述" : "查看描述"}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-white/25 text-white/80 transition hover:border-white/50 hover:text-white"
                          >
                            <ChevronDown
                              className={`h-3 w-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                              strokeWidth={2}
                            />
                          </button>
                        </div>

                        {/* 下拉描述：同一块磨砂玻璃内向下展开，不遮挡封面 */}
                        <div
                          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                          }`}
                        >
                          <div className="min-h-0 overflow-hidden">
                            <p className="pt-2.5 text-sm leading-relaxed text-white/85">{p.desc}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* ── 留言墙：匿名或 GitHub 登录发表，先发后审 ── */}
            <GuestbookWall />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
