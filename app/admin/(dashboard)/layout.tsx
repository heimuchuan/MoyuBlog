import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SignOutButton from "@/components/admin/SignOutButton";
import AdminNav from "@/components/admin/AdminNav";
import ThemeToggle from "@/components/admin/ThemeToggle";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="relative min-h-screen">
      {/* 后台背景压暗遮罩：盖住全局 BackgroundSlideshow，便于专注工作 */}
      <div className="fixed inset-0 -z-10 bg-black/40" />
      <header className="nav-glass">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="industrial-zh text-sm tracking-wide">MoyuBlog · 后台</span>
            <AdminNav />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-zinc-500">{session.user.name}</span>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}