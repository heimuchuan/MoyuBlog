import { prisma } from "@/lib/prisma";
import AddCategoryForm from "@/components/admin/AddCategoryForm";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminCategories() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="industrial-zh mb-6 text-2xl font-bold">分类管理</h1>
      <div className="glass mb-6 max-w-md rounded-2xl p-4">
        <AddCategoryForm />
      </div>

      {categories.length === 0 ? (
        <p className="py-16 text-center text-zinc-500">暂无分类</p>
      ) : (
        <ul className="glass max-w-md rounded-2xl p-4 divide-y divide-black/5 dark:divide-white/10">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2 text-sm">
                <span>{c.name}</span>
                <span className="text-zinc-400">({c._count.posts} 篇)</span>
              </div>
              <DeleteButton url={`/api/categories/${c.id}`} confirmText={`确定删除分类「${c.name}」吗？`} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}