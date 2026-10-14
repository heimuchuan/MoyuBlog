import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { getToken } from "@auth/core/jwt";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

/** token/session 上的自定义字段类型（角色 + GitHub 访客资料） */
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      /** admin=管理员（可进后台）；visitor=GitHub 访客 */
      role?: string;
      avatarUrl?: string | null;
      githubLogin?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string;
    ghName?: string | null;
    ghAvatar?: string | null;
    ghLogin?: string | null;
  }
}

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
    // 访客留言用的 GitHub 登录（未配置 AUTH_GITHUB_ID/SECRET 时按钮隐藏）
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    jwt({ token, account, profile }) {
      if (account?.provider === "credentials") {
        token.role = "admin";
      } else if (account?.provider === "github" && profile) {
        const p = profile as { login?: string; avatar_url?: string; name?: string; email?: string };
        token.ghLogin = p.login ?? null;
        token.ghAvatar = p.avatar_url ?? null;
        token.ghName = p.name || p.login || null;
        // GitHub 邮箱与管理员邮箱一致时视为站长，同样授予后台权限
        token.role =
          p.email && process.env.ADMIN_EMAIL && p.email === process.env.ADMIN_EMAIL
            ? "admin"
            : "visitor";
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      session.user.role = token.role;
      session.user.avatarUrl = token.ghAvatar ?? null;
      session.user.githubLogin = token.ghLogin ?? null;
      if (token.ghName) session.user.name = token.ghName;
      return session;
    },
  },
});

/**
 * 后台接口鉴权：仅放行 role=admin 的会话。
 * NextAuth 的 auth() 在 Next.js 16 API 路由中无法正确读取 cookie，
 * 此函数直接从 req.headers 解析 JWT cookie 并解密。
 */
export async function getAuthSession(req: Request) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  const secureCookie = process.env.AUTH_URL?.startsWith("https://") ?? false;
  try {
    const token = await getToken({ req, secret, secureCookie });
    if (!token?.sub || token.role !== "admin") return null;
    return { user: { id: token.sub } };
  } catch {
    return null;
  }
}

/** 前台访客会话（GitHub 登录留言用，匿名访客返回 null） */
export async function getVisitorSession(req: Request) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  const secureCookie = process.env.AUTH_URL?.startsWith("https://") ?? false;
  try {
    const token = await getToken({ req, secret, secureCookie });
    if (!token?.sub) return null;
    return {
      user: {
        id: token.sub,
        role: token.role ?? "visitor",
        name: token.ghName ?? token.name ?? null,
        avatarUrl: token.ghAvatar ?? null,
        githubLogin: token.ghLogin ?? null,
      },
    };
  } catch {
    return null;
  }
}
