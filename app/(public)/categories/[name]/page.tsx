import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostCard from "@/components/PostCard";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name: rawName } = await params;
  // 中文分类名经过 URL 传输后是百分号编码，需要解码后再查库
  let name = rawName;
  try {
    name = decodeURIComponent(rawName);
  } catch {
    // 非法编码序列时保留原值
  }
  const category = await prisma.category.findUnique({ where: { name } });
  if (!category) notFound();

  const posts = await prisma.post.findMany({
    where: { published: true, categoryId: category.id },
    include: { category: true, tags: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">分类：{category.name}</h1>
      {posts.length === 0 ? (
        <p className="py-16 text-center text-zinc-500">该分类下暂无文章</p>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}