import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { category: true, tags: true, author: { select: { name: true } } },
  });
  if (!post || !post.published) notFound();

  await prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } });

  const date = new Date(post.createdAt).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="glass rounded-3xl p-6 sm:p-10">
      <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
        <span>{post.author.name}</span>
        <span>·</span>
        <span>{date}</span>
        <span>·</span>
        <span>{post.views + 1} 次阅读</span>
        {post.category && (
          <>
            <span>·</span>
            <Link
              href={`/categories/${encodeURIComponent(post.category.name)}`}
              className="text-indigo-500 hover:underline"
            >
              {post.category.name}
            </Link>
          </>
        )}
      </div>
      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span key={t.name} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs dark:bg-zinc-800">
              #{t.name}
            </span>
          ))}
        </div>
      )}
      <div className="mt-8 border-t border-black/5 pt-8 dark:border-white/10">
        <MarkdownRenderer content={post.content} />
      </div>
      </div>
    </article>
  );
}