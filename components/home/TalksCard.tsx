"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { ShuffleIcon, ChevronRightIcon } from "@/components/Icons";
import { useTilt } from "./useTilt";

export type HomeTalk = { id: number; content: string; createdAt: string };

// 配色（低饱和 + 高明度 + 立体感）：
// 浅黄绿衬底 hsl(85,25%,92%) + 93% 白卡面（实色感、不飘），顶部 1px 内高光 + 柔和长投影；
// 文字 #333；点缀浅粉
const CARD_CLASS =
  "group relative flex h-full min-h-[12rem] flex-col overflow-hidden rounded-3xl p-5 backdrop-blur-md " +
  "text-[#333] border border-white/70 " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_20px_rgba(70,80,50,0.10),0_2px_6px_rgba(70,80,50,0.06)] " +
  "transition-[transform,box-shadow] duration-200 ease-out will-change-transform " +
  "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_14px_34px_rgba(70,80,50,0.16),0_4px_10px_rgba(70,80,50,0.08)] md:min-h-0 " +
  // 复合背景：上层 93% 白（只微微透出黄绿），下层浅黄绿
  "bg-[linear-gradient(rgba(255,255,255,0.93),rgba(255,255,255,0.93)),hsl(85_28%_90%)] " +
  // 暗色模式：深灰绿衬底 + 92% 深色卡面，顶部微光
  "dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_6px_20px_rgba(0,0,0,0.35)] " +
  "dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_34px_rgba(0,0,0,0.45)] " +
  "dark:bg-[linear-gradient(rgba(32,34,30,0.92),rgba(32,34,30,0.92)),hsl(85_18%_20%)] dark:text-zinc-200";

function formatTime(iso: string) {
  const d = new Date(iso);
  const week = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
  return `${d.getMonth() + 1}月${d.getDate()}日 星期${week} ${String(d.getHours()).padStart(
    2,
    "0"
  )}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * 首页说说卡：浅黄绿衬底 + 75% 透明白卡面，默认展示最新一条公开说说；
 * 点洗牌按钮随机换一条；整卡点击进入该说说详情。
 */
export default function TalksCard({
  talks,
  cls,
  style,
}: {
  talks: HomeTalk[];
  cls: string;
  style?: CSSProperties;
}) {
  const [idx, setIdx] = useState(0);
  const cur = talks[idx];

  // 3D 倾斜（浅卡幅度更轻）
  const { ref, glowRef, onMouseMove, onMouseLeave } = useTilt<HTMLAnchorElement>({
    maxTilt: 5,
    scale: 1.01,
    glowColor: "rgba(255,255,255,0.55)",
    glowSize: 280,
  });

  // 扫光 + 跟随光斑（两个分支共用）
  const tiltLayers = (
    <>
      <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden rounded-3xl">
        <div className="absolute -left-1/2 top-0 h-full w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:translate-x-[460%] group-hover:opacity-100 dark:via-white/15" />
      </div>
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-[3] rounded-3xl opacity-0 transition-opacity duration-300"
      />
    </>
  );

  function shuffle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (talks.length < 2) return;
    let n = idx;
    while (n === idx) n = Math.floor(Math.random() * talks.length);
    setIdx(n);
  }

  // 空态：引导去说说页
  if (!cur) {
    return (
      <Link
        ref={ref}
        href="/talks"
        style={style}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className={`${CARD_CLASS} justify-between ${cls}`}
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#F3C4C4]" />
          <span className="text-sm font-semibold tracking-wide">说说</span>
        </div>
        <p className="text-sm text-[#333]/55 dark:text-zinc-400">还没有说说，碎碎念敬请期待</p>
        {tiltLayers}
      </Link>
    );
  }

  return (
    <Link
      ref={ref}
      href={`/talks/${cur.id}`}
      style={style}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`${CARD_CLASS} ${cls}`}
    >
      {/* 头部：标题（浅粉小圆点点缀）+ 洗牌 */}
      <div className="relative flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold tracking-wide">
          <span className="h-2 w-2 rounded-full bg-[#F3C4C4]" />
          说说
        </span>
        {talks.length > 1 && (
          <button
            type="button"
            onClick={shuffle}
            aria-label="随机换一条说说"
            title="随机换一条"
            className="flex items-center gap-1 rounded-full bg-[#F7DADA] px-2.5 py-1 text-xs text-[#A8666C] backdrop-blur-sm transition hover:bg-[#F3C7C7] dark:bg-[#F7DADA]/15 dark:text-[#E8B4B8] dark:hover:bg-[#F7DADA]/25"
          >
            <ShuffleIcon className="h-3.5 w-3.5" />
            换一条
          </button>
        )}
      </div>

      {/* 正文：超出省略 */}
      <p className="relative mt-3 line-clamp-5 flex-1 whitespace-pre-wrap break-words text-sm leading-6 sm:line-clamp-7">
        {cur.content}
      </p>

      {/* 底部：时间 + 查看详情（浅粉点缀） */}
      <div className="relative mt-3 flex items-center justify-between text-[11px] text-[#333]/50 dark:text-zinc-400">
        <span>{formatTime(cur.createdAt)}</span>
        <span className="flex items-center gap-0.5 text-[#C08A92] transition-transform group-hover:translate-x-0.5 dark:text-[#E0A8AE]">
          查看详情
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </span>
      </div>

      {tiltLayers}
    </Link>
  );
}
