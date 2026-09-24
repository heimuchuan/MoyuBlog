// 将标题转成 URL 友好的 slug（保留中文，便于中文标题直接作为路径）
export function slugify(text: string): string {
  const s = text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]/g, "");
  return s || `post-${Date.now()}`;
}

// 生成唯一 slug：若已存在则在末尾追加短随机串
export async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
  const { prisma } = await import("./prisma");
  let slug = slugify(base);
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (!existing || existing.id === excludeId) return slug;
  let i = 2;
  while (true) {
    const candidate = `${slug}-${i}`;
    const found = await prisma.post.findUnique({ where: { slug: candidate } });
    if (!found || found.id === excludeId) return candidate;
    i++;
  }
}