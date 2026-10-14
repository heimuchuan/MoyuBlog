import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import ProjectManager from "@/components/admin/ProjectManager";

const orderBy = [{ order: "asc" as const }, { id: "asc" as const }];

const getProjects = unstable_cache(
  async () =>
    prisma.project.findMany({ orderBy, include: { category: true } }),
  ["admin-projects"],
  { revalidate: 10, tags: ["projects"] }
);

const getCategories = unstable_cache(
  async () => prisma.projectCategory.findMany({ orderBy }),
  ["admin-project-categories"],
  { revalidate: 10, tags: ["projects"] }
);

export default async function AdminProjectsPage() {
  const [projects, categories] = await Promise.all([getProjects(), getCategories()]);
  return (
    <div className="space-y-6">
      <h1 className="industrial-zh text-2xl font-bold">项目</h1>
      <ProjectManager
        initialProjects={projects.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          description: p.description,
          cover: p.cover,
          date: p.date,
          tags: JSON.parse(p.tags || "[]"),
          categoryId: p.categoryId,
          url: p.url,
          span: p.span,
          order: p.order,
          active: p.active,
        }))}
        initialCategories={categories.map((c) => ({
          id: c.id,
          key: c.key,
          name: c.name,
          order: c.order,
          active: c.active,
        }))}
      />
    </div>
  );
}
