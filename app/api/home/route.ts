import { NextResponse } from "next/server";
import { getHomeData } from "@/lib/public-data";

// 首页聚合数据：走 unstable_cache（tag: home/photos/talks/posts），后台写操作主动失效
export const revalidate = 600;

export async function GET() {
  const { recentPosts, ...rest } = await getHomeData();
  // 定时发布：在请求时按当前时间挑第一篇已到点的作为「最新文章」（缓存内不做时间判断，故到点即上线）
  const now = Date.now();
  const latestPost =
    recentPosts.find((p) => !p.publishAt || new Date(p.publishAt).getTime() <= now) ?? null;
  // 禁止浏览器缓存：首页客户端组件每次挂载都应拿到最新聚合（服务端已有 unstable_cache 兜性能）
  return NextResponse.json({ ...rest, latestPost }, { headers: { "Cache-Control": "no-store" } });
}
