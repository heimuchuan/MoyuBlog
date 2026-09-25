import { NextRequest } from "next/server";
import { isReqUnlocked } from "@/lib/ledger-auth";
import { getCategory } from "@/lib/ledger-categories";
import { periodRange, todayStr, weekdayStr, yuan } from "@/lib/ledger-date";
import { prisma } from "@/lib/prisma";

function csvCell(s: string): string {
  // 含逗号/引号/换行时按 CSV 规则转义
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// 周报/月报 CSV 导出（UTF-8 BOM，Excel 直接打开不乱码）
export async function GET(req: NextRequest) {
  if (!isReqUnlocked(req)) {
    return new Response("请先解锁记账板块", { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") === "week" ? "week" : "month";
  const ref = searchParams.get("ref") || todayStr();
  const { start, end, label } = periodRange(ref, period);

  const entries = await prisma.ledgerEntry.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: [{ date: "asc" }, { id: "asc" }],
  });

  const rows = ["日期,星期,类型,分类,备注,金额(元)"];
  let exp = 0;
  let inc = 0;
  for (const e of entries) {
    if (e.type === "income") inc += e.amount;
    else exp += e.amount;
    const cat = getCategory(e.type, e.category);
    rows.push(
      [
        e.date,
        weekdayStr(e.date),
        e.type === "income" ? "收入" : "支出",
        cat.label,
        csvCell(e.note),
        yuan(e.amount),
      ].join(",")
    );
  }
  rows.push(`合计支出（元）,,,,,${yuan(exp)}`);
  rows.push(`合计收入（元）,,,,,${yuan(inc)}`);
  rows.push(`结余（元）,,,,,${yuan(inc - exp)}`);

  const bom = "\uFEFF";
  const filename = `记账报告_${label.replace(/[ ~]/g, "_")}.csv`;
  return new Response(bom + rows.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
