import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import DanmakuManager from "@/components/admin/DanmakuManager";

const orderBy = [{ order: "asc" as const }, { id: "asc" as const }];

const getDanmaku = unstable_cache(
  async () => prisma.danmaku.findMany({ orderBy }),
  ["admin-danmaku"],
  { revalidate: 10, tags: ["danmaku"] }
);

export default async function AdminDanmakuPage() {
  const list = await getDanmaku();
  return (
    <div className="space-y-6">
      <h1 className="industrial-zh text-2xl font-bold">弹幕</h1>
      <DanmakuManager
        initial={list.map((d) => ({
          id: d.id,
          text: d.text,
          top: d.top,
          dur: d.dur,
          order: d.order,
          active: d.active,
        }))}
      />
    </div>
  );
}
