import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import ShowcaseManager from "@/components/admin/ShowcaseManager";

const orderBy = [{ order: "asc" as const }, { id: "asc" as const }];

const getTags = unstable_cache(
  async () => prisma.showcaseTag.findMany({ orderBy }),
  ["admin-showcase-tags"],
  { revalidate: 10, tags: ["showcase-tags"] }
);

const getLinks = unstable_cache(
  async () => prisma.socialLink.findMany({ orderBy }),
  ["admin-social-links"],
  { revalidate: 10, tags: ["social-links"] }
);

export default async function AdminShowcasePage() {
  const [tags, links] = await Promise.all([getTags(), getLinks()]);
  return (
    <div className="space-y-6">
      <h1 className="industrial-zh text-2xl font-bold">大屏</h1>
      <ShowcaseManager
        initialTags={tags.map((t) => ({ id: t.id, name: t.name, order: t.order, active: t.active }))}
        initialLinks={links.map((l) => ({
          id: l.id,
          label: l.label,
          href: l.href,
          icon: l.icon,
          order: l.order,
          active: l.active,
        }))}
      />
    </div>
  );
}
