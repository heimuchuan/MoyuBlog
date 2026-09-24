import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SignOutButton from "@/components/admin/SignOutButton";

const links = [
  { href: "/admin", label: "概览" },
  { href: "/admin/posts", label: "文章" },
  { href: "/admin/categories", label: "分类" },
  { href: "/admin/knowledge", label: "知识库" },
];

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-4 dark:border-white/10">
        <nav className="flex flex-wrap items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-white/10"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10"
          >
            返回前台
          </Link>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-zinc-500">{session.user.name}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="py-6">{children}</main>
    </div>
  );
}