"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Image as ImageIcon,
  MessageSquareText,
  Wallet,
  BookOpen,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const links: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "概览", icon: LayoutDashboard },
  { href: "/admin/posts", label: "文章", icon: FileText },
  { href: "/admin/categories", label: "分类", icon: FolderTree },
  { href: "/admin/photos", label: "照片", icon: ImageIcon },
  { href: "/admin/talks", label: "说说", icon: MessageSquareText },
  { href: "/admin/ledger", label: "记账", icon: Wallet },
  { href: "/admin/knowledge", label: "知识库", icon: BookOpen },
];

const COLLAPSE_KEY = "moyu_admin_sidebar_collapsed";

export default function AdminShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
  }, [collapsed, mounted]);

  // 路由变化后自动关闭手机端抽屉
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const sidebar = (
    <aside
      className={`glass fixed bottom-3 right-3 top-3 z-50 flex flex-col rounded-2xl transition-all duration-300 ease-out
        ${collapsed ? "w-[72px]" : "w-60"}
        max-lg:bottom-0 max-lg:right-0 max-lg:top-0 max-lg:max-w-[80vw] max-lg:rounded-none
        ${mobileOpen ? "max-lg:translate-x-0" : "max-lg:translate-x-[110%]"}
      `}
    >
      {/* 顶部：标题 + 收起按钮 */}
      <div className="flex h-14 items-center gap-2 px-4">
        {!collapsed && (
          <span className="industrial-zh min-w-0 flex-1 truncate text-sm tracking-wide">
            MoyuBlog · 后台
          </span>
        )}
        {collapsed && <div className="flex-1" />}
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "展开侧栏" : "收起侧栏"}
          title={collapsed ? "展开" : "收起"}
          className="hidden rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-black/5 hover:text-[#5d7a8a] dark:hover:bg-white/10 lg:block"
        >
          {collapsed ? (
            <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
          ) : (
            <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
          )}
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="关闭菜单"
          className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-black/5 dark:hover:bg-white/10 lg:hidden"
        >
          <X className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>

      {/* 导航链接 */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {links.map((l) => {
          const Icon = l.icon;
          const active = isActive(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              title={collapsed ? l.label : undefined}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors
                ${collapsed ? "justify-center px-0" : ""}
                ${
                  active
                    ? "bg-[#5d7a8a]/15 font-medium text-[#5d7a8a]"
                    : "text-zinc-600 hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/10"
                }`}
            >
              {/* 激活指示条：位于靠内容区一侧（左侧） */}
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[#5d7a8a]" />
              )}
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
              {!collapsed && <span className="truncate">{l.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* 底部：账号信息 + 操作按钮 */}
      <div className="border-t border-black/10 p-3 dark:border-white/10">
        {!collapsed && (
          <div className="mb-2 truncate px-1 text-xs text-zinc-500">
            {userName}
          </div>
        )}
        <div
          className={`flex items-center gap-1 ${
            collapsed ? "flex-col" : "flex-row justify-between"
          }`}
        >
          <Link
            href="/"
            title="返回前台"
            aria-label="返回前台"
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-black/5 hover:text-[#5d7a8a] dark:hover:bg-white/10"
          >
            <Home className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </Link>
          <ThemeToggle />
          <button
            onClick={async () => {
              await signOut({ redirect: false });
              router.push("/admin/login");
              router.refresh();
            }}
            title="退出登录"
            aria-label="退出登录"
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* 手机端菜单按钮 */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="打开后台菜单"
        className="glass fixed right-3 top-3 z-40 rounded-xl p-2.5 text-zinc-600 dark:text-zinc-300 lg:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={1.8} />
      </button>

      {/* 手机端遮罩 */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {sidebar}

      <main
        className={`min-h-screen px-4 pb-10 pt-6 transition-[padding] duration-300 ease-out
          ${collapsed ? "lg:pl-4 lg:pr-[100px]" : "lg:pl-4 lg:pr-[264px]"}
          max-lg:pt-16`}
      >
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
    </>
  );
}
