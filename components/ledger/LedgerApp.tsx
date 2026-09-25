"use client";

import { useState } from "react";
import { fmtDate, todayStr, yuan } from "@/lib/ledger-date";
import type { LedgerEntryT } from "./types";
import EntryForm from "./EntryForm";
import EntryList from "./EntryList";
import ReportPanel from "./ReportPanel";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@/components/Icons";

/** 月首字符串 → 月初/月末 */
function monthBounds(monthStart: string) {
  const d = new Date(`${monthStart}T00:00:00`);
  const y = d.getFullYear();
  const m = d.getMonth();
  const start = `${y}-${String(m + 1).padStart(2, "0")}-01`;
  const end = fmtDate(new Date(y, m + 1, 0));
  return { start, end, label: `${y} 年 ${m + 1} 月` };
}

export default function LedgerApp({
  initialEntries,
  monthStart,
}: {
  initialEntries: LedgerEntryT[];
  monthStart: string;
}) {
  const [entries, setEntries] = useState<LedgerEntryT[]>(initialEntries);
  const [tab, setTab] = useState<"list" | "report">("list");
  const [formOpen, setFormOpen] = useState(false);
  const [monthRef, setMonthRef] = useState(monthStart);

  const bounds = monthBounds(monthRef);
  const curMonthStart = monthBounds(todayStr()).start;

  const monthExpense = entries.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const monthIncome = entries.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);

  // 重新拉取当前展示月份的条目（新增/删除后直接更新 state，避免 router.refresh 不重置 useState）
  async function reload(b = bounds) {
    const res = await fetch(`/api/ledger?start=${b.start}&end=${b.end}`);
    if (res.ok) setEntries(await res.json());
  }

  async function shiftMonth(n: number) {
    const d = new Date(`${monthRef}T00:00:00`);
    d.setMonth(d.getMonth() + n);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    if (next > curMonthStart) return; // 不允许翻到未来月份
    const b = monthBounds(next);
    const res = await fetch(`/api/ledger?start=${b.start}&end=${b.end}`);
    if (res.ok) {
      setEntries(await res.json());
      setMonthRef(next);
    }
  }

  return (
    <div className="pb-24">
      {/* 本月收支总览（喵喵暖色渐变卡） */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF9F43] to-[#FF6B9D] p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="上一月"
            className="rounded-full p-1.5 hover:bg-white/20"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium opacity-90">{bounds.label}</span>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            disabled={monthRef >= curMonthStart}
            aria-label="下一月"
            className="rounded-full p-1.5 hover:bg-white/20 disabled:opacity-30"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-4 text-xs opacity-80">本月支出</p>
        <p className="text-4xl font-bold tabular-nums tracking-tight">¥{yuan(monthExpense)}</p>
        <div className="mt-4 flex gap-6 text-sm">
          <span className="opacity-90">收入 ¥{yuan(monthIncome)}</span>
          <span className="opacity-90">结余 ¥{yuan(monthIncome - monthExpense)}</span>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="absolute bottom-5 right-5 flex items-center gap-1.5 rounded-full bg-white/25 px-4 py-1.5 text-sm font-medium backdrop-blur transition hover:bg-white/40"
        >
          <PlusIcon className="h-4 w-4" />
          记一笔
        </button>
      </div>

      {/* 明细 / 报表 切换 */}
      <div className="my-5 flex justify-center">
        <div className="flex rounded-full bg-black/5 p-1 text-sm dark:bg-white/10">
          {([["list", "明细"], ["report", "报表"]] as const).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`rounded-full px-8 py-1.5 font-medium transition ${
                tab === k ? "bg-white shadow text-zinc-800 dark:bg-white/20 dark:text-white" : "text-zinc-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "list" ? <EntryList entries={entries} onChanged={() => reload()} /> : <ReportPanel />}

      {/* 悬浮记一笔按钮（右下角，避开左下回顶按钮） */}
      <button
        type="button"
        onClick={() => setFormOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FF9F43] to-[#FF6B9D] text-white shadow-xl transition hover:scale-105 active:scale-95"
        aria-label="记一笔"
      >
        <PlusIcon className="h-7 w-7" />
      </button>

      {formOpen && (
        <EntryForm
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            reload();
          }}
        />
      )}
    </div>
  );
}
