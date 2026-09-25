"use client";

import { getCategory } from "@/lib/ledger-categories";
import { weekdayStr, yuan } from "@/lib/ledger-date";
import LedgerIcon from "./LedgerIcon";
import type { LedgerEntryT } from "./types";

/** 明细列表：按日期分组，组头显示当日支出合计；点击条目确认删除 */
export default function EntryList({
  entries,
  onChanged,
}: {
  entries: LedgerEntryT[];
  onChanged: () => void;
}) {

  if (entries.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center text-sm text-zinc-500">
        本月还没有记录，点右下角「记一笔」开始吧～
      </div>
    );
  }

  // 按日期分组（entries 已按日期倒序）
  const groups: { date: string; items: LedgerEntryT[] }[] = [];
  for (const e of entries) {
    const last = groups[groups.length - 1];
    if (last && last.date === e.date) last.items.push(e);
    else groups.push({ date: e.date, items: [e] });
  }

  async function del(id: number) {
    if (!window.confirm("删除这条记录？")) return;
    await fetch("/api/ledger", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    onChanged();
  }

  return (
    <div className="space-y-4">
      {groups.map((g) => {
        const dayExp = g.items.filter((i) => i.type === "expense").reduce((s, i) => s + i.amount, 0);
        const d = new Date(`${g.date}T00:00:00`);
        return (
          <div key={g.date} className="glass overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-black/5 px-4 py-2.5 text-xs dark:border-white/10">
              <span className="font-medium">
                {d.getMonth() + 1}月{d.getDate()}日 · {weekdayStr(g.date)}
              </span>
              <span className="text-zinc-500">支出 ¥{yuan(dayExp)}</span>
            </div>
            <ul>
              {g.items.map((e) => {
                const cat = getCategory(e.type, e.category);
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => del(e.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-black/5 dark:hover:bg-white/5"
                      title="点击删除"
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                        style={{ background: cat.bg, color: cat.bar }}
                      >
                        <LedgerIcon name={cat.key} className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{cat.label}</span>
                        {e.note && <span className="block truncate text-xs text-zinc-500">{e.note}</span>}
                      </span>
                      <span
                        className={`shrink-0 text-sm font-semibold tabular-nums ${
                          e.type === "income" ? "text-[#26C281]" : "text-zinc-700 dark:text-zinc-200"
                        }`}
                      >
                        {e.type === "income" ? "+" : "-"}¥{yuan(e.amount)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
