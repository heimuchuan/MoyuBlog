import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminPosts() {
  const posts = await prisma.post.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">文章管理</h1>
        <Link
          href="/admin/posts/new"
          className="rounded-xl bg-indigo-500 px-4 py-2 text-sm text-white transition hover:bg-indigo-600"
        >
          新建文章
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="py-16 text-center text-zinc-500">暂无文章</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 text-left text-zinc-500 dark:border-white/10">
                <th className="py-2 pr-4 font-medium">标题</th>
                <th className="py-2 pr-4 font-medium">分类</th>
                <th className="py-2 pr-4 font-medium">状态</th>
                <th className="py-2 pr-4 font-medium">创建时间</th>
                <th className="py-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-black/5 dark:border-white/10">
                  <td className="max-w-[280px] truncate py-3 pr-4">{p.title}</td>
                  <td className="py-3 pr-4">{p.category?.name || "—"}</td>
                  <td className="py-3 pr-4">
                    {p.published ? (
                      <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-green-600">已发布</span>
                    ) : (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-500 dark:bg-zinc-800">草稿</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-zinc-500">
                    {new Date(p.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/posts/${p.id}/edit`} className="text-indigo-500 hover:underline">
                        编辑
                      </Link>
                      <DeleteButton url={`/api/posts/${p.id}`} confirmText={`确定删除「${p.title}」吗？`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}