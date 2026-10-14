"use client";

import { useEffect, useState } from "react";

const IMAGES = [
  { src: "/background.jpg", position: "center" },
  { src: "/background-2.jpg", position: "top" },
];
const INTERVAL = 5000; // 每 5 秒切换

type DanmakuItem = { id: number; text: string; top: number; dur: number; active?: boolean };

export default function BackgroundSlideshow() {
  const [index, setIndex] = useState(0);
  const [danmaku, setDanmaku] = useState<DanmakuItem[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % IMAGES.length), INTERVAL);
    return () => clearInterval(timer);
  }, []);

  // 从后台管理的弹幕接口拉取启用项（/api/danmaku 返回全部，前端过滤 active）
  useEffect(() => {
    let cancelled = false;
    fetch("/api/danmaku", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: DanmakuItem[]) => {
        if (!cancelled) setDanmaku(list.filter((d) => d.active));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {/* 背景图：降低明度 + 模糊；外扩 16px 防止模糊在边缘产生羽化露底 */}
      <div className="absolute -inset-4 bg-cover opacity-40 blur-[10px] transition-all duration-1000 dark:opacity-25">
        {IMAGES.map((img, i) => (
          <div
            key={img.src}
            className="absolute inset-0 bg-cover transition-opacity duration-1000"
            style={{
              backgroundImage: `url('${img.src}')`,
              backgroundPosition: img.position,
              opacity: i === index ? 1 : 0,
            }}
          />
        ))}
      </div>

      {/* 深色遮罩：独立层，压低背景明度，保证毛玻璃卡片上的文字可读 */}
      <div className="absolute -inset-4 bg-black/20 dark:bg-black/35" />

      {/* 彩色光斑 */}
      <div className="absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-300/40 blur-3xl dark:bg-indigo-600/20" />
        <div className="absolute right-[-10%] top-1/4 h-80 w-80 rounded-full bg-pink-300/40 blur-3xl dark:bg-pink-600/20" />
        <div className="absolute bottom-[-10%] left-1/3 h-96 w-96 rounded-full bg-sky-300/30 blur-3xl dark:bg-purple-600/20" />
      </div>

      {/* 流动弹幕 */}
      <div className="absolute inset-0 overflow-hidden">
        {danmaku.map((d) => (
          <span
            key={d.id}
            className="absolute whitespace-nowrap font-medium"
            style={{
              top: `${d.top}%`,
              fontSize: "13px",
              color: "var(--danmaku-color)",
              textShadow: "var(--danmaku-glow)",
              transition: "color 0.7s ease, text-shadow 0.7s ease",
              animation: `danmaku-flow ${d.dur}s linear infinite`,
            }}
          >
            {d.text}
          </span>
        ))}
      </div>
    </>
  );
}