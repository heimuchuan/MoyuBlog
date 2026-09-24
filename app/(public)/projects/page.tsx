"use client";

import { useState } from "react";
import { projects, projectCategories, type Project, type ProjectCategory } from "@/lib/projects";

// 分类线条图标（lucide 风格，stroke 跟随文字颜色）
function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };
  switch (name) {
    case "all":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "web":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18" />
          <circle cx="6" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
          <circle cx="9" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "tool":
      return (
        <svg {...common}>
          <path d="M14.5 4a3.5 3.5 0 0 0-4 5.4L3 17v4h4l7.6-7.6a3.5 3.5 0 0 0 5.4-4l-2.5 2.5-2-2 2-2.9z" />
        </svg>
      );
    case "experiment":
      return (
        <svg {...common}>
          <path d="M9 3h6" />
          <path d="M10 3v6L4.3 18.5a1 1 0 0 0 .9 1.5h13.6a1 1 0 0 0 .9-1.5L14 9V3" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ProjectsPage() {
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");
  const list = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">项目</h1>
      <p className="mt-1 text-sm text-zinc-500">我做过的一些东西</p>

      {/* 分类筛选：钢铁蓝灰胶囊 + 线条图标 */}
      <div className="mt-6 inline-flex items-center gap-0.5 rounded-md border border-[#5d7a8a]/30 bg-white/30 p-0.5 backdrop-blur-sm dark:bg-white/5">
        {projectCategories.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setFilter(c.key)}
            className={`flex items-center gap-1.5 rounded-sm px-3 py-1 text-sm font-medium tracking-wide transition-all duration-300 ${
              filter === c.key
                ? "bg-[#5d7a8a] text-white shadow-sm"
                : "text-[#5d7a8a]/70 hover:text-[#5d7a8a] hover:bg-[#5d7a8a]/10"
            }`}
          >
            <CategoryIcon name={c.key} />
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* 项目网格：错落 span + 入场交错淡入 */}
      <div className="mt-6 grid auto-rows-[280px] grid-cols-1 gap-4 md:grid-cols-3">
        {list.map((p, i) => (
          <ProjectCard key={p.slug} p={p} i={i} />
        ))}
      </div>

      {list.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-black/10 p-12 text-center text-zinc-400 dark:border-white/10">
          这个分类下还没有项目
        </div>
      )}
    </div>
  );
}

function ProjectCard({ p, i }: { p: Project; i: number }) {
  const lg = p.span === "lg";
  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group glass relative flex flex-col overflow-hidden rounded-3xl shadow-lg transition-all duration-700 ease-out hover:-translate-y-0.5 hover:shadow-xl ${
        lg ? "md:col-span-2 md:row-span-2" : ""
      }`}
      style={{ animation: `layout-enter 0.7s ease-out ${i * 60}ms backwards` }}
    >
      {/* 顶部图片：flex-1 占据剩余空间，object-cover 裁剪，顶部圆角跟随卡片（外层 overflow-hidden 自动裁剪） */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {p.cover ? (
          <img
            src={p.cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[50%_25%] transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#5d7a8a]/40 via-[#5d7a8a]/10 to-transparent transition-transform duration-700 ease-out group-hover:scale-105" />
        )}
        {!p.cover && (
          <div className="pointer-events-none absolute -right-3 -top-3 select-none text-6xl font-black text-[#5d7a8a]/25">
            {p.title.slice(0, 1)}
          </div>
        )}
        {/* 光斑扫过 */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-1/2 top-0 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[400%]" />
        </div>
      </div>

      {/* 底部内容：shrink-0 按内容高度，时间 → 标题 → 标签 → 摘要，按层级排布 */}
      <div className="flex shrink-0 flex-col gap-2 p-5 text-zinc-900 dark:text-white">
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{p.date}</div>
        <div className="text-base font-semibold transition-transform duration-700 ease-out group-hover:-translate-y-0.5">
          {p.title}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {p.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-white/40 px-2 py-0.5 text-xs text-zinc-700 dark:bg-white/10 dark:text-zinc-200"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
          {p.desc}
        </div>
      </div>
    </a>
  );
}
