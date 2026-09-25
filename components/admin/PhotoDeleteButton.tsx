"use client";

import { useRouter } from "next/navigation";

/** 照片删除角标按钮：悬浮在图片右上角，confirm 后删除记录与文件 */
export default function PhotoDeleteButton({ id }: { id: number }) {
  const router = useRouter();

  async function del() {
    if (!window.confirm("确定删除这张照片吗？")) return;
    await fetch("/api/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={del}
      aria-label="删除照片"
      className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-500"
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
      </svg>
    </button>
  );
}
