---
name: moyublog-admin-module
description: 在 MoyuBlog（Next.js 16 + Prisma + NextAuth v5）中搭建新的后台管理模块。当用户要求新增后台 CRUD 功能、管理页面、数据模型及配套 API（如照片管理、记账本一类模块）时使用。不用于纯前台页面、纯样式调整或与数据库无关的改动。
---

# MoyuBlog 后台模块搭建流程

在本仓库新增一个「数据模型 + 受保护 API + 玻璃拟态后台页 + 导航入口 + 验证」的模块时，严格按本流程执行。每一步都对应本项目踩过的真实坑，不要跳过。

## 0. 先判断范围

需要本流程：新建 Prisma 模型、后台增删改查、文件上传、独立密码门等。
不需要：改文案/样式、只加前台展示页（直接写 server component 查 prisma 即可）。

## 1. 数据模型与迁移（Windows 必做顺序）

1. 在 `prisma/schema.prisma` 加 model，字段注释写中文；金额一律 `Int`（单位分），日期自然日一律 `String`（YYYY-MM-DD），查询字段加 `@@index`。
2. **先停 dev server**：Windows 下 dev server 锁住 `node_modules/.prisma/client/query_engine-windows.dll.node`，直接 migrate 会报 `EPERM rename ... .tmp`。
   - 停掉运行中的 `pnpm dev`（找占用 3000 端口的 PID：`netstat -ano | findstr :3000`，再 `taskkill /PID <pid> /F`）。
3. 执行迁移：`pnpm exec prisma migrate dev --name <snake_case_name>`（migration 落库 + client 重新生成一步完成）。
   - 若 client 生成仍因锁失败，确认 dev server 已死后单独跑 `pnpm exec prisma generate`。
4. 重启 `pnpm dev`（后台运行）。
5. 数据库改坏了要重建时：migrate 以 `prisma/migrations/` 目录为准，不要手改库。

## 2. API 路由（app/api/<module>/route.ts）

**鉴权必须用 `getAuthSession(req)`，不要用 `await auth()`**：
NextAuth v5 beta.32 的 `auth()` 内部调 `next/headers` 的 `headers()`，在 Next.js 16 API 路由里读不到 cookie，所有写操作会返回 401（本项目已实际踩中并全量替换）。

标准写法：

```ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const body = await req.json();
  // ...校验 + prisma 操作
  return NextResponse.json(row);
}
```

- 动态路由 `app/api/x/[id]/route.ts`：Next 16 的 params 是 Promise，签名 `PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> })`，内部 `const { id } = await params`。
- 文件上传：`const form = await req.formData()`、`form.get("file") as File`、`Buffer.from(await file.arrayBuffer())`、`fs/promises` 的 `mkdir(dir, { recursive: true })` + `writeFile`；文件名用 `${Date.now()}-${random}.${ext}` 防重名，存 `public/uploads/<module>/`；删除记录时同时 `unlink` 文件（`.catch(() => {})` 容错）。
- 表单标签类多对多（Post↔Tag）用 `connectOrCreate`；编辑时先 `set: []` 再连接。
- 需要比管理员登录更强的隔离（私密板块）时，参考 `lib/ledger-auth.ts`：HMAC 签名的 httpOnly Cookie + 独立密码（`.env`），页面 server 端用 `cookies()` 校验，每个 API 用 `isReqUnlocked(req)` 校验，缺一不可。

## 3. 后台页面与组件

- 页面：`app/admin/(dashboard)/<module>/page.tsx`，server component 直接查 prisma 首屏直出；纯交互逻辑放 `"use client"` 组件于 `components/<module>/` 或 `components/admin/`。
- 页面骨架：`<h1 className="industrial-zh mb-6 text-2xl font-bold">标题</h1>` + `.glass rounded-2xl p-6` 卡片。
- **加导航入口**：`components/admin/AdminNav.tsx` 的 `links` 数组追加一项即可，前缀高亮自动生效。
- 客户端数据更新：**不要指望 `router.refresh()` 重置 client 组件的 useState**（App Router 下不会重挂载）。新增/删除成功后由父组件传回调，重新 fetch 后 `setState`；或在子组件内部维护 state。
- 自定义下拉/弹层：不要用原生 `<select>`（option 弹层由系统渲染无法美化），用按钮 + 绝对定位菜单 + 点击外部/Esc 关闭，参考 `components/admin/PostForm.tsx` 的分类选择。
- 输入框/按钮/毛玻璃样式 token 见 [references/ui-style.md](references/ui-style.md)，不要自己发明配色。

## 4. 前台展示（仅当模块需要）

- 动态路由 params 同样是 Promise。
- **中文 slug/分类名必须 `decodeURIComponent` 后再查库**（包 try/catch 保留原值），否则 URL 百分号编码直接查库导致 404。参考 `app/(public)/posts/[slug]/page.tsx`。
- 数据会被后台随时改变的页面，顶部加 `export const dynamic = "force-dynamic"`，否则生产构建被静态化后不更新。
- Link 的中文 href 要 `encodeURIComponent`（`<Link>` 会自动编码手写路径，手工拼字符串时注意）。

## 5. 数据与工具约定

- 钱：整数分；展示用 `(cents/100).toLocaleString("zh-CN", {minimumFractionDigits:2})`。
- 日期：本地时区 YYYY-MM-DD 字符串，工具函数放 `lib/`（参考 `lib/ledger-date.ts` 的 `fmtDate`，禁止用 `toISOString().slice(0,10)`，那是 UTC 会跨日）。
- 密码：bcryptjs 比对（用户体系）或 `crypto.timingSafeEqual`（门控），禁止明文比较/存储。
- 中文 CSV 导出：内容前加 `\uFEFF` BOM，filename 用 `filename*=UTF-8''<encodeURIComponent>`。

## 6. 验证（三步，缺一不可）

1. `pnpm exec tsc --noEmit` 零错误。Prisma 的 `String` 联合字段（如 type）传给 client 组件时显式断言字面量类型。
2. API 端到端：**用 Node `.mjs` + 原生 fetch**（模板见 [assets/e2e-template.mjs](assets/e2e-template.mjs)）。不要用 PowerShell 5.1 写测试：它按 GBK 读 UTF-8 脚本导致中文乱码，且 `curl.exe -d` 的 JSON 双引号会被吃掉。临时脚本用完即删。
   - 登录流程：GET `/api/auth/csrf` 拿 cookie+token → POST `/api/auth/callback/credentials`（form-urlencoded）→ 之后所有请求带合并后的 Cookie。
   - 必测：未登录 401、错误凭证 401、正常增查删、边界值、测试数据清理回 0。
3. UI 用 browser agent 验证：登录 → 入口 → 页面渲染 → 实际交互（填表单/点保存）→ 删除 → 确认前台无不该出现的入口。

## 7. 收尾

- 删除所有临时验证脚本和测试文件（含 `%TEMP%` 里的）。
- 改了 `.env` 必须重启 dev server 才生效。
- 不主动 commit；用户要求时再提交。
- 完成后向用户报告：新增/修改文件清单、验证结果、默认密码/路径等需要他知道的信息。
