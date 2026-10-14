import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";

const getPosts = unstable_cache(
  async () =>
    prisma.post.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
  ["admin-posts-list"],
  { revalidate: 10 }
);

export default async function AdminPosts() {
  const posts = await getPosts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="industrial-zh text-2xl font-bold">文章管理</h1>
        <Link
          href="/admin/posts/new"
          className="rounded-xl bg-[#5d7a8a] px-4 py-2 text-sm text-white transition hover:bg-[#4a6470]"
        >
          新建文章
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="py-16 text-center text-zinc-500">暂无文章</p>
      ) : (
        <div className="glass rounded-2xl p-4 overflow-x-auto">
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
              {posts.map((p) => {
                // 定了未来时间且未到点 → 定时中；到点后与普通已发布一致
                const publishAtMs = p.publishAt ? new Date(p.publishAt).getTime() : 0;
                const scheduled = p.published && publishAtMs > Date.now();
                return (
                <tr key={p.id} className="border-b border-black/5 dark:border-white/10">
                  <td className="max-w-[280px] truncate py-3 pr-4">{p.title}</td>
                  <td className="py-3 pr-4">{p.category?.name || "—"}</td>
                  <td className="py-3 pr-4">
                    {!p.published ? (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-500 dark:bg-zinc-800">草稿</span>
                    ) : scheduled ? (
                      <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-violet-600 dark:text-violet-300">
                        定时{" "}
                        {new Date(publishAtMs).toLocaleString("zh-CN", {
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-green-600">已发布</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-zinc-500">
                    {new Date(p.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/posts/${p.id}/edit`} className="text-[#5d7a8a] hover:underline">
                        编辑
                      </Link>
                      <DeleteButton url={`/api/posts/${p.id}`} confirmText={`确定删除「${p.title}」吗？`} />
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}