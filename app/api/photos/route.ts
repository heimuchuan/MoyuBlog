import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { removeUpload, saveUpload } from "@/lib/upload-storage";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "photos");
const TYPE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// 上传照片（仅管理员）：线上存 Vercel Blob，本地存 public/uploads/photos/，记录入库
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

  // 时间戳 + 随机串防重名，保留原扩展名
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const stored = await saveUpload({
    blobPath: `photos/${fileName}`,
    localDir: UPLOAD_DIR,
    fileName,
    data: Buffer.from(await file.arrayBuffer()),
    contentType: file.type,
  });

  const title = String(form.get("title") || "").trim();
  const photo = await prisma.photo.create({
    data: { title: title || null, fileName: stored },
  });
  return NextResponse.json(photo);
}

// 删除照片（仅管理员）：删数据库记录 + 删文件
export async function DELETE(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await req.json();
  const photo = await prisma.photo.delete({ where: { id: Number(id) } }).catch(() => null);
  if (photo) {
    await removeUpload(photo.fileName, UPLOAD_DIR);
  }
  return NextResponse.json({ ok: true });
}
