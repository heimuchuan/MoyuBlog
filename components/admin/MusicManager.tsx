"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Music, RefreshCw } from "lucide-react";

export type AdminPlaylist = {
  id: number;
  playlistId: string;
  name: string;
  cover: string | null;
  songCount: number;
  order: number;
  active: boolean;
  isDefault: boolean;
};

const inputCls =
  "rounded-xl border border-white/20 bg-white/60 px-3 py-2 text-sm outline-none focus:border-[#5d7a8a] focus:ring-1 focus:ring-[#5d7a8a]/30 dark:border-white/10 dark:bg-white/5";

/** 音乐后台管理：精选歌单（前台展示与默认播放） */
export default function MusicManager({ initial }: { initial: AdminPlaylist[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<AdminPlaylist[]>(initial);
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [order, setOrder] = useState("0");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [edit, setEdit] = useState<{ name: string; order: string } | null>(null);

  async function add() {
    const text = input.trim();
    if (!text) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: text, name, order: Number(order) || 0, active }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "添加失败");
      return;
    }
    setInput("");
    setName("");
    setRows((prev) => sortRows([...prev, data]));
    router.refresh();
  }

  async function patch(id: number, body: Record<string, unknown>) {
    const res = await fetch(`/api/playlists/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "操作失败");
      return;
    }
    setRows((prev) => sortRows(prev.map((r) => (r.id === id ? data : r))));
    router.refresh();
  }

  function startEdit(r: AdminPlaylist) {
    setEditingId(r.id);
    setEdit({ name: r.name, order: String(r.order) });
    setError("");
  }

  async function saveEdit(id: number) {
    if (!edit || !edit.name.trim()) return;
    await patch(id, { name: edit.name.trim(), order: Number(edit.order) || 0 });
    setEditingId(null);
    setEdit(null);
  }

  async function del(id: number) {
    if (!window.confirm("确定删除这个歌单吗？前台将不再展示。")) return;
    await fetch(`/api/playlists/${id}`, { method: "DELETE" });
    setRows((prev) => prev.filter((r) => r.id !== id));
    router.refresh();
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="industrial-zh mb-1 text-sm text-zinc-400">
        精选歌单（{rows.length}）· 启用 {rows.filter((r) => r.active).length}
      </h2>
      <p className="mb-4 text-xs text-zinc-400">
        粘贴网易云歌单 ID、歌单链接，或 App 分享的整段文案即可添加；「设为默认」的歌单在前台打开音乐页时自动加载。
      </p>

      {/* 添加行 */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="粘贴歌单链接 / ID / 分享文案"
          className={`${inputCls} min-w-0 flex-1`}
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 60))}
          placeholder="歌单名（留空自动获取）"
          className={`${inputCls} w-full sm:w-44`}
        />
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
          disabled={saving || !input.trim()}
          className="rounded-xl bg-[#5d7a8a] px-5 py-2 text-sm text-white transition hover:bg-[#4a6470] disabled:opacity-50"
        >
          {saving ? "添加中…" : "添加"}
        </button>
      </div>
      {error ? <p className="mb-3 text-xs text-red-500">{error}</p> : null}

      {/* 列表 */}
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">还没有歌单，粘贴一个链接试试</p>
      ) : (
        <ul className="divide-y divide-white/10">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Cover cover={r.cover} />
                {editingId === r.id && edit ? (
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    <input
                      value={edit.name}
                      onChange={(e) => setEdit({ ...edit, name: e.target.value.slice(0, 60) })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(r.id);
                        if (e.key === "Escape") {
                          setEditingId(null);
                          setEdit(null);
                        }
                      }}
                      autoFocus
                      className={`${inputCls} w-44`}
                      aria-label="歌单名"
                    />
                    <input
                      type="number"
                      value={edit.order}
                      onChange={(e) => setEdit({ ...edit, order: e.target.value })}
                      className={`${inputCls} w-20`}
                      aria-label="排序"
                    />
                    <button
                      onClick={() => saveEdit(r.id)}
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
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-zinc-700 dark:text-white/90">
                        {r.name}
                      </p>
                      {r.isDefault && (
                        <span className="shrink-0 rounded-full bg-[#5d7a8a]/15 px-2 py-0.5 text-[10px] text-[#5d7a8a]">
                          默认播放
                        </span>
                      )}
                    </div>
                    <a
                      href={`https://music.163.com/#/playlist?id=${r.playlistId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block max-w-[22rem] truncate text-xs text-zinc-400 hover:text-[#5d7a8a] hover:underline"
                    >
                      ID {r.playlistId} · {r.songCount} 首
                    </a>
                  </div>
                )}
              </div>
              {editingId !== r.id && (
                <div className="flex shrink-0 flex-wrap items-center gap-3 text-sm">
                  <span className="text-xs text-zinc-400">#{r.order}</span>
                  <button
                    onClick={() => patch(r.id, { active: !r.active })}
                    className={
                      r.active
                        ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-600 hover:bg-emerald-500/25"
                        : "rounded-full bg-zinc-400/15 px-2 py-0.5 text-xs text-zinc-500 hover:bg-zinc-400/25"
                    }
                  >
                    {r.active ? "启用中" : "已停用"}
                  </button>
                  {!r.isDefault && (
                    <button
                      onClick={() => patch(r.id, { isDefault: true })}
                      className="text-[#5d7a8a] hover:underline"
                    >
                      设为默认
                    </button>
                  )}
                  <button
                    onClick={() => patch(r.id, { refreshMeta: true })}
                    aria-label="刷新歌单信息"
                    title="重新抓取封面与曲目数"
                    className="flex items-center gap-1 text-zinc-500 hover:text-[#5d7a8a]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.8} />
                  </button>
                  <button onClick={() => startEdit(r)} className="text-[#5d7a8a] hover:underline">
                    编辑
                  </button>
                  <button onClick={() => del(r.id)} className="text-red-500 hover:underline">
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

function Cover({ cover }: { cover: string | null }) {
  return (
    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg shadow-sm">
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-400 to-purple-600 text-white">
          <Music className="h-4 w-4" strokeWidth={1.8} />
        </div>
      )}
    </div>
  );
}

function sortRows(arr: AdminPlaylist[]) {
  return [...arr].sort(
    (a, b) =>
      Number(b.isDefault) - Number(a.isDefault) || a.order - b.order || a.id - b.id,
  );
}
