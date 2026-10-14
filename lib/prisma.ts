import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 给远程数据库 URL 追加连接池参数，减少每次查询的连接建立开销
function buildDbUrl() {
  const base = process.env.DATABASE_URL;
  if (!base) return base;
  const sep = base.includes("?") ? "&" : "?";
  // connection_limit: 连接池大小；pool_timeout: 等待可用连接的超时（秒）
  // connect_timeout: 建立连接的超时（秒）。云端实例空闲后会挂起，冷启动唤醒实测需 3s+，
  //   默认 5s 会直接抛 P1001（Can't reach database server）导致整页 500，故放宽到 30s
  return `${base}${sep}connection_limit=10&pool_timeout=10&connect_timeout=30`;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
    datasourceUrl: buildDbUrl(),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

