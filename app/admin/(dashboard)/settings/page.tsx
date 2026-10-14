import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import AvatarManager from "@/components/admin/AvatarManager";

const getAvatar = unstable_cache(
  async () => prisma.siteConfig.findUnique({ where: { key: "avatar" } }),
  ["admin-site-avatar"],
  { revalidate: 10, tags: ["site-config"] }
);

export default async function AdminSettingsPage() {
  const row = await getAvatar();
  return (
    <div className="space-y-6">
      <h1 className="industrial-zh text-2xl font-bold">设置</h1>
      <AvatarManager initialRef={row?.value ?? null} />
    </div>
  );
}
