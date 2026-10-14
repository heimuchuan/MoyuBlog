import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import path from "path";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { removeUpload, saveUpload } from "@/lib/upload-storage";
import { avatarUrl } from "@/lib/photo-url";
import { getSiteAvatar } from "@/lib/public-data";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "avatar");
const TYPE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const KEY = "avatar";

// 当前头像地址（公开）：无配置时回退默认 /avatar.jpg
export async function GET() {
  const ref = await getSiteAvatar();
  return NextResponse.json({ url: avatarUrl(ref) });
}

// 上传/更换头像（仅管理员）：旧文件一并删除，仅保留当前一张
export async function POST(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "请选择图片文件" }, { status: 400 });
  }
  const ext = TYPE_EXT[file.type];
  if (!ext) {
    return NextResponse.json({ error: "仅支持 jpg / png / webp / gif" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "图片不能超过 10MB" }, { status: 400 });
  }

  // 时间戳 + 随机串防重名
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const stored = await saveUpload({
    blobPath: `avatar/${fileName}`,
    localDir: UPLOAD_DIR,
    fileName,
    data: Buffer.from(await file.arrayBuffer()),
    contentType: file.type,
  });

  // 旧头像文件先查出来，写入成功后再删，避免上传失败把旧图弄丢
  const old = await prisma.siteConfig.findUnique({ where: { key: KEY } });
  const row = await prisma.siteConfig.upsert({
    where: { key: KEY },
    update: { value: stored },
    create: { key: KEY, value: stored },
  });
  if (old?.value) await removeUpload(old.value, UPLOAD_DIR);

  revalidateTag("site-config", { expire: 0 });
  return NextResponse.json({ url: avatarUrl(row.value) });
}

// 恢复默认头像（仅管理员）：删配置记录 + 删文件，前台回退 /avatar.jpg
export async function DELETE(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const old = await prisma.siteConfig.findUnique({ where: { key: KEY } });
  if (old?.value) {
    await removeUpload(old.value, UPLOAD_DIR);
    await prisma.siteConfig.delete({ where: { key: KEY } }).catch(() => {});
    revalidateTag("site-config", { expire: 0 });
  }
  return NextResponse.json({ url: avatarUrl(null) });
}
