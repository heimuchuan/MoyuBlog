"use client";

import { type CSSProperties } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@/components/Icons";

export type HomePost = {
  title: string;
  slug: string;
  snippet: string | null;
  createdAt: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * 右侧顶部横向文章卡：左图右文，展示最新一篇已发布文章。
 */
export default function ArticleFeaturedCard({
  post,
  style,
}: {
  post: HomePost | null;
  style?: CSSProperties;
}) {
  // 无文章时：引导到文章列表
  if (!post) {
    return (
      <Link
        href="/posts"
        style={style}
        className="group flex overflow-hidden rounded-3xl border border-white/50 bg-white/60 shadow-[0_2px_18px_rgba(90,90,70,0.08)] backdrop-blur-md transition-all duration-500 hover:scale-[1.012] hover:shadow-[0_10px_30px_rgba(90,90,70,0.13)] dark:border-white/10 dark:bg-white/10 dark:shadow-none"
      >
        <div className="hidden w-2/5 shrink-0 sm:block">
          <img
            src="/wither-bloom.jpg"
            alt="文章"
            className="h-full max-h-44 w-full object-cover object-[50%_25%] transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col justify-center gap-1 p-5">
          <span className="text-xs font-medium tracking-wide text-[#5d7a8a]">最新文章</span>
          <span className="text-sm text-zinc-500">还没有文章，去写第一篇吧</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/posts/${post.slug}`}
      style={style}
      className="group flex overflow-hidden rounded-3xl border border-white/50 bg-white/60 shadow-[0_2px_18px_rgba(90,90,70,0.08)] backdrop-blur-md transition-all duration-500 hover:scale-[1.012] hover:shadow-[0_10px_30px_rgba(90,90,70,0.13)] dark:border-white/10 dark:bg-white/10 dark:shadow-none"
    >
      <div className="hidden w-2/5 shrink-0 overflow-hidden sm:block">
        <img
          src="/wither-bloom.jpg"
          alt={post.title}
          className="h-full max-h-44 w-full object-cover object-[50%_25%] transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-5">
        <span className="text-xs font-medium tracking-wide text-[#5d7a8a]">最新文章</span>
        <h3 className="truncate text-base font-semibold text-zinc-800 dark:text-zinc-100">
          {post.title}
        </h3>
        {post.snippet && (
          <p className="line-clamp-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            {post.snippet}
          </p>
        )}
        <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-400">
          <span>{formatDate(post.createdAt)}</span>
          <span className="flex items-center gap-0.5 text-[#5d7a8a] transition-transform group-hover:translate-x-0.5">
            阅读全文
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
