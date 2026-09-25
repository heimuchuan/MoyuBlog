// 记账板块二次密码门：独立于 NextAuth，HMAC 签名 httpOnly Cookie
import crypto from "crypto";

export const GATE_COOKIE = "moyu_ledger_gate";

function expectedToken(): string {
  const secret = process.env.AUTH_SECRET || "";
  return crypto.createHmac("sha256", secret).update("moyu-ledger-gate-v1").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/** 校验解锁密码（来自 .env 的 LEDGER_PASSWORD） */
export function checkLedgerPassword(password: string): boolean {
  const expected = process.env.LEDGER_PASSWORD || "";
  if (!expected || !password) return false;
  return safeEqual(password, expected);
}

/** 校验请求携带的门控 Cookie 是否有效 */
export function isUnlocked(token: string | null | undefined): boolean {
  if (!token) return false;
  try {
    return safeEqual(token, expectedToken());
  } catch {
    return false;
  }
}

/** 从 Request 的 Cookie 头读取门控状态（API 路由用） */
export function isReqUnlocked(req: Request): boolean {
  const raw = req.headers.get("cookie") || "";
  const m = raw.split("; ").find((c) => c.startsWith(`${GATE_COOKIE}=`));
  return isUnlocked(m?.split("=")[1]);
}

/** 在响应上写入解锁 Cookie（7 天有效） */
export function setGateCookie(res: Response): void {
  res.headers.append(
    "Set-Cookie",
    `${GATE_COOKIE}=${expectedToken()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
  );
}
