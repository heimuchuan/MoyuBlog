"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Quote = {
  id: number;
  content: string;
  active: boolean;
  createdAt: string;
};

function formatTime(d: string) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
    dt.getDate()
  ).padStart(2, "0")}`;
}

/** 金句后台管理：新增 + 列表内联编辑/启停/删除 */
export default function QuoteManager({ initial }: { initial: Quote[] }) {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>(initial);
  const [newContent, setNewContent] = useState("");
  const [newActive, setNewActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  async function add() {
    const text = newContent.trim();
    if (!text) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, active: newActive }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "添加失败");
      return;
    }
    setNewContent("");
    setNewActive(true);
    setQuotes((prev) => [data, ...prev]);
    router.refresh();
  }

  async function toggle(id: number, active: boolean) {
    const res = await fetch(`/api/quotes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: quotes.find((q) => q.id === id)?.content ?? "", active }),
    });
    if (res.ok) {
      setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, active } : q)));
      router.refresh();
    }
  }

  function startEdit(q: Quote) {
    setEditingId(q.id);
    setEditText(q.content);
  }

  async function saveEdit(id: number) {
    const text = editText.trim();
    if (!text) return;
    const res = await fetch(`/api/quotes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    if (res.ok) {
      setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, content: text } : q)));
      setEditingId(null);
      router.refresh();
    }
  }

  async function del(id: number) {
    if (!window.confirm("确定删除这条金句吗？")) return;
    await fetch(`/api/quotes/${id}`, { method: "DELETE" });
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* 新增 */}
      <div className="glass rounded-2xl p-5">
        <h2 className="industrial-zh mb-3 text-sm text-zinc-400">添加金句</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={newContent}
            onChange={(e) => setNewContent(e.target.value.slice(0, 200))}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="写一句想展示的金句…"
            className="flex-1 rounded-xl border border-white/20 bg-white/60 px-3 py-2 text-sm outline-none focus:border-[#5d7a8a] focus:ring-1 focus:ring-[#5d7a8a]/30 dark:border-white/10 dark:bg-white/5"
          />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-500">
            <input
              type="checkbox"
              checked={newActive}
              onChange={(e) => setNewActive(e.target.checked)}
              className="h-4 w-4 accent-[#5d7a8a]"
            />
            启用
          </label>
          <button
            onClick={add}
            disabled={saving || !newContent.trim()}
            className="rounded-xl bg-[#5d7a8a] px-5 py-2 text-sm text-white transition hover:bg-[#4a6470] disabled:opacity-50"
          >
            {saving ? "添加中…" : "添加"}
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
          <span>{error ? <span className="text-red-500">{error}</span> : null}</span>
          <span>{newContent.length}/200</span>
        </div>
      </div>

      {/* 列表 */}
      <div className="glass rounded-2xl p-6">
        <h2 className="industrial-zh mb-4 text-sm text-zinc-400">
          全部金句（{quotes.length}）· 启用 {quotes.filter((q) => q.active).length} · 停用{" "}
          {quotes.filter((q) => !q.active).length}
        </h2>
        {quotes.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-400">还没有金句，添加一条试试</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {quotes.map((q) => (
              <li key={q.id} className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0 flex-1">
                  {editingId === q.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value.slice(0, 200))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(q.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        className="flex-1 rounded-xl border border-white/20 bg-white/60 px-3 py-1.5 text-sm outline-none focus:border-[#5d7a8a] focus:ring-1 focus:ring-[#5d7a8a]/30 dark:border-white/10 dark:bg-white/5"
                      />
                      <button
                        onClick={() => saveEdit(q.id)}
                        className="rounded-lg bg-[#5d7a8a] px-3 py-1.5 text-xs text-white hover:bg-[#4a6470]"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <p className="break-words text-sm leading-relaxed">{q.content}</p>
                  )}
                  <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
                    <span>{formatTime(q.createdAt)}</span>
                    <button
                      onClick={() => toggle(q.id, !q.active)}
                      className={
                        q.active
                          ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-600 hover:bg-emerald-500/25"
                          : "rounded-full bg-zinc-400/15 px-2 py-0.5 text-zinc-500 hover:bg-zinc-400/25"
                      }
                    >
                      {q.active ? "启用中" : "已停用"}
                    </button>
                  </div>
                </div>
                {editingId !== q.id && (
                  <div className="flex shrink-0 gap-3 text-sm">
                    <button
                      onClick={() => startEdit(q)}
                      className="text-[#5d7a8a] hover:underline"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => del(q.id)}
                      className="text-red-500 hover:underline"
                    >
                      删除
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
