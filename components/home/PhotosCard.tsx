"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { photoUrl } from "@/lib/photo-url";
import { useTilt } from "./useTilt";

export type HomePhoto = { id: number; fileName: string; title: string | null };

const ROTATE_MS = 4500;
const FADE_MS = 1100; // 淡入淡出时长：前一张慢慢消失、后一张慢慢浮出

/**
 * 首页照片大卡（左侧 40%）：最近 10 张照片自动轮播，纯淡入淡出切换（无手动控件）；
 * 奶油毛玻璃风，object-cover 铺满相框；3D 鼠标倾斜；整卡点击进入 /photos。
 */
export default function PhotosCard({
  photos,
  className = "",
  style,
}: {
  photos: HomePhoto[];
  className?: string;
  style?: CSSProperties;
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  // 3D 倾斜（大卡幅度收小）：onMouseLeave 同时恢复轮播
  const { ref, glowRef, onMouseMove, onMouseLeave: tiltLeave } = useTilt<HTMLAnchorElement>({
    maxTilt: 6,
    scale: 1.015,
    glowColor: "rgba(255,255,255,0.28)",
    glowSize: 300,
  });
  const handleLeave = () => {
    setPaused(false);
    tiltLeave();
  };

  // 自动轮播
  useEffect(() => {
    if (paused || photos.length <= 1) return;
    const t = setTimeout(() => setIdx((i) => (i + 1) % photos.length), ROTATE_MS);
    return () => clearTimeout(t);
  }, [idx, paused, photos.length]);

  const current = photos[idx];

  return (
    <Link
      ref={ref}
      href="/photos"
      style={style}
      onMouseEnter={() => setPaused(true)}
      onMouseMove={onMouseMove}
      onMouseLeave={handleLeave}
      className={`group flex h-full min-h-[22rem] flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/60 p-3 shadow-[0_2px_18px_rgba(90,90,70,0.08)] backdrop-blur-md transition-[transform,box-shadow] duration-200 ease-out will-change-transform hover:shadow-[0_14px_34px_rgba(90,90,70,0.16)] dark:border-white/10 dark:bg-white/10 dark:shadow-none lg:min-h-0 ${className}`}
    >
      {photos.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl bg-black/[0.03] p-5 text-center text-zinc-500 dark:bg-white/5">
          <span className="text-sm font-medium">照片</span>
          <span className="text-xs text-zinc-400">还没有照片，去记录生活碎片</span>
        </div>
      ) : (
        <>
          {/* 淡入淡出轮播区：所有图片叠加，仅靠 opacity 交叉溶解 */}
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-zinc-100/70 dark:bg-zinc-800/50">
            {photos.map((p, i) => (
              <img
                key={p.id}
                src={photoUrl(p.fileName)}
                alt={p.title || "照片"}
                className="absolute inset-0 h-full w-full object-cover object-[50%_25%]"
                style={{
                  opacity: i === idx ? 1 : 0,
                  transition: `opacity ${FADE_MS}ms ease-in-out`,
                }}
                draggable={false}
              />
            ))}
          </div>

          {/* 底部标题条：随图片切换一起淡入（key 重挂载触发动画） */}
          <div
            key={current?.id}
            className="flex shrink-0 items-center justify-between px-2 pb-1 pt-3"
            style={{ animation: `content-fade ${FADE_MS}ms ease-in-out` }}
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-200">
                {current?.title || "照片"}
              </div>
              <div className="text-[11px] text-zinc-400">生活碎片 · {idx + 1}/{photos.length}</div>
            </div>
          </div>
        </>
      )}

      {/* 对角线扫光：hover 时扫过整卡 */}
      <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden rounded-3xl">
        <div className="absolute -left-1/2 top-0 h-full w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:translate-x-[460%] group-hover:opacity-100" />
      </div>

      {/* 鼠标跟随光斑 */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-[3] rounded-3xl opacity-0 transition-opacity duration-300"
      />
    </Link>
  );
}
