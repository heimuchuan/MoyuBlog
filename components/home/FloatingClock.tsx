"use client";

import { useEffect, useState } from "react";
import { Black_Ops_One } from "next/font/google";

const industrialFont = Black_Ops_One({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// 右上角悬浮时钟：固定定位，不随滚动移动；手机端隐藏避免遮挡
export default function FloatingClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hh = now ? String(now.getHours()).padStart(2, "0") : "--";
  const mm = now ? String(now.getMinutes()).padStart(2, "0") : "--";
  const ss = now ? String(now.getSeconds()).padStart(2, "0") : "--";

  return (
    <div className="glass pointer-events-none fixed right-4 top-24 z-40 hidden select-none rounded-2xl px-4 py-2.5 md:block">
      <div className={`flex items-baseline leading-none ${industrialFont.className}`}>
        <span className="rust-text relative text-2xl tracking-wide">{hh}</span>
        <span className="rust-text relative text-lg opacity-70">:{mm}</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">:{ss}</span>
      </div>
    </div>
  );
}
