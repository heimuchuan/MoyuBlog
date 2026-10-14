"use client";

import { useState } from "react";
import type { PublicProject, PublicProjectCategory } from "@/lib/public-data";

// 封面图访问地址：Blob/外部 URL 直接用，本地文件名走 /uploads/projects/
function coverUrl(ref: string | null): string | null {
  if (!ref) return null;
  if (ref.startsWith("http")) return ref;
  if (ref.startsWith("/")) return ref;
  return `/uploads/projects/${ref}`;
}

export default function ProjectsClient({
  projects,
  categories,
}: {
  projects: PublicProject[];
  categories: PublicProjectCategory[];
}) {
  const [filter, setFilter] = useState<string>("all");
  const list = filter === "all" ? projects : projects.filter((p) => p.categoryKey === filter);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">项目</h1>
      <p className="mt-1 text-sm text-zinc-500">我做过的一些东西</p>

      <div className="mt-6 inline-flex items-center gap-0.5 rounded-md border border-[#5d7a8a]/30 bg-white/30 p-0.5 backdrop-blur-sm dark:bg-white/5">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`flex items-center gap-1.5 rounded-sm px-3 py-1 text-sm font-medium tracking-wide transition-all duration-300 ${
            filter === "all"
              ? "bg-[#5d7a8a] text-white shadow-sm"
              : "text-[#5d7a8a]/70 hover:text-[#5d7a8a] hover:bg-[#5d7a8a]/10"
          }`}
        >
          全部
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter(c.key)}
            className={`flex items-center gap-1.5 rounded-sm px-3 py-1 text-sm font-medium tracking-wide transition-all duration-300 ${
              filter === c.key
                ? "bg-[#5d7a8a] text-white shadow-sm"
                : "text-[#5d7a8a]/70 hover:text-[#5d7a8a] hover:bg-[#5d7a8a]/10"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-6 grid auto-rows-[280px] grid-cols-1 gap-4 md:grid-cols-3">
        {list.map((p, i) => (
          <ProjectCard key={p.id} p={p} i={i} />
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

function ProjectCard({ p, i }: { p: PublicProject; i: number }) {
  const lg = p.span === "lg";
  const cover = coverUrl(p.cover);
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
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[50%_25%] transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#5d7a8a]/40 via-[#5d7a8a]/10 to-transparent transition-transform duration-700 ease-out group-hover:scale-105" />
        )}
        {!cover && (
          <div className="pointer-events-none absolute -right-3 -top-3 select-none text-6xl font-black text-[#5d7a8a]/25">
            {p.title.slice(0, 1)}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-1/2 top-0 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[400%]" />
        </div>
      </div>

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
          {p.description}
        </div>
      </div>
    </a>
  );
}
