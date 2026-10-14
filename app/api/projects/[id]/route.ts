import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TYPE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_SIZE = 10 * 1024 * 1024;

// 修改项目（仅管理员）：表单上传，支持部分更新
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const form = await req.formData();

  const existing = await prisma.project.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }

  const data: any = {};
  if (form.has("title")) data.title = String(form.get("title") || "").trim();
  if (form.has("slug")) data.slug = String(form.get("slug") || "").trim();
  if (form.has("description")) data.description = String(form.get("description") || "").trim();
  if (form.has("date")) data.date = String(form.get("date") || "").trim();
  if (form.has("url")) data.url = String(form.get("url") || "").trim();
  if (form.has("categoryId")) data.categoryId = Number(form.get("categoryId"));
  if (form.has("order")) data.order = Math.trunc(Number(form.get("order") || "0"));
  if (form.has("span")) data.span = form.get("span") === "lg" ? "lg" : "sm";
  if (form.has("active")) data.active = form.get("active") !== "false";
  if (form.has("tags")) {
    try {
      const tags = JSON.parse(String(form.get("tags") || "[]"));
      data.tags = JSON.stringify(Array.isArray(tags) ? tags : []);
    } catch {
      data.tags = "[]";
    }
  }

  // 封面：优先上传文件，其次用填写的 URL，传 "clear" 则清空
  if (form.has("coverUrl")) {
    const coverUrl = String(form.get("coverUrl") || "").trim();
    data.cover = coverUrl || null;
  }
  const file = form.get("cover");
  if (file instanceof File && file.size > 0) {
    const ext = TYPE_EXT[file.type];
    if (!ext) {
      return NextResponse.json({ error: "封面仅支持 jpg / png / webp / gif" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "封面不能超过 10MB" }, { status: 400 });
    }
    const { saveUpload, removeUpload } = await import("@/lib/upload-storage");
    const path = await import("path");
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const stored = await saveUpload({
      blobPath: `projects/${fileName}`,
      localDir: path.join(process.cwd(), "public", "uploads", "projects"),
      fileName,
      data: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
    });
    // 删除旧封面
    if (existing.cover) {
      await removeUpload(existing.cover, path.join(process.cwd(), "public", "uploads", "projects"));
    }
    data.cover = stored;
  }

  // 必填校验
  if (data.title !== undefined && !data.title) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  }
  if (data.slug !== undefined && !data.slug) {
    return NextResponse.json({ error: "标识不能为空" }, { status: 400 });
  }
  if (data.url !== undefined && !data.url) {
    return NextResponse.json({ error: "项目地址不能为空" }, { status: 400 });
  }
  if (data.categoryId !== undefined) {
    const cat = await prisma.projectCategory.findUnique({ where: { id: data.categoryId } });
    if (!cat) return NextResponse.json({ error: "分类不存在" }, { status: 400 });
  }

  try {
    const project = await prisma.project.update({
      where: { id: Number(id) },
      data,
      include: { category: true },
    });
    revalidateTag("projects", { expire: 0 });
    return NextResponse.json({ ...project, tags: JSON.parse(project.tags || "[]") });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "标识已存在" }, { status: 400 });
    }
    throw e;
  }
}

// 删除项目（仅管理员）：删数据库 + 删封面文件
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const project = await prisma.project.delete({ where: { id: Number(id) } }).catch(() => null);
  if (project?.cover) {
    const { removeUpload } = await import("@/lib/upload-storage");
    const path = await import("path");
    await removeUpload(project.cover, path.join(process.cwd(), "public", "uploads", "projects"));
  }
  revalidateTag("projects", { expire: 0 });
  return NextResponse.json({ ok: true });
}
