"use client";

import { useEffect, useState } from "react";

type Source = { title: string; content: string; score: number };
type Message = { role: "user" | "assistant"; content: string; sources?: Source[] };

export default function Chat({ onLoadingChange }: { onLoadingChange?: (loading: boolean) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 向父组件同步加载状态（用于切换宠物表情）
  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.answer || "出错了，请稍后再试。",
          sources: data.sources || [],
        },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "请求失败，请稍后再试。" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="pt-8 text-center text-sm text-zinc-500">
            你好，我是校园知识助手，问问关于校园的问题吧。
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm " +
                (m.role === "user"
                  ? "bg-indigo-500 text-white"
                  : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100")
              }
            >
              {m.content}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 border-t border-black/10 pt-2 dark:border-white/10">
                  {m.sources.map((s, j) => (
                    <div key={j} className="mt-1 text-xs opacity-80">
                      <span className="font-medium">
                        [{j + 1}] {s.title}
                      </span>
                      <span className="ml-2">相似度 {(s.score * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <p className="text-sm text-zinc-400">思考中…</p>}
      </div>
      <div className="border-t border-black/5 p-3 dark:border-white/10">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="输入你的问题…"
            className="max-h-32 flex-1 resize-none rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-zinc-900"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm text-white transition hover:bg-indigo-600 disabled:opacity-50"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}