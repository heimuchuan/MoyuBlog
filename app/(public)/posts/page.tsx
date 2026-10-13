import Link from "next/link";
import PostCard from "@/components/PostCard";
import { getPostList } from "@/lib/public-data";

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; category?: string; tag?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10));
  const q = sp.q?.trim();
  const category = sp.category;
  const tag = sp.tag;

  // 查询按参数独立缓存，只取列表字段（不含正文），云端库下避免每次数秒等待
  const { total, posts } = await getPostList({ page, q, category, tag });
  const totalPages = Math.max(1, Math.ceil(total / 10));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">文章</h1>
        <p className="mt-1 text-sm text-zinc-500">记录想记录的</p>
      </div>

      <form action="/posts" method="get" className="mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="搜索文章标题或内容…"
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-zinc-900"
        />
      </form>

      {posts.length === 0 ? (
        <p className="py-16 text-center text-zinc-500">暂无文章</p>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4 text-sm">
          {page > 1 && (
            <Link
              href={`/posts?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className="rounded-lg border border-black/10 px-3 py-1.5 dark:border-white/10"
            >
              上一页
            </Link>
          )}
          <span className="text-zinc-500">
            第 {page} / {totalPages} 页
          </span>
          {page < totalPages && (
            <Link
              href={`/posts?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className="rounded-lg border border-black/10 px-3 py-1.5 dark:border-white/10"
            >
              下一页
            </Link>
          )}
        </div>
      )}
    </div>
  );
}