import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [postCount, categoryCount, docCount, qaCount] = await Promise.all([
    prisma.post.count(),
    prisma.category.count(),
    prisma.knowledgeDoc.count(),
    prisma.qALog.count(),
  ]);

  const stats = [
    { label: "文章", value: postCount, href: "/admin/posts" },
    { label: "分类", value: categoryCount, href: "/admin/categories" },
    { label: "知识文档", value: docCount, href: "/admin/knowledge" },
    { label: "问答记录", value: qaCount },
  ];

  return (
    <div>
      <h1 className="industrial-zh text-2xl font-bold">概览</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => {
          const inner = (
            <>
              <div className="rust-text text-3xl font-bold">{s.value}</div>
              <div className="mt-1 text-sm text-zinc-500">{s.label}</div>
            </>
          );
          return s.href ? (
            <Link
              key={s.label}
              href={s.href}
              className="glass rounded-2xl p-5 transition hover:shadow-lg"
            >
              {inner}
            </Link>
          ) : (
            <div key={s.label} className="glass rounded-2xl p-5">
              {inner}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/posts/new"
          className="rounded-xl bg-indigo-500 px-4 py-2 text-sm text-white transition hover:bg-indigo-600"
        >
          写新文章
        </Link>
        <Link
          href="/admin/knowledge"
          className="rounded-xl border border-black/10 px-4 py-2 text-sm transition hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/10"
        >
          管理知识库
        </Link>
      </div>
    </div>
  );
}