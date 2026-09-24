"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const links = [
  { href: "/", label: "首页" },
  { href: "/projects", label: "项目" },
  { href: "/posts", label: "文章" },
  { href: "/photos", label: "照片" },
  { href: "/music", label: "音乐" },
  { href: "/talks", label: "说说" },
  { href: "/about", label: "关于" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; r: number; color: string; key: number } | null>(null);

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

  useEffect(() => {
    const onClear = () => setCleared(true);
    const onRestore = () => setCleared(false);
    window.addEventListener("bg-clear", onClear);
    window.addEventListener("bg-restore", onRestore);
    return () => {
      window.removeEventListener("bg-clear", onClear);
      window.removeEventListener("bg-restore", onRestore);
    };
  }, []);

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
      className={`glass sticky top-0 z-40 rounded-none border-x-0 border-t-0 transition-all duration-500 ease-out ${
        hidden || cleared ? "pointer-events-none -translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
        <Link href="/" className="text-base font-bold tracking-tight">
          Reliefの摸鱼办
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={
                  "rounded-lg px-3 py-1.5 text-sm transition-colors " +
                  (active
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10")
                }
              >
                {l.label}
              </Link>
            );
          })}
          <button
            onClick={toggleTheme}
            aria-label="切换主题"
            className="ml-2 rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10"
          >
            {mounted && resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </nav>
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

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}