import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChevronLeftIcon } from "@/components/Icons";

// 说说随发布实时变化
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

function formatTime(d: Date) {
  const week = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${week} ${String(
    d.getHours()
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default async function TalkDetailPage({ params }: Params) {
  const { id } = await params;
  // 私密说说对外视为不存在
  const talk = await prisma.talk.findFirst({
    where: { id: Number(id), visibility: "public" },
  });
  if (!talk) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link
        href="/talks"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 transition hover:text-[#5d7a8a]"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        返回说说
      </Link>

      <article className="glass rounded-2xl p-7">
        <p className="whitespace-pre-wrap break-words text-base leading-8">{talk.content}</p>
        <p className="mt-6 border-t border-white/20 pt-4 text-xs text-zinc-400 dark:border-white/10">
          {formatTime(talk.createdAt)}
        </p>
      </article>
    </div>
  );
}
