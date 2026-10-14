import { NextRequest, NextResponse } from "next/server";
import { fetchNeteaseSongUrl } from "@/lib/music-server";

export const dynamic = "force-dynamic";

// 单曲播放代理：前端 audio 请求本接口，服务端带 Cookie 实时解析最新 CDN 地址后 302 跳转。
// 音频流量不走本站，只做一次轻量 API 调用；真实地址有时效，内存缓存 10 分钟。
const TTL_MS = 10 * 60 * 1000;

const urlCache = new Map<string, { url: string; expires: number }>();

// 简单限流：每 IP 每分钟最多 30 次解析（serverless 下各实例独立计数，个人博客量级够用）
const RATE_LIMIT = 30;
const rateMap = new Map<string, { count: number; resetAt: number }>();

export async function GET(req: NextRequest) {
  const songId = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^\d+$/.test(songId)) {
    return NextResponse.json({ error: "无效的歌曲 ID" }, { status: 400 });
  }

  // 限流检查
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const hit = rateMap.get(ip);
  if (!hit || hit.resetAt < now) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 });
  } else if (++hit.count > RATE_LIMIT) {
    return NextResponse.json({ error: "请求过于频繁" }, { status: 429 });
  }

  // 缓存命中直接 302
  const cached = urlCache.get(songId);
  if (cached && cached.expires > now) {
    return NextResponse.redirect(cached.url, 302);
  }

  const url = await fetchNeteaseSongUrl(songId);
  if (!url) {
    // 无版权 / 解析失败（Cookie 失效时 VIP 歌也会走到这里）
    return NextResponse.json({ error: "该歌曲暂无可用播放地址" }, { status: 404 });
  }

  urlCache.set(songId, { url, expires: now + TTL_MS });
  return NextResponse.redirect(url, 302);
}
