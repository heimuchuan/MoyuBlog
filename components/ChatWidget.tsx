"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Chat from "./Chat";

type PetState = "idle" | "open" | "thinking";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [thinking, setThinking] = useState(false);
  const pathname = usePathname();

  const state: PetState = !open ? "idle" : thinking ? "thinking" : "open";
  // 音乐页内容较满：未展开的宠物/气泡降低透明度并更贴边，悬停恢复
  const dimmed = pathname?.startsWith("/music") && !open;
  const bubblePosCls = dimmed
    ? "bottom-20 right-3 opacity-25 hover:opacity-100"
    : "bottom-24 right-6 opacity-100";
  const petPosCls = dimmed
    ? "bottom-3 right-3 opacity-50 hover:opacity-100"
    : "bottom-6 right-6 opacity-100";

  return (
    <>
      {/* 未打开时的气泡提示 */}
      <button
        onClick={() => setOpen(true)}
        aria-label="打开智能问答"
        className={`glass fixed z-50 origin-bottom-right rounded-2xl rounded-br-sm px-3 py-2 text-sm text-zinc-700 transition-all duration-500 dark:text-zinc-200 ${
          open
            ? "pointer-events-none bottom-24 right-6 translate-y-1 opacity-0"
            : `${bubblePosCls} hover:-translate-y-0.5`
        }`}
      >
        👋 点我，陪你聊聊校园～
      </button>

      {/* 悬浮宠物：灰原哀 Q 版图片 + 呼吸光晕 + 装饰环 + 待机浮动 */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "关闭智能问答" : "打开智能问答"}
        className={`group fixed z-50 transition-all duration-500 hover:scale-105 active:scale-95 ${petPosCls}`}
      >
        <span className="relative block">
          {/* 呼吸光晕 */}
          <span
            className="pointer-events-none absolute -inset-2 rounded-full bg-gradient-to-br from-sky-300/50 via-indigo-300/40 to-pink-300/50 blur-lg"
            style={{ animation: "pet-halo 3s ease-in-out infinite" }}
          />
          {/* 头像 */}
          <img
            src={state === "open" ? "/confession.jpg" : "/cold.jpg"}
            alt="灰原哀 Q 版宠物"
            className="relative h-16 w-16 rounded-full border-2 border-white/70 object-cover shadow-lg dark:border-white/20"
            style={state === "idle" ? { animation: "pet-idle 3.5s ease-in-out infinite" } : undefined}
          />
          {/* 内高光环 */}
          <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/50 dark:ring-white/20" />
        </span>
        {/* 思考气泡 */}
        {state === "thinking" && (
          <span className="pointer-events-none absolute -right-1 -top-3 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-500/70 dark:bg-white/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-500/70 dark:bg-white/70" />
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-500/70 dark:bg-white/70" />
          </span>
        )}
      </button>

      {/* 聊天面板 */}
      {open && (
        <div className="glass fixed bottom-24 right-6 z-50 flex h-[520px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl transition-all duration-500">

          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/10">
            <span className="text-sm font-semibold">校园智能问答</span>
            <button
              onClick={() => {
                setOpen(false);
                setThinking(false);
              }}
              className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              关闭
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <Chat onLoadingChange={setThinking} />
          </div>
        </div>
      )}
    </>
  );
}