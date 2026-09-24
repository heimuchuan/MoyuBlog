import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@moyublog.com";
  const password = process.env.ADMIN_PASSWORD || "admin123456";
  const hashed = await hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { password: hashed },
    create: { email, name: "管理员", password: hashed },
  });
  console.log("管理员账号就绪:", admin.email);

  // 示例分类
  const cat1 = await prisma.category.upsert({
    where: { name: "校园生活" },
    update: {},
    create: { name: "校园生活" },
  });

  // 示例文章（Markdown）
  const existing = await prisma.post.findUnique({ where: { slug: "hello-moyublog" } });
  if (!existing) {
    await prisma.post.create({
      data: {
        title: "欢迎来到校园知识博客",
        slug: "hello-moyublog",
        excerpt: "一篇示例文章，展示 Markdown 渲染与代码高亮效果。",
        content: [
          "# 欢迎来到校园知识博客",
          "",
          "这是一个基于 **Next.js + Prisma + PostgreSQL** 的个人博客与校园智能问答系统。",
          "",
          "## 功能特性",
          "",
          "- 文章展示与 Markdown 渲染",
          "- 分类与标签筛选",
          "- 知识库 + RAG 智能问答",
          "",
          "## 代码示例",
          "",
          "```ts",
          "export function hello(name: string) {",
          "  return `Hello, ${name}!`;",
          "}",
          "```",
          "",
          "> 这是引用块，用于强调重点内容。",
        ].join("\n"),
        published: true,
        authorId: admin.id,
        categoryId: cat1.id,
      },
    });
    console.log("示例文章已创建");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });