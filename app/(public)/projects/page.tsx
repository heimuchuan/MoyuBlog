import { getPublicProjects, getPublicProjectCategories } from "@/lib/public-data";
import ProjectsClient from "./ProjectsClient";

export default async function ProjectsPage() {
  const [projects, categories] = await Promise.all([
    getPublicProjects(),
    getPublicProjectCategories(),
  ]);
  return <ProjectsClient projects={projects} categories={categories} />;
}
