import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 新建相册（仅管理员）
export async function POST(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { name } = await req.json();
  const trimmed = String(name || "").trim();
  if (!trimmed) {
    return NextResponse.json({ error: "相册名不能为空" }, { status: 400 });
  }
  if (trimmed.length > 30) {
    return NextResponse.json({ error: "相册名最长 30 字" }, { status: 400 });
  }

  const album = await prisma.album.create({ data: { name: trimmed } });
  // { expire: 0 }：下次请求阻塞式重验证、立即拿到新数据（后台低频写，不要 stale 旧快照）
  revalidateTag("albums", { expire: 0 });
  return NextResponse.json(album);
}
