import { getPublicProjects, getPublicProjectCategories } from "@/lib/public-data";
import ProjectsClient from "./ProjectsClient";

// 数据由 unstable_cache 承担缓存（tag: projects）；改为动态渲染，避免构建期查库
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, categories] = await Promise.all([
    getPublicProjects(),
    getPublicProjectCategories(),
  ]);
  return <ProjectsClient projects={projects} categories={categories} />;
}
