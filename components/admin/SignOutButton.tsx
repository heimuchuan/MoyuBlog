"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await signOut({ redirect: false });
        router.push("/admin/login");
        router.refresh();
      }}
      className="rounded-lg border border-black/10 px-3 py-1.5 text-sm transition hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/10"
    >
      退出登录
    </button>
  );
}