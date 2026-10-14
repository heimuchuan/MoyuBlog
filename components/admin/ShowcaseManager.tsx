"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SOCIAL_ICONS, SOCIAL_ICON_KEYS } from "@/components/Icons";

type ShowcaseTag = {
  id: number;
  name: string;
  order: number;
  active: boolean;
};

type SocialLink = {
  id: number;
  label: string;
  href: string;
  icon: string;
  order: number;
  active: boolean;
};

const inputCls =
  "rounded-xl border border-white/20 bg-white/60 px-3 py-2 text-sm outline-none focus:border-[#5d7a8a] focus:ring-1 focus:ring-[#5d7a8a]/30 dark:border-white/10 dark:bg-white/5";

/** 大屏后台管理：标签 + 社交链接 */
export default function ShowcaseManager({
  initialTags,
  initialLinks,
}: {
  initialTags: ShowcaseTag[];
  initialLinks: SocialLink[];
}) {
  return (
    <div className="space-y-6">
      <TagSection initial={initialTags} />
      <LinkSection initial={initialLinks} />
    </div>
  );
}

/* ─────────────── 大屏标签 ─────────────── */

function TagSection({ initial }: { initial: ShowcaseTag[] }) {
  const router = useRouter();
  const [tags, setTags] = useState<ShowcaseTag[]>(initial);
  const [name, setName] = useState("");
  const [order, setOrder] = useState("0");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editOrder, setEditOrder] = useState("0");

  async function add() {
    const text = name.trim();
    if (!text) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/showcase-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: text, order: Number(order) || 0, active }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "添加失败");
      return;
    }
    setName("");
    setTags((prev) => sortTags([...prev, data]));
    router.refresh();
  }

  async function toggle(id: number, next: boolean) {
    const res = await fetch(`/api/showcase-tags/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    if (res.ok) {
      setTags((prev) => prev.map((t) => (t.id === id ? { ...t, active: next } : t)));
      router.refresh();
    }
  }

  function startEdit(t: ShowcaseTag) {
    setEditingId(t.id);
    setEditName(t.name);
    setEditOrder(String(t.order));
  }

  async function saveEdit(id: number) {
    const text = editName.trim();
    if (!text) return;
    const res = await fetch(`/api/showcase-tags/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: text, order: Number(editOrder) || 0 }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setTags((prev) => sortTags(prev.map((t) => (t.id === id ? data : t))));
      setEditingId(null);
      router.refresh();
    }
  }

  async function del(id: number) {
    if (!window.confirm("确定删除这个标签吗？")) return;
    await fetch(`/api/showcase-tags/${id}`, { method: "DELETE" });
    setTags((prev) => prev.filter((t) => t.id !== id));
    router.refresh();
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="industrial-zh mb-4 text-sm text-zinc-400">
        大屏标签（{tags.length}）· 启用 {tags.filter((t) => t.active).length}
      </h2>

      {/* 添加行 */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 20))}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="输入标签名，如：乐观开朗"
          className={`${inputCls} flex-1`}
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
          disabled={saving || !name.trim()}
          className="rounded-xl bg-[#5d7a8a] px-5 py-2 text-sm text-white transition hover:bg-[#4a6470] disabled:opacity-50"
        >
          {saving ? "添加中…" : "添加"}
        </button>
      </div>
      {error ? <p className="mb-3 text-xs text-red-500">{error}</p> : null}

      {/* 列表 */}
      {tags.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">还没有标签，添加一个试试</p>
      ) : (
        <ul className="divide-y divide-white/10">
          {tags.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0 flex-1">
                {editingId === t.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value.slice(0, 20))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(t.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      className={`${inputCls} w-40`}
                    />
                    <input
                      type="number"
                      value={editOrder}
                      onChange={(e) => setEditOrder(e.target.value)}
                      className={`${inputCls} w-20`}
                      aria-label="排序"
                    />
                    <button
                      onClick={() => saveEdit(t.id)}
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
                  <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-zinc-700 dark:text-white/85">
                    {t.name}
                  </span>
                )}
              </div>
              {editingId !== t.id && (
                <div className="flex shrink-0 items-center gap-3 text-sm">
                  <span className="text-xs text-zinc-400">#{t.order}</span>
                  <button
                    onClick={() => toggle(t.id, !t.active)}
                    className={
                      t.active
                        ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-600 hover:bg-emerald-500/25"
                        : "rounded-full bg-zinc-400/15 px-2 py-0.5 text-xs text-zinc-500 hover:bg-zinc-400/25"
                    }
                  >
                    {t.active ? "启用中" : "已停用"}
                  </button>
                  <button onClick={() => startEdit(t)} className="text-[#5d7a8a] hover:underline">
                    编辑
                  </button>
                  <button onClick={() => del(t.id)} className="text-red-500 hover:underline">
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

function sortTags(arr: ShowcaseTag[]) {
  return [...arr].sort((a, b) => a.order - b.order || a.id - b.id);
}

/* ─────────────── 社交链接 ─────────────── */

function LinkSection({ initial }: { initial: SocialLink[] }) {
  const router = useRouter();
  const [links, setLinks] = useState<SocialLink[]>(initial);
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [icon, setIcon] = useState("link");
  const [order, setOrder] = useState("0");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [edit, setEdit] = useState<SocialLink | null>(null);

  async function add() {
    if (!label.trim() || !href.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/social-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, href, icon, order: Number(order) || 0, active }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "添加失败");
      return;
    }
    setLabel("");
    setHref("");
    setIcon("link");
    setLinks((prev) => sortLinks([...prev, data]));
    router.refresh();
  }

  async function toggle(id: number, next: boolean) {
    const res = await fetch(`/api/social-links/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    if (res.ok) {
      setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, active: next } : l)));
      router.refresh();
    }
  }

  function startEdit(l: SocialLink) {
    setEditingId(l.id);
    setEdit({ ...l });
  }

  async function saveEdit(id: number) {
    if (!edit || !edit.label.trim() || !edit.href.trim()) return;
    const res = await fetch(`/api/social-links/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: edit.label,
        href: edit.href,
        icon: edit.icon,
        order: edit.order,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setLinks((prev) => sortLinks(prev.map((l) => (l.id === id ? data : l))));
      setEditingId(null);
      setEdit(null);
      router.refresh();
    }
  }

  async function del(id: number) {
    if (!window.confirm("确定删除这个链接吗？")) return;
    await fetch(`/api/social-links/${id}`, { method: "DELETE" });
    setLinks((prev) => prev.filter((l) => l.id !== id));
    router.refresh();
  }

  function IconChips({ value, onChange }: { value: string; onChange: (k: string) => void }) {
    return (
      <div className="flex items-center gap-1.5">
        {SOCIAL_ICON_KEYS.map((k) => {
          const Icon = SOCIAL_ICONS[k];
          const selected = value === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => onChange(k)}
              aria-label={k}
              title={k}
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                selected
                  ? "border-[#5d7a8a] bg-[#5d7a8a]/20 text-[#5d7a8a]"
                  : "border-white/20 text-zinc-400 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="industrial-zh mb-4 text-sm text-zinc-400">
        社交链接（{links.length}）· 启用 {links.filter((l) => l.active).length}
      </h2>

      {/* 添加行 */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value.slice(0, 30))}
          placeholder="名称，如：GitHub"
          className={`${inputCls} w-full sm:w-40`}
        />
        <input
          value={href}
          onChange={(e) => setHref(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="https:// 或 mailto: 开头"
          className={`${inputCls} min-w-0 flex-1`}
        />
        <IconChips value={icon} onChange={setIcon} />
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
          disabled={saving || !label.trim() || !href.trim()}
          className="rounded-xl bg-[#5d7a8a] px-5 py-2 text-sm text-white transition hover:bg-[#4a6470] disabled:opacity-50"
        >
          {saving ? "添加中…" : "添加"}
        </button>
      </div>
      {error ? <p className="mb-3 text-xs text-red-500">{error}</p> : null}

      {/* 列表 */}
      {links.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">还没有链接，添加一个试试</p>
      ) : (
        <ul className="divide-y divide-white/10">
          {links.map((l) => {
            const Icon = SOCIAL_ICONS[l.icon] ?? SOCIAL_ICONS.link;
            return (
              <li key={l.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-zinc-600 dark:text-white/85">
                    <Icon className="h-4 w-4" />
                  </span>
                  {editingId === l.id && edit ? (
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                      <input
                        value={edit.label}
                        onChange={(e) => setEdit({ ...edit, label: e.target.value.slice(0, 30) })}
                        className={`${inputCls} w-36`}
                        aria-label="名称"
                      />
                      <input
                        value={edit.href}
                        onChange={(e) => setEdit({ ...edit, href: e.target.value })}
                        className={`${inputCls} min-w-0 flex-1 sm:w-64`}
                        aria-label="链接"
                      />
                      <IconChips value={edit.icon} onChange={(k) => setEdit({ ...edit, icon: k })} />
                      <input
                        type="number"
                        value={edit.order}
                        onChange={(e) => setEdit({ ...edit, order: Number(e.target.value) || 0 })}
                        className={`${inputCls} w-20`}
                        aria-label="排序"
                      />
                      <button
                        onClick={() => saveEdit(l.id)}
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
                      <p className="truncate text-sm font-medium text-zinc-700 dark:text-white/90">{l.label}</p>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        className="block max-w-[24rem] truncate text-xs text-zinc-400 hover:text-[#5d7a8a] hover:underline"
                      >
                        {l.href}
                      </a>
                    </div>
                  )}
                </div>
                {editingId !== l.id && (
                  <div className="flex shrink-0 items-center gap-3 text-sm">
                    <span className="text-xs text-zinc-400">#{l.order}</span>
                    <button
                      onClick={() => toggle(l.id, !l.active)}
                      className={
                        l.active
                          ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-600 hover:bg-emerald-500/25"
                          : "rounded-full bg-zinc-400/15 px-2 py-0.5 text-xs text-zinc-500 hover:bg-zinc-400/25"
                      }
                    >
                      {l.active ? "启用中" : "已停用"}
                    </button>
                    <button onClick={() => startEdit(l)} className="text-[#5d7a8a] hover:underline">
                      编辑
                    </button>
                    <button onClick={() => del(l.id)} className="text-red-500 hover:underline">
                      删除
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function sortLinks(arr: SocialLink[]) {
  return [...arr].sort((a, b) => a.order - b.order || a.id - b.id);
}
