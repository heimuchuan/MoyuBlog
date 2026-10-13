"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Home,
  FolderGit2,
  FileText,
  Image as ImageIcon,
  Music,
  MessageSquare,
  User,
  Sun,
  Moon,
  type LucideIcon,
} from "lucide-react";

const links: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "首页", icon: Home },
  { href: "/projects", label: "项目", icon: FolderGit2 },
  { href: "/posts", label: "文章", icon: FileText },
  { href: "/photos", label: "照片", icon: ImageIcon },
  { href: "/music", label: "音乐", icon: Music },
  { href: "/talks", label: "说说", icon: MessageSquare },
  { href: "/about", label: "关于", icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; r: number; color: string; key: number } | null>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // logo 单击回首页、双击进后台（隐蔽入口：登录→/admin，未登录→/admin/login）
  function handleLogoClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      router.push(status === "authenticated" ? "/admin" : "/admin/login");
    } else {
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
        if (pathname !== "/") router.push("/");
      }, 250);
    }
  }

  function toggleTheme(e: React.MouseEvent<HTMLButtonElement>) {
    const { clientX, clientY } = e;
    // 半径取屏幕对角线，保证圆形能覆盖大半屏
    const r = Math.hypot(window.innerWidth, window.innerHeight);
    const nextDark = resolvedTheme !== "dark";
    // 切换到暗色用白色半透明圆，切回亮色用黑色半透明圆，扩散后淡出
    const color = nextDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)";
    setRipple({ x: clientX, y: clientY, r, color, key: Date.now() });
    setTheme(nextDark ? "dark" : "light");
  }
  useEffect(() => setMounted(true), []);

  // 上下滚动收起/展开导航：向下滚过阈值隐藏，向上滚或回到顶部显示
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      if (y < 80) setHidden(false);
      else if (delta > 0) setHidden(true);
      else if (delta < 0) setHidden(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`nav-glass transition-all duration-500 ease-out ${
        hidden ? "pointer-events-none -translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-2 px-3 sm:px-4">
        <Link
          href="/"
          onClick={handleLogoClick}
          className="shrink-0 cursor-pointer truncate text-sm font-bold tracking-tight sm:text-base select-none"
        >
          <span className="sm:hidden">Relief</span>
          <span className="hidden sm:inline">Reliefの摸鱼办</span>
        </Link>
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <nav className="flex items-center gap-0.5 sm:gap-1.5">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-label={l.label}
                className={
                  "relative flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-sm transition-colors sm:px-3 " +
                  (active
                    ? "bg-violet-500/10 font-medium text-violet-600 dark:bg-violet-400/10 dark:text-violet-300"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10")
                }
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span className="hidden sm:inline">{l.label}</span>
                {/* 激活态底部小圆点 */}
                {active && (
                  <span className="absolute bottom-[3px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-violet-500 dark:bg-violet-400" />
                )}
              </Link>
            );
          })}
          <button
            onClick={toggleTheme}
            aria-label="切换主题"
            className="ml-1 rounded-xl p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10 sm:ml-2"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" strokeWidth={2} />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={2} />
            )}
          </button>
          </nav>
        </div>
      </div>

      {/* 主题切换水波纹：从点击处向外扩散的半透明圆形，纯装饰不遮屏 */}
      {ripple &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[999]"
            style={{ left: ripple.x, top: ripple.y }}
          >
            <span
              onAnimationEnd={() => setRipple(null)}
              className="absolute rounded-full"
              style={{
                width: ripple.r,
                height: ripple.r,
                background: ripple.color,
                animation: "ripple-ring 0.9s cubic-bezier(0.2, 0.6, 0.3, 1) forwards",
              }}
            />
          </div>,
          document.body
        )}
    </header>
  );
}