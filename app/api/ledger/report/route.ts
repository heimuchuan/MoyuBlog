import { NextRequest, NextResponse } from "next/server";
import { isReqUnlocked } from "@/lib/ledger-auth";
import { listDates, periodRange, todayStr } from "@/lib/ledger-date";
import { prisma } from "@/lib/prisma";

// 周报/月报聚合：收支总额、分类排行、每日收支
export async function GET(req: NextRequest) {
  if (!isReqUnlocked(req)) {
    return NextResponse.json({ error: "请先解锁记账板块" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") === "week" ? "week" : "month";
  const ref = searchParams.get("ref") || todayStr();
  const { start, end, label } = periodRange(ref, period);

  const entries = await prisma.ledgerEntry.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: [{ date: "asc" }, { id: "asc" }],
  });

  let expense = 0;
  let income = 0;
  const catMap = new Map<string, { type: string; count: number; amount: number }>();
  const dayMap = new Map<string, { expense: number; income: number }>();
  for (const d of listDates(start, end)) dayMap.set(d, { expense: 0, income: 0 });

  for (const e of entries) {
    if (e.type === "income") income += e.amount;
    else expense += e.amount;

    const c = catMap.get(e.category) ?? { type: e.type, count: 0, amount: 0 };
    c.count += 1;
    c.amount += e.amount;
    catMap.set(e.category, c);

    const day = dayMap.get(e.date)!;
    day[e.type === "income" ? "income" : "expense"] += e.amount;
  }

  const byCategory = [...catMap.entries()]
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.amount - a.amount);
  const byDay = [...dayMap.entries()].map(([date, v]) => ({ date, ...v }));

  return NextResponse.json({ start, end, label, expense, income, byCategory, byDay, count: entries.length });
}
