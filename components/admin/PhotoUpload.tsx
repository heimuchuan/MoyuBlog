"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** 后台上传照片：支持一次选择多张，逐张上传，完成后刷新列表 */
export default function PhotoUpload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  async function upload(files: FileList) {
    setError("");
    setUploading(true);
    setProgress({ done: 0, total: files.length });
    let failed = 0;
    for (let i = 0; i < files.length; i++) {
      const form = new FormData();
      form.append("file", files[i]);
      const res = await fetch("/api/photos", { method: "POST", body: form });
      if (!res.ok) failed++;
      setProgress({ done: i + 1, total: files.length });
    }
    setUploading(false);
    if (failed > 0) setError(`${failed} 张上传失败`);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <div>
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
      <p className="mt-2 text-xs text-zinc-500">支持 jpg / png / webp / gif，单张不超过 10MB</p>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
