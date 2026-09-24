import { prisma } from "@/lib/prisma";
import PostForm from "@/components/admin/PostForm";

export default async function NewPostPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">新建文章</h1>
      <PostForm categories={categories} />
    </div>
  );
}