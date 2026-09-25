"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: number; name: string };
type Post = {
  id?: number;
  title: string;
  content: string;
  excerpt: string;
  published: boolean;
  categoryId: number | null;
  tags: string[];
};

/** 纯文本转 Markdown：空行分段保留，段内单换行转为硬换行（两空格+换行） */
function plainTextToMarkdown(text: string): string {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";
  return normalized
    .split(/\n{2,}/) // 按空行分段
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => block.replace(/\n/g, "  \n")) // 段内换行 → 硬换行
    .join("\n\n");
}

const inputClass =
  "w-full rounded-xl border border-white/20 bg-white/60 px-3 py-2 outline-none focus:border-[#5d7a8a] focus:ring-1 focus:ring-[#5d7a8a]/30 dark:border-white/10 dark:bg-white/5";

export default function PostForm({
  categories,
  post,
}: {
  categories: Category[];
  post?: Post;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [published, setPublished] = useState(post?.published ?? false);
  const [categoryId, setCategoryId] = useState<number | "">(post?.categoryId ?? "");
  const [tagList, setTagList] = useState<string[]>(post?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  const selectedCat = categories.find((c) => c.id === categoryId);

  // 下拉展开时：点击外部或按 Esc 关闭
  useEffect(() => {
    if (!catOpen) return;
    function onDown(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setCatOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [catOpen]);

  /** 回车创建标签：去掉前导 #，去重后加入列表 */
  function addTag() {
    const name = tagInput.replace(/^#+/, "").trim();
    if (!name) return;
    if (!tagList.includes(name)) setTagList([...tagList, name]);
    setTagInput("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("标题和内容不能为空");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      title: title.trim(),
      content: plainTextToMarkdown(content), // 发布时自动转为 Markdown
      excerpt: post?.excerpt || "", // 表单不再填写摘要，编辑时保留原值
      published,
      categoryId: categoryId === "" ? null : categoryId,
      tags: tagList,
    };
    const url = post?.id ? `/api/posts/${post.id}` : "/api/posts";
    const method = post?.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "保存失败");
      return;
    }
    router.push("/admin/posts");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div>
        <label className="mb-1 block text-sm font-medium">标题</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">分类</label>
        <div className="relative" ref={catRef}>
          <button
            type="button"
            onClick={() => setCatOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={catOpen}
            className={`${inputClass} flex items-center justify-between text-left`}
          >
            <span className={selectedCat ? "" : "text-zinc-500"}>{selectedCat?.name || "无分类"}</span>
            <svg
              className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {catOpen && (
            <ul
              role="listbox"
              className="cat-menu absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-black/10 bg-white/95 p-1 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/95"
            >
              {[{ id: 0, name: "无分类" }, ...categories].map((c) => {
                const active = c.id === 0 ? categoryId === "" : categoryId === c.id;
                return (
                  <li key={c.id || "none"}>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryId(c.id === 0 ? "" : c.id);
                        setCatOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-[#5d7a8a]/15 ${
                        active ? "font-medium text-[#5d7a8a]" : ""
                      }`}
                    >
                      {c.name}
                      {active && (
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.79 6.8-6.8a1 1 0 011.4 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">为文章创建标签</label>
        <div className={`${inputClass} flex flex-wrap items-center gap-1.5`}>
          {tagList.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1 rounded-full border border-[#5d7a8a]/40 bg-[#5d7a8a]/10 py-0.5 pl-2.5 pr-1 text-xs text-[#5d7a8a]"
            >
              {t}
              <button
                type="button"
                onClick={() => setTagList(tagList.filter((x) => x !== t))}
                aria-label={`删除标签 ${t}`}
                className="rounded-full p-0.5 transition hover:bg-[#5d7a8a]/20"
              >
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // 防止触发表单提交
                addTag();
              } else if (e.key === "Backspace" && !tagInput) {
                setTagList((list) => list.slice(0, -1)); // 空输入时退格删除最后一个标签
              }
            }}
            className="min-w-[8rem] flex-1 bg-transparent py-0.5 outline-none"
          />
        </div>
        <p className="mt-1 text-xs text-zinc-500">输入 # 加标签名，按回车创建</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">正文</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          className={`${inputClass} resize-y font-mono text-sm`}
        />
        <p className="mt-1 text-xs text-zinc-500">发布时自动转换为 Markdown 格式</p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        立即发布
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[#5d7a8a] px-5 py-2 text-sm text-white transition hover:bg-[#4a6470] disabled:opacity-50"
        >
          {saving ? "保存中…" : "保存"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/posts")}
          className="rounded-xl border border-black/10 px-5 py-2 text-sm dark:border-white/10"
        >
          取消
        </button>
      </div>
    </form>
  );
}
