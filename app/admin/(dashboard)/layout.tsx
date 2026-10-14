import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="relative min-h-screen">
      {/* 后台背景遮罩：盖住全局 BackgroundSlideshow，便于专注工作；日间用白色轻纱保证可读性，夜间保持压暗 */}
      <div className="fixed inset-0 -z-10 bg-white/60 dark:bg-black/40" />
      <AdminShell userName={session.user.name ?? "管理员"}>
        {children}
      </AdminShell>
    </div>
  );
}
