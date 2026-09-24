"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddCategoryForm() {
  const router = useRouter();
  const [name, setName] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="新分类名称"
        className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-zinc-900"
      />
      <button
        type="submit"
        className="rounded-xl bg-indigo-500 px-4 py-2 text-sm text-white transition hover:bg-indigo-600"
      >
        添加
      </button>
    </form>
  );
}