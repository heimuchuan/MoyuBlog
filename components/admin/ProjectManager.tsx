"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import { photoUrl } from "@/lib/photo-url";

type Project = {
  id: number;
  slug: string;
  title: string;
  description: string;
  cover: string | null;
  date: string;
  tags: string[];
  categoryId: number;
  url: string;
  span: string;
  order: number;
  active: boolean;
};

type Category = {
  id: number;
  key: string;
  name: string;
  order: number;
  active: boolean;
};

const inputCls =
  "rounded-xl border border-white/20 bg-white/60 px-3 py-2 text-sm outline-none focus:border-[#5d7a8a] focus:ring-1 focus:ring-[#5d7a8a]/30 dark:border-white/10 dark:bg-white/5";

export default function ProjectManager({
  initialProjects,
  initialCategories,
}: {
  initialProjects: Project[];
  initialCategories: Category[];
}) {
  return (
    <div className="space-y-6">
      <ProjectSection initial={initialProjects} categories={initialCategories} />
      <CategorySection initial={initialCategories} />
    </div>
  );
}

/* ─────────────── 项目管理 ─────────────── */

function ProjectSection({
  initial,
  categories,
}: {
  initial: Project[];
  categories: Category[];
}) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(form: HTMLFormElement) {
    const fd = new FormData(form);
    setSaving(true);
    setError("");
    const url = editingId ? `/api/projects/${editingId}` : "/api/projects";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, { method, body: fd });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "保存失败");
      return;
    }
    if (editingId) {
      setProjects((prev) => sortProjects(prev.map((p) => (p.id === editingId ? data : p))));
    } else {
      setProjects((prev) => sortProjects([...prev, data]));
    }
    setShowForm(false);
    setEditingId(null);
    form.reset();
    router.refresh();
  }

  async function toggle(id: number, next: boolean) {
    const res = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      body: (() => {
        const fd = new FormData();
        fd.append("active", String(next));
        return fd;
      })(),
    });
    if (res.ok) {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, active: next } : p)));
      router.refresh();
    }
  }

  async function del(id: number) {
    if (!window.confirm("确定删除这个项目吗？封面图也会被删除。")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
    router.refresh();
  }

  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="industrial-zh text-sm text-zinc-400">
          项目（{projects.length}）· 启用 {projects.filter((p) => p.active).length}
        </h2>
        <button
          onClick={() => {
            setShowForm((v) => !v);
            setEditingId(null);
          }}
          className="rounded-xl bg-[#5d7a8a] px-4 py-2 text-sm text-white transition hover:bg-[#4a6470]"
        >
          {showForm ? "收起" : "新增项目"}
        </button>
      </div>

      {(showForm || editingId !== null) && (
        <ProjectForm
          key={editingId ?? "new"}
          categories={categories}
          editing={editingId ? projects.find((p) => p.id === editingId) ?? null : null}
          saving={saving}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingId(null);
          }}
        />
      )}

      {projects.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">还没有项目，添加一个试试</p>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li
              key={p.id}
              className="flex items-start gap-4 rounded-xl border border-white/10 p-4 dark:border-white/5"
            >
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                {p.cover ? (
                  <img
                    src={p.cover.startsWith("http") ? p.cover : p.cover.startsWith("/") ? p.cover : `/uploads/projects/${p.cover}`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-black text-[#5d7a8a]/30">
                    {p.title.slice(0, 1)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{p.title}</span>
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-zinc-500">
                    {catMap.get(p.categoryId) ?? "?"}
                  </span>
                  {p.span === "lg" && (
                    <span className="rounded bg-purple-500/15 px-1.5 py-0.5 text-xs text-purple-500">大格</span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{p.description}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {p.tags.map((t) => (
                    <span key={t} className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  {p.date} · <a href={p.url} target="_blank" rel="noreferrer" className="text-[#5d7a8a] hover:underline">查看项目</a>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <button
                  onClick={() => toggle(p.id, !p.active)}
                  className={
                    p.active
                      ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-600 hover:bg-emerald-500/25"
                      : "rounded-full bg-zinc-400/15 px-2 py-0.5 text-xs text-zinc-500 hover:bg-zinc-400/25"
                  }
                >
                  {p.active ? "启用中" : "已停用"}
                </button>
                <div className="flex gap-3 text-sm">
                  <button
                    onClick={() => {
                      setEditingId(p.id);
                      setShowForm(true);
                    }}
                    className="text-[#5d7a8a] hover:underline"
                  >
                    编辑
                  </button>
                  <button onClick={() => del(p.id)} className="text-red-500 hover:underline">
                    删除
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProjectForm({
  categories,
  editing,
  saving,
  error,
  onSubmit,
  onCancel,
}: {
  categories: Category[];
  editing: Project | null;
  saving: boolean;
  error: string;
  onSubmit: (form: HTMLFormElement) => void;
  onCancel: () => void;
}) {
  // 封面地址受控：文件上传、手填 URL、从照片库选择三种方式都写入这里
  const [coverUrl, setCoverUrl] = useState(editing?.cover ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e.currentTarget);
      }}
      className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-white/10 p-4 sm:grid-cols-2"
    >
      <div>
        <label className="mb-1 block text-xs text-zinc-500">标题 *</label>
        <input name="title" defaultValue={editing?.title} required className={`${inputCls} w-full`} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-500">标识 slug *</label>
        <input name="slug" defaultValue={editing?.slug} required className={`${inputCls} w-full`} />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-zinc-500">描述</label>
        <textarea name="description" defaultValue={editing?.description} rows={2} className={`${inputCls} w-full`} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-500">日期</label>
        <input name="date" defaultValue={editing?.date} placeholder="如 2024.05" className={`${inputCls} w-full`} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-500">项目地址 *</label>
        <input name="url" defaultValue={editing?.url} required className={`${inputCls} w-full`} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-500">分类</label>
        <select name="categoryId" defaultValue={editing?.categoryId ?? categories[0]?.id} className={`${inputCls} w-full`}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-500">卡片大小</label>
        <select name="span" defaultValue={editing?.span ?? "sm"} className={`${inputCls} w-full`}>
          <option value="sm">小格（默认）</option>
          <option value="lg">大格（2×2）</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-500">标签（JSON 数组，如 ["Next.js","React"]）</label>
        <input name="tags" defaultValue={editing ? JSON.stringify(editing.tags) : "[]"} className={`${inputCls} w-full`} />
      </div>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-zinc-500">排序</label>
          <input type="number" name="order" defaultValue={editing?.order ?? 0} className={`${inputCls} w-full`} />
        </div>
        <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm text-zinc-500">
          <input type="checkbox" name="active" defaultChecked={editing ? editing.active : true} className="h-4 w-4 accent-[#5d7a8a]" />
          启用
        </label>
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-zinc-500">封面图（上传 / 填 URL / 从照片库选择，三选一）</label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input type="file" name="cover" accept="image/*" className="text-sm" />
          <span className="text-zinc-400">或</span>
          <input
            name="coverUrl"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://..."
            className={`${inputCls} flex-1`}
          />
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[#5d7a8a]/40 px-3 py-2 text-sm text-[#5d7a8a] transition hover:bg-[#5d7a8a]/10"
          >
            <ImagePlus className="h-4 w-4" strokeWidth={1.8} />
            从照片库选择
          </button>
        </div>
        {coverUrl && (
          <div className="mt-2 flex items-center gap-2">
            <img src={resolveCover(coverUrl)} alt="" className="h-12 w-16 rounded-lg object-cover" />
            <span className="text-xs text-zinc-400">封面预览</span>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={saving} className="rounded-xl bg-[#5d7a8a] px-5 py-2 text-sm text-white hover:bg-[#4a6470] disabled:opacity-50">
          {saving ? "保存中…" : editing ? "保存修改" : "添加"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl px-5 py-2 text-sm text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10">
          取消
        </button>
      </div>
      {pickerOpen && (
        <PhotoPicker
          onPick={(fileName) => {
            setCoverUrl(photoUrl(fileName));
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </form>
  );
}

/* ─────────────── 分类管理 ─────────────── */

function CategorySection({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [cats, setCats] = useState<Category[]>(initial);
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [order, setOrder] = useState("0");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  async function add() {
    if (!key.trim() || !name.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/project-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: key.trim(), name: name.trim(), order: Number(order) || 0, active }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "添加失败");
      return;
    }
    setKey("");
    setName("");
    setCats((prev) => sortCats([...prev, data]));
    router.refresh();
  }

  async function saveEdit(id: number) {
    if (!editName.trim()) return;
    const res = await fetch(`/api/project-categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setCats((prev) => sortCats(prev.map((c) => (c.id === id ? data : c))));
      setEditingId(null);
      router.refresh();
    }
  }

  async function del(id: number) {
    if (!window.confirm("确定删除这个分类吗？")) return;
    const res = await fetch(`/api/project-categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCats((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "删除失败");
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="industrial-zh mb-4 text-sm text-zinc-400">项目分类（{cats.length}）</h2>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={key}
          onChange={(e) => setKey(e.target.value.slice(0, 20))}
          placeholder="标识，如 web"
          className={`${inputCls} w-32`}
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 20))}
          placeholder="名称，如 Web"
          className={`${inputCls} flex-1`}
        />
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className={`${inputCls} w-20`}
          aria-label="排序"
        />
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-500">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-[#5d7a8a]" />
          启用
        </label>
        <button onClick={add} disabled={saving || !key.trim() || !name.trim()} className="rounded-xl bg-[#5d7a8a] px-5 py-2 text-sm text-white hover:bg-[#4a6470] disabled:opacity-50">
          {saving ? "添加中…" : "添加"}
        </button>
      </div>
      {error && <p className="mb-3 text-xs text-red-500">{error}</p>}
      <ul className="divide-y divide-white/10">
        {cats.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0 flex-1">
              {editingId === c.id ? (
                <div className="flex items-center gap-2">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus className={`${inputCls} w-40`} />
                  <button onClick={() => saveEdit(c.id)} className="rounded-lg bg-[#5d7a8a] px-3 py-1.5 text-xs text-white">保存</button>
                  <button onClick={() => setEditingId(null)} className="rounded-lg px-3 py-1.5 text-xs text-zinc-500">取消</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <code className="rounded bg-white/10 px-2 py-0.5 text-xs">{c.key}</code>
                  <span className="font-medium">{c.name}</span>
                </div>
              )}
            </div>
            {editingId !== c.id && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-xs text-zinc-400">#{c.order}</span>
                <button onClick={() => { setEditingId(c.id); setEditName(c.name); }} className="text-[#5d7a8a] hover:underline">编辑</button>
                <button onClick={() => del(c.id)} className="text-red-500 hover:underline">删除</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function sortProjects(arr: Project[]) {
  return [...arr].sort((a, b) => a.order - b.order || a.id - b.id);
}
function sortCats(arr: Category[]) {
  return [...arr].sort((a, b) => a.order - b.order || a.id - b.id);
}

// 封面地址解析：Blob/外部 URL、以 / 开头（照片库本地路径、public 资源）直接用；裸文件名按项目本地上传目录拼接
function resolveCover(ref: string) {
  if (ref.startsWith("http") || ref.startsWith("/")) return ref;
  return `/uploads/projects/${ref}`;
}

/* ─────────────── 照片库选择弹窗 ─────────────── */

function PhotoPicker({
  onPick,
  onClose,
}: {
  onPick: (fileName: string) => void;
  onClose: () => void;
}) {
  const [photos, setPhotos] = useState<{ id: number; fileName: string; title: string | null }[] | null>(null);

  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then((d) => setPhotos(Array.isArray(d) ? d : []))
      .catch(() => setPhotos([]));
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="glass flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">选择照片作为封面</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 transition hover:bg-black/5 dark:hover:bg-white/10"
          >
            关闭
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {photos === null ? (
            <p className="py-10 text-center text-sm text-zinc-400">加载中…</p>
          ) : photos.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-400">照片库还是空的，先去「照片」页上传几张</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {photos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPick(p.fileName)}
                  title={p.title ?? undefined}
                  className="group aspect-square overflow-hidden rounded-lg border border-white/10 transition hover:border-[#5d7a8a]"
                >
                  <img
                    src={photoUrl(p.fileName)}
                    alt={p.title ?? ""}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
