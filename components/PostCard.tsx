import Link from "next/link";

export type PostSummary = {
  slug: string;
  title: string;
  excerpt: string | null;
  createdAt: Date | string;
  views: number;
  category: { name: string } | null;
  tags: { name: string }[];
};

export default function PostCard({ post }: { post: PostSummary }) {
  const date = new Date(post.createdAt).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <article className="glass rounded-3xl p-5 transition hover:-translate-y-0.5 hover:shadow-xl">
      <Link href={`/posts/${post.slug}`} className="group">
        <h2 className="text-lg font-semibold underline-offset-4 group-hover:underline">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
            {post.excerpt}
          </p>
        )}
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        {post.category && (
          <Link
            href={`/categories/${encodeURIComponent(post.category.name)}`}
            className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-indigo-600 dark:text-indigo-300"
          >
            {post.category.name}
          </Link>
        )}
        {post.tags.map((t) => (
          <span key={t.name} className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">
            #{t.name}
          </span>
        ))}
        <span className="ml-auto">
          {date} · {post.views} 次阅读
        </span>
      </div>
    </article>
  );
}