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
        className="flex-1 rounded-xl border border-white/20 bg-white/60 px-3 py-2 text-sm outline-none focus:border-[#5d7a8a] dark:border-white/10 dark:bg-white/5"
      />
      <button
        type="submit"
        className="rounded-xl bg-[#5d7a8a] px-4 py-2 text-sm text-white transition hover:bg-[#4a6470]"
      >
        添加
      </button>
    </form>
  );
}