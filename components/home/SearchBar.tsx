"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** 搜索引擎定义：label 显示在左侧按钮，url 拼接关键词后新标签页打开 */
type Engine = { id: string; label: string; url: (q: string) => string };
const ENGINES: Engine[] = [
  { id: "bing", label: "BING", url: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}` },
  { id: "google", label: "Google", url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
  { id: "baidu", label: "百度", url: (q) => `https://www.baidu.com/s?wd=${encodeURIComponent(q)}` },
];

export default function SearchBar() {
  const [engine, setEngine] = useState<Engine>(ENGINES[0]);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  // 点击组件外部时收起引擎菜单
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function submit() {
    const query = q.trim();
    if (!query) return;
    window.open(engine.url(query), "_blank", "noreferrer");
  }

  return (
    <div ref={boxRef} className="relative w-full">
      {/* 胶囊容器：深色毛玻璃 + 白色细边，hover 变亮，聚焦紫色光圈 */}
      <div className="flex h-12 items-center rounded-full border border-white/20 bg-black/20 backdrop-blur-md transition hover:border-white/30 hover:bg-black/30 focus-within:border-white/30 focus-within:bg-black/30 focus-within:ring-2 focus-within:ring-purple-500/50">
        {/* 左：引擎选择 */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex h-full items-center gap-1.5 rounded-l-full pl-5 pr-2.5 text-sm font-medium tracking-wide text-white/85 transition hover:text-white"
        >
          {engine.label}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            strokeWidth={2}
          />
        </button>
        <div className="h-5 w-px bg-white/15" aria-hidden />

        {/* 中：输入区 */}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          type="text"
          placeholder="搜索..."
          autoComplete="off"
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/50"
        />

        {/* 右：搜索按钮 */}
        <button
          type="button"
          onClick={submit}
          aria-label="搜索"
          className="flex h-full items-center rounded-r-full pl-1.5 pr-5 text-white/70 transition hover:text-violet-300"
        >
          <Search className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </button>
      </div>

      {/* 引擎下拉菜单 */}
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-2 top-[calc(100%+8px)] z-20 w-40 overflow-hidden rounded-2xl border border-white/15 bg-black/60 p-1.5 shadow-2xl backdrop-blur-md"
          >
            {ENGINES.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={e.id === engine.id}
                  onClick={() => {
                    setEngine(e);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-white/10 ${
                    e.id === engine.id ? "text-violet-300" : "text-white/85"
                  }`}
                >
                  {e.label}
                  {e.id === engine.id && <Check className="h-3.5 w-3.5" strokeWidth={2.2} />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
