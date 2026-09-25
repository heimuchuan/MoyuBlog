import { prisma } from "@/lib/prisma";
import PostForm from "@/components/admin/PostForm";

export default async function NewPostPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="industrial-zh mb-6 text-2xl font-bold">新建文章</h1>
      <div className="glass rounded-2xl p-6">
        <PostForm categories={categories} />
      </div>
    </div>
  );
}