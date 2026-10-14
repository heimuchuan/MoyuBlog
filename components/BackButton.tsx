"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/** 返回上一页：有浏览历史时回退；直接从外部进入（无历史）时回到文章列表 */
export default function BackButton({ fallback = "/posts" }: { fallback?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="返回上一页"
      title="返回上一页"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/60 text-zinc-600 backdrop-blur transition hover:bg-white/90 hover:text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/15 dark:hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
    </button>
  );
}
