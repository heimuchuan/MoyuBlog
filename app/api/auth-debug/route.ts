import { NextResponse } from "next/server";

// 临时诊断接口：只报告 auth 相关环境变量是否存在（不泄露值），用于排查线上 /api/auth/* 500。
// 排查完成后删除此文件。
// 需动态执行，否则会被构建期预渲染、报告的是构建时的环境变量而非运行时。
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    AUTH_SECRET: Boolean(process.env.AUTH_SECRET),
    AUTH_URL: process.env.AUTH_URL ?? null, // URL 非敏感，直接显示便于发现 localhost 误配
    AUTH_GITHUB_ID: Boolean(process.env.AUTH_GITHUB_ID),
    AUTH_GITHUB_SECRET: Boolean(process.env.AUTH_GITHUB_SECRET),
    ADMIN_EMAIL: Boolean(process.env.ADMIN_EMAIL),
    VERCEL_URL: process.env.VERCEL_URL ?? null,
    NODE_ENV: process.env.NODE_ENV ?? null,
  });
}
