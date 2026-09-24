"use client";

import { useState } from "react";
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
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [published, setPublished] = useState(post?.published ?? false);
  const [categoryId, setCategoryId] = useState<number | "">(post?.categoryId ?? "");
  const [tags, setTags] = useState((post?.tags || []).join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("标题和内容不能为空");
      return;
    }
    setSaving(true);
    setError("");
    const tagArray = tags
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      title: title.trim(),
      content,
      excerpt: excerpt.trim(),
      published,
      categoryId: categoryId === "" ? null : categoryId,
      tags: tagArray,
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
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-zinc-900"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">摘要（可选）</label>
        <input
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-zinc-900"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">分类</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-zinc-900"
          >
            <option value="">无分类</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">标签（逗号分隔）</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="如：新生入学, 选课"
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-zinc-900"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">正文（Markdown）</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          className="w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-zinc-900"
        />
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
          className="rounded-xl bg-indigo-500 px-5 py-2 text-sm text-white transition hover:bg-indigo-600 disabled:opacity-50"
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