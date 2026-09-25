"use client";

import { type CSSProperties } from "react";
import Link from "next/link";
import { useTilt } from "./useTilt";

export type MiniEntry = { href: string; label: string; img: string };

/**
 * 3D 入口小卡（文章/音乐/项目）：
 * - 图片铺满整卡，文字直接压在图上（底部渐变保证可读）
 * - 鼠标移动时卡片跟随光标做 rotateX/rotateY 倾斜，离开平滑回正
 * - 径向光斑跟随鼠标 + hover 时一道对角高光扫过
 */
export default function MiniEntryCard({ entry, style }: { entry: MiniEntry; style?: CSSProperties }) {
  const { ref, glowRef, onMouseMove, onMouseLeave } = useTilt<HTMLAnchorElement>({
    maxTilt: 8,
    scale: 1.03,
    glowColor: "rgba(255,255,255,0.35)",
  });

  return (
    <div style={style}>
      <Link
        ref={ref}
        href={entry.href}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="group relative block h-36 overflow-hidden rounded-3xl border border-white/50 shadow-[0_2px_18px_rgba(90,90,70,0.10)] transition-transform duration-200 ease-out will-change-transform sm:h-44 dark:border-white/10"
      >
        {/* 满铺图片 */}
        <img
          src={entry.img}
          alt={entry.label}
          className="absolute inset-0 h-full w-full object-cover object-[50%_25%] transition-transform duration-500 group-hover:scale-110"
        />

        {/* 底部渐变压暗：保证文字可读 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

        {/* 对角线扫光：hover 时从左扫到右 */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-1/2 top-0 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:translate-x-[420%] group-hover:opacity-100" />
        </div>

        {/* 鼠标跟随光斑 */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
        />

        {/* 文字：直接压在图片底部 */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
          <span className="text-sm font-semibold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
            {entry.label}
          </span>
        </div>
      </Link>
    </div>
  );
}
