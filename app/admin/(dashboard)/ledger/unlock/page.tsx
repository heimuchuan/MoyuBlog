"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockIcon } from "@/components/Icons";

export default function LedgerUnlockPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/ledger/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("密码错误，请重试");
      return;
    }
    router.push("/admin/ledger");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-center py-20">
      <div className="glass w-full max-w-sm rounded-3xl p-8">
        <h1 className="industrial-zh flex items-center gap-2 text-xl font-bold">
          <LockIcon className="h-5 w-5 text-[#5d7a8a]" />
          记账本
        </h1>
        <p className="mt-1 text-sm text-zinc-500">该板块已加密，请输入独立密码</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            placeholder="记账密码"
            className="w-full rounded-xl border border-white/20 bg-white/60 px-3 py-2 outline-none focus:border-[#5d7a8a] focus:ring-1 focus:ring-[#5d7a8a]/30 dark:border-white/10 dark:bg-white/5"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#5d7a8a] py-2.5 text-sm font-medium text-white transition hover:bg-[#4a6470] disabled:opacity-50"
          >
            {loading ? "解锁中…" : "解锁进入"}
          </button>
        </form>
      </div>
    </div>
  );
}
