import Link from "next/link";
import { prisma } from "@/lib/prisma";

// 动态渲染：发布后立即展示
export const dynamic = "force-dynamic";

function formatTime(d: Date) {
  const week = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${week} ${String(
    d.getHours()
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default async function TalksPage() {
  const talks = await prisma.talk.findMany({
    where: { visibility: "public" },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">说说</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">碎碎念，随手记录</p>

      <div className="mt-8">
        {talks.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-sm text-zinc-400">
            还没有说说，敬请期待～
          </div>
        ) : (
          <ol className="relative space-y-5 border-l border-white/30 pl-6 dark:border-white/10">
            {talks.map((t) => (
              <li key={t.id} className="relative">
                {/* 时间轴圆点 */}
                <span className="absolute -left-[27px] top-3 h-2.5 w-2.5 rounded-full bg-[#5d7a8a] ring-4 ring-white/40 dark:ring-white/10" />
                <Link
                  href={`/talks/${t.id}`}
                  className="glass block rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{t.content}</p>
                  <p className="mt-3 text-xs text-zinc-400">{formatTime(t.createdAt)}</p>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
