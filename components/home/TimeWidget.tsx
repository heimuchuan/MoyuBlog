"use client";

import { useEffect, useState } from "react";
import { JetBrains_Mono } from "next/font/google";

// 清晰等宽字体，大字号下边缘锐利，自带 tabular 等宽特征
const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

const WEEK = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

// 个人卡底部时间微件：左侧实时时间（清晰数码字 + 微弱紫色发光）｜右侧星期日期
export default function TimeWidget() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000); // 每秒刷新
    return () => clearInterval(t);
  }, []);

  const hh = now ? String(now.getHours()).padStart(2, "0") : "--";
  const mm = now ? String(now.getMinutes()).padStart(2, "0") : "--";
  const ss = now ? String(now.getSeconds()).padStart(2, "0") : "--";
  const date = `${String((now?.getMonth() ?? -1) + 1).padStart(2, "0")}/${String(
    now?.getDate() ?? 0,
  ).padStart(2, "0")}`;

  return (
    <div className="group flex items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur transition-colors duration-300 hover:bg-white/20 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
      {/* 时大分中秒小，items-center 保证与日期同中轴线；tabular-nums 防秒数进位晃动；
          发光用小模糊半径 + 低透明度，悬停时轻微提亮 */}
      <span
        className={`time-digits flex items-center gap-0.5 font-medium tracking-widest tabular-nums text-zinc-800 group-hover:text-zinc-900 dark:text-zinc-100 dark:group-hover:text-white ${monoFont.className}`}
      >
        <span className="text-2xl font-bold sm:text-3xl">{hh}</span>
        <span className="time-colon-blink text-xl font-bold sm:text-2xl">:</span>
        <span className="text-2xl font-bold sm:text-3xl">{mm}</span>
        <span className="time-colon-blink text-base font-medium opacity-80 sm:text-lg">:</span>
        <span className="text-base font-medium opacity-80 sm:text-lg">{ss}</span>
      </span>
      <span className="mx-3 h-6 w-px bg-zinc-300/60 dark:bg-white/15" />
      <span className="whitespace-nowrap text-sm leading-none text-zinc-500 dark:text-zinc-400">
        {now ? WEEK[now.getDay()] : "周--"} {date}
      </span>
    </div>
  );
}
