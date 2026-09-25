"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlobeIcon, LockIcon } from "@/components/Icons";

/** 说说可见性徽标：点击即在公开/私密之间切换 */
export default function TalkVisibilityToggle({
  id,
  visibility,
}: {
  id: number;
  visibility: "public" | "private";
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function toggle() {
    if (saving) return;
    setSaving(true);
    const next = visibility === "private" ? "public" : "private";
    const res = await fetch("/api/talks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, visibility: next }),
    });
    setSaving(false);
    if (res.ok) router.refresh();
  }

  const isPrivate = visibility === "private";
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      title={isPrivate ? "点击切换为公开（前台可见）" : "点击切换为私密（仅后台可见）"}
      className={
        isPrivate
          ? "flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-600 transition hover:bg-amber-500/25 disabled:opacity-50 dark:text-amber-400"
          : "flex items-center gap-1 rounded-full bg-[#5d7a8a]/15 px-2 py-0.5 text-xs text-[#5d7a8a] transition hover:bg-[#5d7a8a]/25 disabled:opacity-50"
      }
    >
      {saving ? (
        "切换中…"
      ) : isPrivate ? (
        <>
          <LockIcon className="h-3 w-3" />
          私密
        </>
      ) : (
        <>
          <GlobeIcon className="h-3 w-3" />
          公开
        </>
      )}
    </button>
  );
}
