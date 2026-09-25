"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlobeIcon, LockIcon } from "@/components/Icons";

/** 说说发布框：公开/私密切换 + 文本域 + 字数统计，发布成功后刷新服务端列表 */
export default function TalkComposer() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const MAX = 500;

  async function publish() {
    const text = content.trim();
    if (!text) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/talks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, visibility }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "发布失败");
      return;
    }
    setContent("");
    router.refresh();
  }

  return (
    <div className="glass rounded-2xl p-5">
      {/* 公开 / 私密 胶囊切换 */}
      <div className="mb-3 inline-flex rounded-xl border border-white/20 bg-white/40 p-1 text-sm dark:border-white/10 dark:bg-white/5">
        {(
          [
            { key: "public", label: "公开", Icon: GlobeIcon },
            { key: "private", label: "私密", Icon: LockIcon },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setVisibility(opt.key)}
            className={
              visibility === opt.key
                ? "flex items-center gap-1.5 rounded-lg bg-[#5d7a8a] px-4 py-1 text-white transition"
                : "flex items-center gap-1.5 rounded-lg px-4 py-1 text-zinc-500 transition hover:text-[#5d7a8a]"
            }
          >
            <opt.Icon className="h-3.5 w-3.5" />
            {opt.label}
          </button>
        ))}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, MAX))}
        rows={3}
        placeholder={visibility === "private" ? "记一条仅自己可见的心情…" : "此刻在想什么？"}
        className="w-full resize-none rounded-xl border border-white/20 bg-white/60 px-3 py-2 text-sm outline-none focus:border-[#5d7a8a] focus:ring-1 focus:ring-[#5d7a8a]/30 dark:border-white/10 dark:bg-white/5"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-zinc-400">
          {error ? <span className="text-red-500">{error}</span> : `${content.length}/${MAX}`}
        </span>
        <button
          type="button"
          onClick={publish}
          disabled={saving || !content.trim()}
          className="rounded-xl bg-[#5d7a8a] px-5 py-1.5 text-sm text-white transition hover:bg-[#4a6470] disabled:opacity-50"
        >
          {saving ? "发布中…" : visibility === "private" ? "私密保存" : "发布"}
        </button>
      </div>
    </div>
  );
}
