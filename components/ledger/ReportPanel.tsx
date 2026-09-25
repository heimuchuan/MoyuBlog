"use client";

import { useEffect, useState } from "react";
import { getCategory } from "@/lib/ledger-categories";
import { addDaysStr, todayStr, yuan } from "@/lib/ledger-date";
import LedgerIcon from "./LedgerIcon";
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from "@/components/Icons";

type Report = {
  start: string;
  end: string;
  label: string;
  expense: number;
  income: number;
  count: number;
  byCategory: { key: string; type: string; count: number; amount: number }[];
  byDay: { date: string; expense: number; income: number }[];
};

export default function ReportPanel() {
  const [period, setPeriod] = useState<"week" | "month">("month");
  const [ref, setRef] = useState(todayStr());
  const [r, setR] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/ledger/report?period=${period}&ref=${ref}`)
      .then((res) => res.json())
      .then((data) => setR(data))
      .finally(() => setLoading(false));
  }, [period, ref]);

  // 上一周期 / 下一周期（不能越过当前周期）
  function shift(n: number) {
    if (!r) return;
    const nextRef = n < 0 ? addDaysStr(r.start, -1) : addDaysStr(r.end, 1);
    if (nextRef > todayStr()) return;
    setRef(nextRef);
  }

  const maxCat = r?.byCategory[0]?.amount ?? 1;
  const maxDay = r ? Math.max(1, ...r.byDay.map((d) => Math.max(d.expense, d.income))) : 1;
  const isCurrentPeriod = r ? todayStr() >= r.start && todayStr() <= r.end : true;

  return (
    <div className="space-y-4">
      {/* 周期切换 + 导航 */}
      <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3">
        <div className="flex rounded-full bg-black/5 p-1 text-sm dark:bg-white/10">
          {(["week", "month"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-full px-4 py-1.5 font-medium transition ${
                period === p ? "bg-[#5d7a8a] text-white shadow" : "text-zinc-500"
              }`}
            >
              {p === "week" ? "本周" : "本月"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 text-sm">
          <button type="button" onClick={() => shift(-1)} aria-label="上一周期" className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10">
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <span className="min-w-32 text-center text-xs text-zinc-500">{r?.label}</span>
          <button
            type="button"
            onClick={() => shift(1)}
            disabled={isCurrentPeriod}
            aria-label="下一周期"
            className="rounded-lg p-1.5 hover:bg-black/5 disabled:opacity-30 dark:hover:bg-white/10"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
        <a
          href={`/api/ledger/export?period=${period}&ref=${ref}`}
          className="flex items-center gap-1.5 rounded-xl bg-[#5d7a8a] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#4a6470]"
        >
          <DownloadIcon className="h-3.5 w-3.5" />
          导出 CSV 报告
        </a>
      </div>

      {loading || !r ? (
        <div className="glass rounded-2xl p-12 text-center text-sm text-zinc-500">统计中…</div>
      ) : (
        <>
          {/* 收支总览（喵喵暖色卡） */}
          <div className="grid grid-cols-3 gap-3 rounded-3xl bg-gradient-to-br from-[#FF9F43] to-[#FF6B9D] p-5 text-white shadow-lg">
            <div>
              <p className="text-xs opacity-80">支出</p>
              <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">¥{yuan(r.expense)}</p>
            </div>
            <div>
              <p className="text-xs opacity-80">收入</p>
              <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">¥{yuan(r.income)}</p>
            </div>
            <div>
              <p className="text-xs opacity-80">结余 · {r.count} 笔</p>
              <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">¥{yuan(r.income - r.expense)}</p>
            </div>
          </div>

          {/* 分类排行 */}
          <div className="glass rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-semibold">分类排行</h3>
            {r.byCategory.length === 0 ? (
              <p className="py-6 text-center text-xs text-zinc-500">该周期暂无记录</p>
            ) : (
              <ul className="space-y-3">
                {r.byCategory.map((c) => {
                  const cat = getCategory(c.type, c.key);
                  return (
                    <li key={c.key} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: cat.bg, color: cat.bar }}>
                        <LedgerIcon name={cat.key} className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span>
                            {cat.label}
                            <span className="ml-1 text-zinc-400">{c.count} 笔</span>
                          </span>
                          <span className="tabular-nums font-medium">¥{yuan(c.amount)}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${(c.amount / maxCat) * 100}%`, background: cat.bar }}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* 每日收支柱状图 */}
          <div className="glass rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-semibold">每日收支</h3>
            <div className="flex h-32 items-end gap-[3px]">
              {r.byDay.map((d) => (
                <div key={d.date} className="group relative flex h-full flex-1 items-end justify-center gap-[2px]">
                  {d.expense > 0 && (
                    <div
                      className="w-1/2 rounded-t bg-[#FF9F43]/80 transition-all"
                      style={{ height: `${(d.expense / maxDay) * 100}%`, minHeight: 2 }}
                      title={`${d.date} 支出 ¥${yuan(d.expense)}`}
                    />
                  )}
                  {d.income > 0 && (
                    <div
                      className="w-1/2 rounded-t bg-[#26C281]/80"
                      style={{ height: `${(d.income / maxDay) * 100}%`, minHeight: 2 }}
                      title={`${d.date} 收入 ¥${yuan(d.income)}`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-zinc-400">
              <span>{r.start}</span>
              <span className="flex gap-3">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm bg-[#FF9F43]" />
                  支出
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm bg-[#26C281]" />
                  收入
                </span>
              </span>
              <span>{r.end}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
