import { NextRequest, NextResponse } from "next/server";
import { isReqUnlocked } from "@/lib/ledger-auth";
import { parseDateFromText, todayStr } from "@/lib/ledger-date";
import { prisma } from "@/lib/prisma";

function denied() {
  return NextResponse.json({ error: "请先解锁记账板块" }, { status: 401 });
}

// 查询条目（按日期区间，闭区间）
export async function GET(req: NextRequest) {
  if (!isReqUnlocked(req)) return denied();
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  if (!start || !end) {
    return NextResponse.json({ error: "缺少日期区间" }, { status: 400 });
  }
  const entries = await prisma.ledgerEntry.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: [{ date: "desc" }, { id: "desc" }],
  });
  return NextResponse.json(entries);
}

// 新增条目：金额单位为分；备注自动识别日期
export async function POST(req: NextRequest) {
  if (!isReqUnlocked(req)) return denied();
  const body = await req.json();
  const type = body.type === "income" ? "income" : "expense";
  const amount = Number(body.amount);
  const category = String(body.category || "").trim();
  const rawNote = String(body.note || "");

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "金额必须大于 0" }, { status: 400 });
  }
  if (!category) {
    return NextResponse.json({ error: "请选择分类" }, { status: 400 });
  }

  // 优先用前端识别/手选的日期，否则在服务端再识别一次
  const parsed = parseDateFromText(rawNote);
  const date = typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date)
    ? body.date
    : parsed.date || todayStr();

  const entry = await prisma.ledgerEntry.create({
    data: { type, amount: Math.round(amount), category, note: parsed.cleaned, date },
  });
  return NextResponse.json(entry);
}

// 删除条目
export async function DELETE(req: NextRequest) {
  if (!isReqUnlocked(req)) return denied();
  const { id } = await req.json();
  await prisma.ledgerEntry.delete({ where: { id: Number(id) } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
