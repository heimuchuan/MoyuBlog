"use client";

import { useMemo, useState } from "react";
import { categoriesOf, type EntryType } from "@/lib/ledger-categories";
import { parseDateFromText, todayStr, weekdayStr, yuan } from "@/lib/ledger-date";
import LedgerIcon from "./LedgerIcon";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"];

export default function EntryForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [type, setType] = useState<EntryType>("expense");
  const [category, setCategory] = useState("food");
  const [amount, setAmount] = useState("0");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [recognized, setRecognized] = useState(false);

  const cats = categoriesOf(type);
  const cents = Math.round((parseFloat(amount) || 0) * 100);

  // 输入备注时实时识别日期：识别到则自动更新日期，并提示已从备注剔除
  const cleanedPreview = useMemo(() => parseDateFromText(note).cleaned, [note]);

  function switchType(t: EntryType) {
    setType(t);
    setCategory(categoriesOf(t)[0].key);
  }

  function onNote(v: string) {
    setNote(v);
    const parsed = parseDateFromText(v);
    if (parsed.date) {
      setDate(parsed.date);
      setRecognized(true);
    } else {
      setRecognized(false);
    }
  }

  function press(k: string) {
    setAmount((prev) => {
      if (k === ".") {
        if (prev.includes(".")) return prev;
        return prev === "0" ? "0." : `${prev}.`;
      }
      if (prev === "0") return k;
      // 小数最多两位
      if (prev.includes(".")) {
        const dec = prev.split(".")[1];
        if (dec.length >= 2) return prev;
      }
      if (prev.replace(".", "").length >= 8) return prev; // 防超长
      return prev + k;
    });
  }

  function backspace() {
    setAmount((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
  }

  async function save() {
    if (cents <= 0) {
      setError("请输入金额");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/ledger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, amount: cents, category, note, date }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "保存失败");
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="glass max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-5 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 支出 / 收入 切换 */}
        <div className="mx-auto flex w-48 rounded-full bg-black/5 p-1 text-sm dark:bg-white/10">
          {(["expense", "income"] as EntryType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => switchType(t)}
              className={`flex-1 rounded-full py-1.5 font-medium transition ${
                type === t
                  ? t === "expense"
                    ? "bg-[#FF6B6B] text-white shadow"
                    : "bg-[#26C281] text-white shadow"
                  : "text-zinc-500"
              }`}
            >
              {t === "expense" ? "支出" : "收入"}
            </button>
          ))}
        </div>

        {/* 分类圆钮（线条图标 + 马卡龙圆底） */}
        <div className="mt-5 grid grid-cols-6 gap-2">
          {cats.map((c) => {
            const active = c.key === category;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className="flex flex-col items-center gap-1"
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full transition-transform"
                  style={{
                    background: c.bg,
                    color: c.bar,
                    transform: active ? "scale(1.12)" : "scale(1)",
                    boxShadow: active ? `0 0 0 2px ${c.bar}` : "none",
                  }}
                >
                  <LedgerIcon name={c.key} className="h-5 w-5" />
                </span>
                <span className={`text-[11px] ${active ? "font-semibold" : "text-zinc-500"}`}>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* 金额大字 */}
        <div className="mt-5 flex items-baseline justify-end gap-1 border-b border-black/10 pb-3 dark:border-white/10">
          <span className="text-lg text-zinc-500">¥</span>
          <span
            className={`text-4xl font-bold tabular-nums tracking-tight ${
              type === "expense" ? "text-[#FF6B6B]" : "text-[#26C281]"
            }`}
          >
            {amount}
          </span>
        </div>

        {/* 备注 + 日期 */}
        <div className="mt-3 space-y-2">
          <input
            value={note}
            onChange={(e) => onNote(e.target.value)}
            placeholder="备注（可写“昨天 奶茶”“9月30日 午饭”自动识别日期）"
            className="w-full rounded-xl border border-white/20 bg-white/60 px-3 py-2 text-sm outline-none focus:border-[#5d7a8a] dark:border-white/10 dark:bg-white/5"
          />
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setRecognized(false);
              }}
              className="rounded-lg border border-white/20 bg-white/60 px-2 py-1 outline-none dark:border-white/10 dark:bg-white/5"
            />
            <span className="text-zinc-500">{weekdayStr(date)}</span>
            {recognized && (
              <span className="rounded-full bg-[#5d7a8a]/15 px-2 py-0.5 text-[#5d7a8a]">
                已从备注自动识别日期{cleanedPreview ? `：${cleanedPreview}` : ""}
              </span>
            )}
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* 数字键盘 */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {KEYS.slice(0, 3).map((k) => (
            <PadKey key={k} onClick={() => press(k)}>{k}</PadKey>
          ))}
          <PadKey onClick={backspace} ariaLabel="删除">
            <svg className="mx-auto h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 5H8l-6 7 6 7h13a1 1 0 001-1V6a1 1 0 00-1-1z" />
              <path d="M12 10l5 5M17 10l-5 5" />
            </svg>
          </PadKey>

          {KEYS.slice(3, 6).map((k) => (
            <PadKey key={k} onClick={() => press(k)}>{k}</PadKey>
          ))}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="row-span-2 rounded-2xl bg-gradient-to-br from-[#FF9F43] to-[#FF6B9D] text-base font-semibold text-white shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            {saving ? "…" : "保存"}
          </button>

          {KEYS.slice(6, 9).map((k) => (
            <PadKey key={k} onClick={() => press(k)}>{k}</PadKey>
          ))}

          <div />
          <PadKey onClick={() => press("0")}>0</PadKey>
          <PadKey onClick={() => press(".")}>.</PadKey>
          <div />
        </div>
        <p className="mt-3 text-center text-[11px] text-zinc-400">当前金额 ¥{yuan(cents)}</p>
      </div>
    </div>
  );
}

function PadKey({
  children,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="rounded-2xl bg-white/70 py-3 text-xl font-medium tabular-nums shadow-sm transition active:scale-90 dark:bg-white/10"
    >
      {children}
    </button>
  );
}
