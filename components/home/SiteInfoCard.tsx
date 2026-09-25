"use client";

import { useEffect, useState, type CSSProperties } from "react";

// ── 站点信息常量（需要修改时直接改这里）──────────────────────
// 网站上线日期（运营时间从这天起算）
const SITE_LAUNCH_DATE = "2026-09-24";
// 备案号：拿到正式备案号后填这里，留空时显示"备案号配置中"
const ICP_TEXT = "";
// ────────────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * 备案/站点信息长条卡（单独成行）：运营天数 ｜ 实时日期时间 ｜ 备案号。
 */
export default function SiteInfoCard({ style }: { style?: CSSProperties }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const launch = new Date(`${SITE_LAUNCH_DATE}T00:00:00`);
  // 上线当天算第 1 天：按整日差向下取整 +1
  const days = now
    ? Math.max(1, Math.floor((now.getTime() - launch.getTime()) / 86_400_000) + 1)
    : 1;
  const week = ["日", "一", "二", "三", "四", "五", "六"][now?.getDay() ?? 0];

  return (
    <div
      style={style}
      className="flex flex-col items-start justify-between gap-3 rounded-3xl border border-white/50 bg-white/60 px-6 py-4 shadow-[0_2px_18px_rgba(90,90,70,0.08)] backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:shadow-none sm:flex-row sm:items-center"
    >
      {/* 左：运营天数 */}
      <div className="flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-xs font-medium tracking-wide text-[#5d7a8a]">本站已运营</span>
        <span className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{days}</span>
        <span className="text-xs text-zinc-500">天</span>
      </div>

      {/* 中：实时日期时间 */}
      <p className="order-3 font-mono text-sm tabular-nums text-zinc-700 dark:text-zinc-200 sm:order-none">
        {now
          ? `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
              now.getHours()
            )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
          : "----"}
        <span className="ml-1.5 font-sans text-xs text-zinc-400">星期{week}</span>
      </p>

      {/* 右：备案号 */}
      <p className="whitespace-nowrap text-xs text-zinc-400">{ICP_TEXT || "备案号配置中"}</p>
    </div>
  );
}
