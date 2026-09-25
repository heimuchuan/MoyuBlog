import { prisma } from "@/lib/prisma";
import TalkComposer from "@/components/admin/TalkComposer";
import TalkVisibilityToggle from "@/components/admin/TalkVisibilityToggle";
import DeleteButton from "@/components/admin/DeleteButton";

function formatTime(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default async function AdminTalksPage() {
  const talks = await prisma.talk.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const privateCount = talks.filter((t) => t.visibility === "private").length;
  const publicCount = talks.length - privateCount;

  return (
    <div className="space-y-6">
      <h1 className="industrial-zh text-2xl font-bold">说说</h1>

      <TalkComposer />

      <div className="glass rounded-2xl p-6">
        <h2 className="industrial-zh mb-4 text-sm text-zinc-400">
          全部说说（{talks.length}）· 公开 {publicCount} · 私密 {privateCount}
        </h2>
        {talks.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-400">还没有说说，发一条试试</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {talks.map((t) => (
              <li key={t.id} className="group flex items-start justify-between gap-4 py-4">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <TalkVisibilityToggle
                      id={t.id}
                      visibility={t.visibility as "public" | "private"}
                    />
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{t.content}</p>
                  <p className="mt-1 text-xs text-zinc-400">{formatTime(t.createdAt)}</p>
                </div>
                <DeleteButton
                  url="/api/talks"
                  body={{ id: t.id }}
                  confirmText="确定删除这条说说吗？"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
