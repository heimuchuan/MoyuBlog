"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "概览" },
  { href: "/admin/posts", label: "文章" },
  { href: "/admin/categories", label: "分类" },
  { href: "/admin/photos", label: "照片" },
  { href: "/admin/talks", label: "说说" },
  { href: "/admin/ledger", label: "记账" },
  { href: "/admin/knowledge", label: "知识库" },
];

export default function AdminNav() {
  const pathname = usePathname();
  // 概览精确匹配，其余按前缀匹配（覆盖 /admin/posts/new 等子路由）
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav className="flex flex-wrap items-center gap-1">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={
            isActive(l.href)
              ? "rounded-lg bg-[#5d7a8a]/15 px-3 py-1.5 text-sm text-[#5d7a8a]"
              : "rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-white/20 dark:hover:bg-white/10"
          }
        >
          {l.label}
        </Link>
      ))}
      {/* 返回前台：线条 home 图标，无文字 */}
      <Link
        href="/"
        title="返回前台"
        aria-label="返回前台"
        className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/20 hover:text-[#5d7a8a] dark:hover:bg-white/10"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M3 11l9-8 9 8" />
          <path d="M5 10v10h14V10" />
        </svg>
      </Link>
    </nav>
  );
}
