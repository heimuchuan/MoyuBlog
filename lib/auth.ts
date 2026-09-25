import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getToken } from "@auth/core/jwt";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const ok = await compare(password, user.password);
        if (!ok) return null;
        return { id: String(user.id), email: user.email, name: user.name };
      },
    }),
  ],
});

/**
 * 在 API 路由中直接从请求读取 session（绕过 headers() 兼容问题）
 * NextAuth 的 auth() 在 Next.js 16 API 路由中无法正确读取 cookie，
 * 此函数直接从 req.headers 解析 JWT cookie 并解密。
 */
export async function getAuthSession(req: Request) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  const secureCookie = process.env.AUTH_URL?.startsWith("https://") ?? false;
  try {
    const token = await getToken({ req, secret, secureCookie });
    if (!token?.sub) return null;
    return { user: { id: token.sub } };
  } catch {
    return null;
  }
}