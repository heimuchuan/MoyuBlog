"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { GithubIcon } from "@/components/Icons";

export type GuestbookItem = {
  id: number;
  name: string;
  content: string;
  avatarUrl: string | null;
  githubLogin: string | null;
  ip: string | null;
  createdAt: string;
};

/** 匿名头像：昵称首字 + 由昵称哈希出的固定底色 */
const PALETTE = ["#5d7a8a", "#7a6f9b", "#9b6f7a", "#6f9b7a", "#9b8a6f", "#6f8a9b"];
function anonColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", { hour12: false });
}

export default function GuestbookManager({ initial }: { initial: GuestbookItem[] }) {
  const router = useRouter();
  const [list, setList] = useState<GuestbookItem[]>(initial);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function remove(id: number) {
    if (!confirm("删除这条留言？")) return;
    setDeletingId(id);
    const res = await fetch(`/api/guestbook/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) {
      setList((prev) => prev.filter((m) => m.id !== id));
      router.refresh();
    } else {
      alert("删除失败");
    }
  }

  if (list.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center text-sm text-zinc-500">
        还没有留言
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {list.map((m) => (
        <div key={m.id} className="glass flex items-start gap-3 rounded-2xl p-4">
          {m.avatarUrl ? (
            <img src={m.avatarUrl} alt={m.name} className="h-9 w-9 shrink-0 rounded-full" />
          ) : (
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: anonColor(m.name) }}
            >
              {m.name.slice(0, 1)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">{m.name}</span>
              {m.githubLogin && (
                <a
                  href={`https://github.com/${m.githubLogin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-zinc-600 transition hover:bg-black/10 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/20"
                >
                  <GithubIcon className="h-3 w-3" />@{m.githubLogin}
                </a>
              )}
              <span className="text-xs text-zinc-400">{fmtTime(m.createdAt)}</span>
              {m.ip && <span className="text-xs text-zinc-400">IP: {m.ip}</span>}
            </div>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-zinc-700 dark:text-zinc-200">
              {m.content}
            </p>
          </div>
          <button
            type="button"
            onClick={() => remove(m.id)}
            disabled={deletingId === m.id}
            title="删除"
            className="shrink-0 rounded-lg p-2 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-500 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
      ))}
    </div>
  );
}
