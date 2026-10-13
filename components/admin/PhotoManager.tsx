"use client";

import { useEffect, useRef, useState } from "react";
import { photoUrl } from "@/lib/photo-url";
import { ChevronDownIcon, PlusIcon } from "@/components/Icons";

type AlbumDTO = { id: number; name: string };
type PhotoDTO = {
  id: number;
  title: string | null;
  fileName: string;
  albumId: number | null;
};

type Filter = "all" | "unassigned" | number;

const inputClass =
  "rounded-xl border border-white/20 bg-white/60 px-3 py-2 text-sm outline-none " +
  "focus:border-[#5d7a8a] focus:ring-1 focus:ring-[#5d7a8a]/30 " +
  "dark:border-white/10 dark:bg-white/5";

function PencilIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function CheckIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** 相册选择自定义下拉：value=null 表示未分组；dropup 时菜单向上弹（照片卡上用） */
function AlbumPicker({
  value,
  albums,
  onPick,
  allowUnassigned = true,
  kind = "default",
}: {
  value: number | null;
  albums: AlbumDTO[];
  onPick: (id: number | null) => void;
  allowUnassigned?: boolean;
  kind?: "default" | "chip" | "onPhoto";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = value === null ? null : albums.find((a) => a.id === value);
  const label = current ? current.name : "未分组";

  const btnClass =
    kind === "onPhoto"
      ? "flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm transition hover:bg-black/65"
      : kind === "chip"
        ? "flex items-center gap-1 rounded-full border border-black/10 px-3 py-1.5 text-sm dark:border-white/15"
        : "flex items-center gap-1.5 rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5";

  const options: Array<{ id: number | null; name: string }> = [
    ...(allowUnassigned ? [{ id: null, name: "未分组" }] : []),
    ...albums.map((a) => ({ id: a.id, name: a.name })),
  ];

  return (
    <div ref={ref} data-state={open ? "open" : "closed"} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} className={btnClass}>
        <span className="max-w-[10rem] truncate">{label}</span>
        <ChevronDownIcon className="h-3 w-3 opacity-60" />
      </button>
      {open && (
        <div
          className={`absolute z-40 min-w-[9rem] overflow-hidden rounded-xl border bg-white/95 py-1 text-sm shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/95 ${
            kind === "onPhoto" ? "bottom-full right-0 mb-2" : "left-0 top-full mt-1.5"
          }`}
        >
          {options.map((o) => (
            <button
              key={o.id ?? "unassigned"}
              type="button"
              onClick={() => {
                onPick(o.id);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left transition hover:bg-[#5d7a8a]/15 ${
                o.id === value ? "text-[#5d7a8a]" : ""
              }`}
            >
              <span className="truncate">{o.name}</span>
              {o.id === value && <CheckIcon />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PhotoManager({
  initialAlbums,
  initialPhotos,
}: {
  initialAlbums: AlbumDTO[];
  initialPhotos: PhotoDTO[];
}) {
  const [albums, setAlbums] = useState(initialAlbums);
  const [photos, setPhotos] = useState(initialPhotos);
  const [filter, setFilter] = useState<Filter>("all");
  const [uploadTarget, setUploadTarget] = useState<number | null>(initialAlbums[0]?.id ?? null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [renaming, setRenaming] = useState<{ id: number; value: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const countOf = (f: Filter) =>
    f === "all" ? photos.length : f === "unassigned" ? photos.filter((p) => p.albumId === null).length : photos.filter((p) => p.albumId === f).length;

  async function createAlbum() {
    const name = newName.trim();
    if (!name) {
      setCreating(false);
      setNewName("");
      return;
    }
    const res = await fetch("/api/albums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (res.ok) {
      setAlbums((list) => [...list, { id: data.id, name: data.name }]);
      setUploadTarget(data.id);
      setFilter(data.id);
    } else {
      setError(data.error || "新建失败");
    }
    setCreating(false);
    setNewName("");
  }

  async function renameAlbum(id: number) {
    if (!renaming) return;
    const name = renaming.value.trim();
    if (!name) {
      setRenaming(null);
      return;
    }
    const res = await fetch(`/api/albums/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (res.ok) {
      setAlbums((list) => list.map((a) => (a.id === id ? { ...a, name: data.name } : a)));
    } else {
      setError(data.error || "重命名失败");
    }
    setRenaming(null);
  }

  async function deleteAlbum(id: number, name: string) {
    if (!window.confirm(`删除相册「${name}」？册内照片会移到「未分组」，不会被删除。`)) return;
    const res = await fetch(`/api/albums/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAlbums((list) => list.filter((a) => a.id !== id));
      setPhotos((list) => list.map((p) => (p.albumId === id ? { ...p, albumId: null } : p)));
      if (filter === id) setFilter("all");
      if (uploadTarget === id) setUploadTarget(null);
    }
  }

  async function upload(files: FileList) {
    setError("");
    setUploading(true);
    setProgress({ done: 0, total: files.length });
    let failed = 0;
    for (let i = 0; i < files.length; i++) {
      const form = new FormData();
      form.append("file", files[i]);
      if (uploadTarget !== null) form.append("albumId", String(uploadTarget));
      const res = await fetch("/api/photos", { method: "POST", body: form });
      if (res.ok) {
        const p = await res.json();
        setPhotos((list) => [
          { id: p.id, title: p.title, fileName: p.fileName, albumId: p.albumId },
          ...list,
        ]);
      } else {
        failed++;
      }
      setProgress({ done: i + 1, total: files.length });
    }
    setUploading(false);
    if (failed > 0) setError(`${failed} 张上传失败`);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function movePhoto(id: number, albumId: number | null) {
    const res = await fetch("/api/photos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, albumId }),
    });
    if (res.ok) {
      setPhotos((list) => list.map((p) => (p.id === id ? { ...p, albumId } : p)));
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "移动失败");
    }
  }

  async function deletePhoto(id: number) {
    if (!window.confirm("确定删除这张照片吗？")) return;
    const res = await fetch("/api/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setPhotos((list) => list.filter((p) => p.id !== id));
  }

  const shown = photos.filter((p) =>
    filter === "all" ? true : filter === "unassigned" ? p.albumId === null : p.albumId === filter,
  );

  const chipBase =
    "rounded-full px-3 py-1.5 text-sm transition";
  const chipActive = "bg-[#5d7a8a] text-white";
  const chipIdle = "border border-black/10 hover:bg-[#5d7a8a]/10 dark:border-white/15";

  return (
    <div className="space-y-6">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {/* 相册筛选与管理 */}
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`${chipBase} ${filter === "all" ? chipActive : chipIdle}`}
          >
            全部 {countOf("all")}
          </button>
          <button
            type="button"
            onClick={() => setFilter("unassigned")}
            className={`${chipBase} ${filter === "unassigned" ? chipActive : chipIdle}`}
          >
            未分组 {countOf("unassigned")}
          </button>

          {albums.map((a) =>
            renaming?.id === a.id ? (
              <input
                key={a.id}
                autoFocus
                value={renaming.value}
                onChange={(e) => setRenaming({ id: a.id, value: e.target.value })}
                onBlur={() => renameAlbum(a.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") renameAlbum(a.id);
                  if (e.key === "Escape") setRenaming(null);
                }}
                className={`${inputClass} !px-3 !py-1 text-sm`}
                style={{ width: `${Math.max(8, a.name.length + 2)}rem` }}
              />
            ) : (
              <div
                key={a.id}
                className={`group flex items-center gap-1 rounded-full pl-3 pr-1.5 text-sm ${
                  filter === a.id ? "bg-[#5d7a8a] text-white" : "border border-black/10 dark:border-white/15"
                }`}
              >
                <button type="button" onClick={() => setFilter(a.id)} className="py-1.5">
                  {a.name} {countOf(a.id)}
                </button>
                <span className={`flex items-center ${filter === a.id ? "" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
                  <button
                    type="button"
                    aria-label={`重命名相册 ${a.name}`}
                    onClick={() => setRenaming({ id: a.id, value: a.name })}
                    className={`rounded-full p-1 transition hover:bg-black/10 ${filter === a.id ? "text-white/80" : "text-zinc-400"}`}
                  >
                    <PencilIcon />
                  </button>
                  <button
                    type="button"
                    aria-label={`删除相册 ${a.name}`}
                    onClick={() => deleteAlbum(a.id, a.name)}
                    className={`rounded-full p-1 transition hover:bg-red-500 hover:text-white ${filter === a.id ? "text-white/80" : "text-zinc-400"}`}
                  >
                    <TrashIcon />
                  </button>
                </span>
              </div>
            ),
          )}

          {creating ? (
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={createAlbum}
              onKeyDown={(e) => {
                if (e.key === "Enter") createAlbum();
                if (e.key === "Escape") {
                  setCreating(false);
                  setNewName("");
                }
              }}
              placeholder="相册名"
              className={`${inputClass} !px-3 !py-1 text-sm`}
              style={{ width: "9rem" }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex items-center gap-1 rounded-full border border-dashed border-[#5d7a8a]/50 px-3 py-1.5 text-sm text-[#5d7a8a] transition hover:bg-[#5d7a8a]/10"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              新建相册
            </button>
          )}
        </div>
      </div>

      {/* 上传区：选择目标相册后逐张上传 */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            hidden
            onChange={(e) => e.target.files?.length && upload(e.target.files)}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-xl bg-[#5d7a8a] px-5 py-2 text-sm text-white transition hover:bg-[#4a6470] disabled:opacity-50"
          >
            {uploading ? `上传中 ${progress.done}/${progress.total}…` : "上传照片"}
          </button>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span>上传到</span>
            <AlbumPicker kind="chip" value={uploadTarget} albums={albums} onPick={setUploadTarget} />
          </div>
        </div>
        <p className="mt-2 text-xs text-zinc-500">支持 jpg / png / webp / gif，单张不超过 10MB</p>
      </div>

      {/* 照片网格 */}
      {shown.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-sm text-zinc-500">
          {photos.length === 0 ? "还没有照片，上传几张吧～" : "该分组下还没有照片"}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((p) => (
            <div key={p.id} className="group relative overflow-hidden rounded-2xl">
              <img
                src={photoUrl(p.fileName)}
                alt={p.title || "照片"}
                className="h-40 w-full object-cover object-[50%_25%] transition duration-300 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => deletePhoto(p.id)}
                aria-label="删除照片"
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-500"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
              {p.title && (
                <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-6 text-xs text-white">
                  <span className="block truncate pr-20">{p.title}</span>
                </p>
              )}
              <div className="absolute bottom-2 right-2 opacity-0 transition group-hover:opacity-100 has-[[data-state=open]]:opacity-100">
                <AlbumPicker
                  kind="onPhoto"
                  value={p.albumId}
                  albums={albums}
                  onPick={(id) => movePhoto(p.id, id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
