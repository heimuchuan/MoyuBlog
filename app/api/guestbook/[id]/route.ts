import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 删除留言（仅管理员，先发后审的"后审"手段）
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) {
    return NextResponse.json({ error: "参数错误" }, { status: 400 });
  }
  await prisma.guestbookMessage.delete({ where: { id: numId } });
  revalidateTag("guestbook", { expire: 0 });
  return NextResponse.json({ ok: true });
}
