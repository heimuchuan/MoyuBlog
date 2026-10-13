import { NextResponse } from "next/server";
import { getHomeData } from "@/lib/public-data";

// 首页聚合数据：走 unstable_cache（tag: home/photos/talks/posts），后台写操作主动失效
export const revalidate = 600;

export async function GET() {
  const data = await getHomeData();
  return NextResponse.json(data);
}
