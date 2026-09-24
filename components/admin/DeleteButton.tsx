"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({
  url,
  body,
  confirmText = "确定删除吗？",
}: {
  url: string;
  body?: unknown;
  confirmText?: string;
}) {
  const router = useRouter();

  async function del() {
    if (!window.confirm(confirmText)) return;
    await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    router.refresh();
  }

  return (
    <button onClick={del} className="text-red-500 hover:underline">
      删除
    </button>
  );
}