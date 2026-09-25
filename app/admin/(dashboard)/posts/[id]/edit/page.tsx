import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostForm from "@/components/admin/PostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    prisma.post.findUnique({
      where: { id: Number(id) },
      include: { tags: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!post) notFound();

  return (
    <div>
      <h1 className="industrial-zh mb-6 text-2xl font-bold">编辑文章</h1>
      <div className="glass rounded-2xl p-6">
        <PostForm
          categories={categories}
          post={{
            id: post.id,
            title: post.title,
            content: post.content,
            excerpt: post.excerpt || "",
            published: post.published,
            categoryId: post.categoryId,
            tags: post.tags.map((t) => t.name),
          }}
        />
      </div>
    </div>
  );
}
