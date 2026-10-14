import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import GuestbookManager from "@/components/admin/GuestbookManager";

const getMessages = unstable_cache(
  async () => {
    const list = await prisma.guestbookMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    // 在缓存函数内转成可序列化的纯数据（unstable_cache 返回值会走 JSON，Date 会变字符串）
    return list.map((m) => ({
      id: m.id,
      name: m.name,
      content: m.content,
      avatarUrl: m.avatarUrl,
      githubLogin: m.githubLogin,
      ip: m.ip,
      createdAt: m.createdAt.toISOString(),
    }));
  },
  ["admin-guestbook"],
  { revalidate: 10, tags: ["guestbook"] },
);

export default async function AdminGuestbookPage() {
  const list = await getMessages();
  return (
    <div className="space-y-6">
      <h1 className="industrial-zh text-2xl font-bold">留言</h1>
      <GuestbookManager initial={list} />
    </div>
  );
}
