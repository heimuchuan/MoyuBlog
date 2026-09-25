"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function KnowledgeUploadForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setMsg("请选择文件");
      return;
    }
    setUploading(true);
    setMsg("");
    const fd = new FormData();
    fd.append("file", file);
    if (title.trim()) fd.append("title", title.trim());
    const res = await fetch("/api/knowledge/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setMsg(data.error || "上传失败");
      return;
    }
    setMsg(`上传成功，共 ${data.chunkCount} 个切片`);
    setFile(null);
    setTitle("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium">文档标题（可选，默认用文件名）</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-white/20 bg-white/60 px-3 py-2 text-sm outline-none focus:border-[#5d7a8a] dark:border-white/10 dark:bg-white/5"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">文件（支持 PDF / DOCX / TXT）</label>
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 dark:text-zinc-300 dark:file:bg-zinc-800"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={uploading}
          className="rounded-xl bg-[#5d7a8a] px-5 py-2 text-sm text-white transition hover:bg-[#4a6470] disabled:opacity-50"
        >
          {uploading ? "上传并向量化中…" : "上传"}
        </button>
        {msg && <span className="text-sm text-zinc-500">{msg}</span>}
      </div>
    </form>
  );
}