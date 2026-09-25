"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * 后台主题切换按钮：复用前台 Navbar 的波纹切换逻辑
 * 半透明实心圆从点击处扩散，单波纹，不遮屏
 */
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [ripple, setRipple] = useState<{
    x: number;
    y: number;
    r: number;
    color: string;
    key: number;
  } | null>(null);

  function toggleTheme(e: React.MouseEvent<HTMLButtonElement>) {
    const { clientX, clientY } = e;
    const r = Math.hypot(window.innerWidth, window.innerHeight);
    const nextDark = resolvedTheme !== "dark";
    const color = nextDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)";
    setRipple({ x: clientX, y: clientY, r, color, key: Date.now() });
    setTheme(nextDark ? "dark" : "light");
  }

  useEffect(() => setMounted(true), []);

  return (
    <>
      <button
        onClick={toggleTheme}
        aria-label="切换主题"
        title="切换明暗模式"
        className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/20 hover:text-[#5d7a8a] dark:hover:bg-white/10"
      >
        {mounted && resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
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
                animation:
                  "ripple-ring 0.9s cubic-bezier(0.2, 0.6, 0.3, 1) forwards",
              }}
            />
          </div>,
          document.body
        )}
    </>
  );
}

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
