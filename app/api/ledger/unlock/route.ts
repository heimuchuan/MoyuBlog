import { NextRequest, NextResponse } from "next/server";
import { checkLedgerPassword, setGateCookie } from "@/lib/ledger-auth";

// 记账板块解锁：校验独立密码，通过后写入签名 httpOnly Cookie
export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (!checkLedgerPassword(String(password || ""))) {
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  setGateCookie(res);
  return res;
}
