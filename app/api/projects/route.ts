import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, unstable_cache } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TYPE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_SIZE = 10 * 1024 * 1024;

// 列出所有项目（后台用，含停用项，带分类信息）；云端 DB 延迟高，走 tag 缓存
const getProjectsCached = unstable_cache(
  async () =>
    prisma.project.findMany({
      orderBy: [{ order: "asc" }, { id: "asc" }],
      include: { category: true },
    }),
  ["api-projects"],
  { revalidate: 3600, tags: ["projects"] }
);

export async function GET() {
  const list = await getProjectsCached();
  return NextResponse.json(
    list.map((p) => ({
      ...p,
      tags: JSON.parse(p.tags || "[]"),
    }))
  );
}

// 新增项目（仅管理员）
export async function POST(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const form = await req.formData();
  const title = String(form.get("title") || "").trim();
  const slug = String(form.get("slug") || "").trim();
  const description = String(form.get("description") || "").trim();
  const date = String(form.get("date") || "").trim();
  const url = String(form.get("url") || "").trim();
  const categoryId = Number(form.get("categoryId"));
  const order = Number(form.get("order") || "0");
  const span = form.get("span") === "lg" ? "lg" : "sm";
  const active = form.get("active") !== "false";
  const tagsRaw = String(form.get("tags") || "[]");
  const coverUrl = String(form.get("coverUrl") || "").trim(); // 可选：直接填外部 URL

  if (!title || !slug || !url) {
    return NextResponse.json({ error: "标题、标识、项目地址不能为空" }, { status: 400 });
  }

  let tags: string[];
  try {
    tags = JSON.parse(tagsRaw);
    if (!Array.isArray(tags)) tags = [];
  } catch {
    tags = [];
  }

  // 处理封面：优先上传文件，其次用填写的 URL
  let cover = coverUrl || null;
  const file = form.get("cover");
  if (file instanceof File && file.size > 0) {
    const ext = TYPE_EXT[file.type];
    if (!ext) {
      return NextResponse.json({ error: "封面仅支持 jpg / png / webp / gif" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "封面不能超过 10MB" }, { status: 400 });
    }
    const { saveUpload } = await import("@/lib/upload-storage");
    const path = await import("path");
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    cover = await saveUpload({
      blobPath: `projects/${fileName}`,
      localDir: path.join(process.cwd(), "public", "uploads", "projects"),
      fileName,
      data: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
    });
  }

  const cat = await prisma.projectCategory.findUnique({ where: { id: categoryId } });
  if (!cat) {
    return NextResponse.json({ error: "分类不存在" }, { status: 400 });
  }

  try {
    const project = await prisma.project.create({
      data: {
        title,
        slug,
        description,
        cover,
        date,
        url,
        tags: JSON.stringify(tags),
        categoryId,
        order: Number.isFinite(order) ? Math.trunc(order) : 0,
        span,
        active,
      },
      include: { category: true },
    });
    revalidateTag("projects", { expire: 0 });
    return NextResponse.json({ ...project, tags });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "标识已存在" }, { status: 400 });
    }
    throw e;
  }
}
