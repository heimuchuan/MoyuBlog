import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GATE_COOKIE, isUnlocked } from "@/lib/ledger-auth";
import { periodRange, todayStr } from "@/lib/ledger-date";
import LedgerApp from "@/components/ledger/LedgerApp";

export const dynamic = "force-dynamic";

export default async function LedgerPage() {
  // 二次密码门：无有效签名 Cookie 一律跳转解锁页
  const store = await cookies();
  if (!isUnlocked(store.get(GATE_COOKIE)?.value)) {
    redirect("/admin/ledger/unlock");
  }

  // 首屏直出本月数据（之后由客户端按区间拉取）
  const { start, end } = periodRange(todayStr(), "month");
  const entries = await prisma.ledgerEntry.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: [{ date: "desc" }, { id: "desc" }],
  });

  return (
    <div>
      <h1 className="industrial-zh mb-6 text-2xl font-bold">记账本</h1>
      <LedgerApp
        initialEntries={entries.map((e) => ({
          id: e.id,
          type: e.type as "expense" | "income",
          amount: e.amount,
          category: e.category,
          note: e.note,
          date: e.date,
        }))}
        monthStart={start}
      />
    </div>
  );
}
