"use client";

import { useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { MessageCircleHeart, Send } from "lucide-react";
import { GithubIcon } from "@/components/Icons";

type Msg = {
  id: number;
  name: string;
  content: string;
  avatarUrl: string | null;
  githubLogin: string | null;
  createdAt: string;
};

type Visitor = {
  name?: string | null;
  avatarUrl?: string | null;
  githubLogin?: string | null;
};

const CONTENT_MAX = 200;
const NAME_MAX = 20;

/** 匿名头像底色：由昵称哈希出固定颜色 */
const PALETTE = ["#5d7a8a", "#7a6f9b", "#9b6f7a", "#6f9b7a", "#9b8a6f", "#6f8a9b"];
function anonColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function Avatar({ name, url, size = 32 }: { name: string; url: string | null; size?: number }) {
  const style = { width: size, height: size };
  if (url) {
    return <img src={url} alt={name} style={style} className="shrink-0 rounded-full" />;
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
      style={{ ...style, backgroundColor: anonColor(name) }}
    >
      {name.slice(0, 1)}
    </span>
  );
}

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min} 分钟前`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} 小时前`;
  const day = Math.floor(hour / 24);
  if (day < 30) return `${day} 天前`;
  return new Date(iso).toLocaleDateString("zh-CN");
}

export default function GuestbookWall() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [githubEnabled, setGithubEnabled] = useState(false);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/guestbook")
      .then((r) => (r.ok ? r.json() : []))
      .then(setMessages)
      .catch(() => {});
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => {
        if (s?.user?.githubLogin) setVisitor(s.user);
      })
      .catch(() => {});
    // GitHub OAuth 未配置时不显示登录按钮
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((p) => setGithubEnabled(!!p?.github))
      .catch(() => {});
  }, []);

  async function submit() {
    const text = content.trim();
    if (!text || sending) return;
    setSending(true);
    setError("");
    const res = await fetch("/api/guestbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), content: text }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) {
      setError(data.error || "发表失败，请稍后再试");
      return;
    }
    setMessages((prev) => [data, ...prev]);
    setContent("");
    if (!visitor) setName("");
  }

  return (
    <section className="mt-8">
      {/* 标题行：与「部署项目」同款 */}
      <div className="mb-4 flex items-center justify-between px-1 text-xl font-medium tracking-widest text-white/70">
        <span className="flex items-center gap-2.5">
          <MessageCircleHeart className="h-5 w-5" strokeWidth={1.8} />
          留言墙
        </span>
      </div>

      {/* 发表区 */}
      <div className="rounded-xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur-2xl">
        {visitor ? (
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-white/90">
              <Avatar name={visitor.name || "?"} url={visitor.avatarUrl ?? null} />
              {visitor.name}
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/60">
                <GithubIcon className="h-3 w-3" />@{visitor.githubLogin}
              </span>
            </span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: window.location.href })}
              className="text-xs text-white/50 transition hover:text-white/90"
            >
              退出登录
            </button>
          </div>
        ) : (
          <div className="mb-3 flex items-center gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
              placeholder="昵称"
              className="w-40 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/40"
            />
            {githubEnabled && (
              <button
                type="button"
                onClick={() => signIn("github", { callbackUrl: window.location.href })}
                className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/15 hover:text-white"
              >
                <GithubIcon className="h-3.5 w-3.5" />
                GitHub 登录
              </button>
            )}
          </div>
        )}

        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, CONTENT_MAX))}
            placeholder={visitor ? "写下你的想法…" : "写下你的想法…（匿名留言每分钟限 1 条）"}
            rows={3}
            className="w-full resize-none rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm leading-relaxed text-white placeholder:text-white/40 outline-none transition focus:border-white/40"
          />
          <span className="pointer-events-none absolute bottom-2 right-2 text-[11px] text-white/35">
            {content.length}/{CONTENT_MAX}
          </span>
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-xs text-red-300/90">{error}</span>
          <button
            type="button"
            onClick={submit}
            disabled={sending || !content.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-white/15 px-4 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            {sending ? "发送中…" : "发送"}
          </button>
        </div>
      </div>

      {/* 留言卡片墙 */}
      {messages.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className="rounded-xl bg-white/10 p-3.5 ring-1 ring-white/10 backdrop-blur-2xl"
            >
              <div className="flex items-center gap-2">
                <Avatar name={m.name} url={m.avatarUrl} size={28} />
                <span className="truncate text-sm font-medium text-white/90">{m.name}</span>
                {m.githubLogin && (
                  <a
                    href={`https://github.com/${m.githubLogin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-white/55 transition hover:bg-white/20 hover:text-white/85"
                  >
                    <GithubIcon className="h-2.5 w-2.5" />@{m.githubLogin}
                  </a>
                )}
                <span className="ml-auto shrink-0 text-[11px] text-white/40">
                  {relTime(m.createdAt)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-white/75">
                {m.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
