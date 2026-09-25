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
      className="rounded-lg border border-[#5d7a8a]/40 px-3 py-1.5 text-sm text-[#5d7a8a] transition hover:bg-[#5d7a8a]/10 dark:border-white/20 dark:hover:bg-white/10"
    >
      退出登录
    </button>
  );
}