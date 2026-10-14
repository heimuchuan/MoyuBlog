import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPostDetail } from "@/lib/public-data";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import BackButton from "@/components/BackButton";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  // 中文 slug 经过 URL 传输后是百分号编码，需要解码后再查库
  let slug = rawSlug;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch {
    // 非法编码序列时保留原值
  }
  const post = await getPostDetail(slug);
  if (!post || !post.published) notFound();
  // 定时发布：未到发布时间等同于不存在
  if (post.publishAt && new Date(post.publishAt).getTime() > Date.now()) notFound();

  // 浏览量 +1 放到响应后执行，不阻塞页面渲染（云端库写入慢）
  after(async () => {
    await prisma.post
      .update({ where: { id: post.id }, data: { views: { increment: 1 } } })
      .catch(() => {});
  });

  const date = new Date(post.createdAt).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="glass rounded-3xl p-6 sm:p-10">
      <div className="mb-5">
        <BackButton />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
        <span>{post.authorName}</span>
        <span>·</span>
        <span>{date}</span>
        <span>·</span>
        <span>{post.views + 1} 次阅读</span>
        {post.categoryName && (
          <>
            <span>·</span>
            <Link
              href={`/categories/${encodeURIComponent(post.categoryName)}`}
              className="text-indigo-500 hover:underline"
            >
              {post.categoryName}
            </Link>
          </>
        )}
      </div>
      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span key={t} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs dark:bg-zinc-800">
              #{t}
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
