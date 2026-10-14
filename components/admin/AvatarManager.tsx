"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { avatarUrl } from "@/lib/photo-url";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function AvatarManager({ initialRef }: { initialRef: string | null }) {
  const router = useRouter();
  const [url, setUrl] = useState<string>(() => avatarUrl(initialRef));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError("");
    if (!ACCEPT_TYPES.includes(file.type)) {
      setError("仅支持 jpg / png / webp / gif");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("图片不能超过 10MB");
      return;
    }
    setBusy(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/site-config/avatar", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "上传失败");
      return;
    }
    setUrl(data.url);
    // 立即清空 input，同一张图也能再次选择
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  async function resetDefault() {
    if (!window.confirm("恢复为默认头像？当前上传的头像文件将被删除。")) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/site-config/avatar", { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "操作失败");
      return;
    }
    setUrl(data.url || "/avatar.jpg");
    router.refresh();
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="industrial-zh mb-4 text-sm text-zinc-400">头像</h2>

      <div className="flex items-center gap-6">
        {/* 预览：与前台介绍卡同款渐变圆环 */}
        <div className="shrink-0 rounded-full bg-gradient-to-br from-indigo-400 via-violet-400 to-purple-500 p-[3px] shadow-md">
          <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-white/70 dark:border-zinc-900/60">
            <img src={url} alt="当前头像" className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            用于首页介绍卡与大屏模式。支持 jpg / png / webp / gif，不超过 10MB。
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="rounded-xl bg-[#5d7a8a] px-4 py-2 text-sm text-white transition hover:bg-[#4c6775] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "处理中…" : url === "/avatar.jpg" ? "上传头像" : "更换头像"}
            </button>
            {url !== "/avatar.jpg" && (
              <button
                type="button"
                onClick={resetDefault}
                disabled={busy}
                className="rounded-xl border border-black/10 bg-white/60 px-4 py-2 text-sm text-zinc-600 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/15"
              >
                恢复默认
              </button>
            )}
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />
    </div>
  );
}
