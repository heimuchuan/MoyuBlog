"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Danmaku = {
  id: number;
  text: string;
  top: number;
  dur: number;
  order: number;
  active: boolean;
};

const inputCls =
  "rounded-xl border border-white/20 bg-white/60 px-3 py-2 text-sm outline-none focus:border-[#5d7a8a] focus:ring-1 focus:ring-[#5d7a8a]/30 dark:border-white/10 dark:bg-white/5";

export default function DanmakuManager({ initial }: { initial: Danmaku[] }) {
  const router = useRouter();
  const [list, setList] = useState<Danmaku[]>(initial);
  const [text, setText] = useState("");
  const [top, setTop] = useState("0");
  const [dur, setDur] = useState("18");
  const [order, setOrder] = useState("0");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [edit, setEdit] = useState<Danmaku | null>(null);

  async function add() {
    const content = text.trim();
    if (!content) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/danmaku", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: content,
        top: Number(top) || 0,
        dur: Number(dur) || 18,
        order: Number(order) || 0,
        active,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "添加失败");
      return;
    }
    setText("");
    setList((prev) => sortDanmaku([...prev, data]));
    router.refresh();
  }

  async function toggle(id: number, next: boolean) {
    const res = await fetch(`/api/danmaku/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    if (res.ok) {
      setList((prev) => prev.map((d) => (d.id === id ? { ...d, active: next } : d)));
      router.refresh();
    }
  }

  function startEdit(d: Danmaku) {
    setEditingId(d.id);
    setEdit({ ...d });
  }

  async function saveEdit(id: number) {
    if (!edit) return;
    const res = await fetch(`/api/danmaku/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: edit.text,
        top: edit.top,
        dur: edit.dur,
        order: edit.order,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setList((prev) => sortDanmaku(prev.map((d) => (d.id === id ? data : d))));
      setEditingId(null);
      setEdit(null);
      router.refresh();
    }
  }

  async function del(id: number) {
    if (!window.confirm("确定删除这条弹幕吗？")) return;
    await fetch(`/api/danmaku/${id}`, { method: "DELETE" });
    setList((prev) => prev.filter((d) => d.id !== id));
    router.refresh();
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="industrial-zh mb-4 text-sm text-zinc-400">
        背景弹幕（{list.length}）· 启用 {list.filter((d) => d.active).length}
      </h2>

      {/* 添加行 */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 100))}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="弹幕内容"
          className={`${inputCls} min-w-0 flex-1`}
        />
        <label className="flex items-center gap-2 text-xs text-zinc-500">
          位置%
          <input
            type="number"
            min={0}
            max={100}
            value={top}
            onChange={(e) => setTop(e.target.value)}
            className={`${inputCls} w-20`}
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-zinc-500">
          时长s
          <input
            type="number"
            min={5}
            max={60}
            value={dur}
            onChange={(e) => setDur(e.target.value)}
            className={`${inputCls} w-20`}
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-zinc-500">
          排序
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className={`${inputCls} w-20`}
          />
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-500">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-[#5d7a8a]"
          />
          启用
        </label>
        <button
          onClick={add}
          disabled={saving || !text.trim()}
          className="rounded-xl bg-[#5d7a8a] px-5 py-2 text-sm text-white transition hover:bg-[#4a6470] disabled:opacity-50"
        >
          {saving ? "添加中…" : "添加"}
        </button>
      </div>
      {error ? <p className="mb-3 text-xs text-red-500">{error}</p> : null}

      {/* 列表 */}
      {list.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">还没有弹幕，添加一条试试</p>
      ) : (
        <ul className="divide-y divide-white/10">
          {list.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0 flex-1">
                {editingId === d.id && edit ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={edit.text}
                      onChange={(e) => setEdit({ ...edit, text: e.target.value.slice(0, 100) })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(d.id);
                        if (e.key === "Escape") {
                          setEditingId(null);
                          setEdit(null);
                        }
                      }}
                      autoFocus
                      className={`${inputCls} min-w-0 flex-1 sm:w-72`}
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={edit.top}
                      onChange={(e) => setEdit({ ...edit, top: Number(e.target.value) })}
                      className={`${inputCls} w-20`}
                      aria-label="垂直位置"
                    />
                    <input
                      type="number"
                      min={5}
                      max={60}
                      value={edit.dur}
                      onChange={(e) => setEdit({ ...edit, dur: Number(e.target.value) })}
                      className={`${inputCls} w-20`}
                      aria-label="滚动时长"
                    />
                    <input
                      type="number"
                      value={edit.order}
                      onChange={(e) => setEdit({ ...edit, order: Number(e.target.value) })}
                      className={`${inputCls} w-20`}
                      aria-label="排序"
                    />
                    <button
                      onClick={() => saveEdit(d.id)}
                      className="rounded-lg bg-[#5d7a8a] px-3 py-1.5 text-xs text-white hover:bg-[#4a6470]"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEdit(null);
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-700 dark:text-white/90">{d.text}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      位置 {d.top}% · 滚动 {d.dur}s · 排序 #{d.order}
                    </p>
                  </div>
                )}
              </div>
              {editingId !== d.id && (
                <div className="flex shrink-0 items-center gap-3 text-sm">
                  <button
                    onClick={() => toggle(d.id, !d.active)}
                    className={
                      d.active
                        ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-600 hover:bg-emerald-500/25"
                        : "rounded-full bg-zinc-400/15 px-2 py-0.5 text-xs text-zinc-500 hover:bg-zinc-400/25"
                    }
                  >
                    {d.active ? "启用中" : "已停用"}
                  </button>
                  <button onClick={() => startEdit(d)} className="text-[#5d7a8a] hover:underline">
                    编辑
                  </button>
                  <button onClick={() => del(d.id)} className="text-red-500 hover:underline">
                    删除
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function sortDanmaku(arr: Danmaku[]) {
  return [...arr].sort((a, b) => a.order - b.order || a.id - b.id);
}
