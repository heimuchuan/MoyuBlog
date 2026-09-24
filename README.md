# MoyuBlog

> 个人摸鱼博客 · 玻璃拟态 + 工业废土风 · Next.js 全栈实践

一个集入口导航、文章、项目、音乐歌单、歌词联动、悬浮宠物、背景轮播、10 秒清屏彩蛋、RAG 智能问答于一体的个人博客系统。前端走玻璃拟态 + 工业废土时间显示，后端用 Prisma + PostgreSQL，RAG 基于 SiliconFlow（BAAI/bge-m3 嵌入 + DeepSeek-V3 对话）。

## 技术栈

- **框架**：Next.js 16 (App Router) + React 19
- **语言**：TypeScript
- **样式**：Tailwind CSS v4（玻璃拟态 + 工业废土风时间显示）
- **ORM**：Prisma 6
- **数据库**：PostgreSQL 18（本地）
- **认证**：NextAuth (Auth.js)
- **RAG**：SiliconFlow（BAAI/bge-m3 嵌入 + deepseek-ai/DeepSeek-V3 对话）
- **文档解析**：pdfjs-dist（PDF）+ mammoth（docx）
- **字体**：Black Ops One（工业风数字）+ 锐字奥运精神拼搏简-闪（工业风中文）

## 功能模块

- **首页**：便当盒布局（矩阵网格 / 中枢链路两种可切换），欢迎卡 + 音乐播放器 + 歌词卡 + 时间技术栈卡 + 六个入口卡
- **文章**：列表 / 详情，Markdown 渲染 + 代码高亮，分类与标签筛选
- **项目**：卡片网格，悬浮放大 + 遮罩加深 + 光斑扫过，点击跳转 GitHub 仓库
- **音乐**：自动扫描 `public/music` 子文件夹生成歌单，LRC 歌词解析（支持双语），三种播放模式（顺序 / 单曲循环 / 随机）
- **问答**：悬浮宠物（灰原哀 Q 版）入口，RAG 检索 + 引用来源
- **后台**：管理员登录，文章 / 分类 / 知识库管理
- **彩蛋**：10 秒无操作卡片散开清屏 + 双击空白触发；主题切换圆形波纹扩散

## 快速开始

```bash
pnpm install
pnpm prisma generate
pnpm prisma db push   # 或 pnpm prisma migrate deploy
pnpm prisma db seed   # 写入管理员 + 示例文章
pnpm dev
```

打开 http://localhost:3000

- 管理员：`admin@moyublog.com` / `admin123456`
- 后台：http://localhost:3000/admin

## 环境变量

在 `.env` 配置（已被 `.gitignore` 忽略）：

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/moyublog?schema=public"
SILICONFLOW_API_KEY="sk-..."
SILICONFLOW_BASE_URL="https://api.siliconflow.cn/v1"
CHAT_MODEL="deepseek-ai/DeepSeek-V3"
EMBED_MODEL="BAAI/bge-m3"
AUTH_SECRET="..."
AUTH_URL="http://localhost:3000"
```

## 目录结构

```
app/
├── (public)/         # 前台：首页 / 文章 / 项目 / 音乐 / 说说 / 照片 / 关于 / 问答
├── admin/            # 后台：登录 + 文章/分类/知识库管理
└── api/             # 接口：文章 CRUD / 知识库上传 / chat / music
components/          # Navbar / MusicPlayer / ChatWidget / BackgroundSlideshow ...
lib/                 # prisma / auth / rag / music / projects
prisma/              # schema.prisma + seed.mjs
public/              # 背景图 / 字体 / music 歌单 / 入口卡片图
```

## 备注

- 数据库已重建为 `moyublog`（旧 `campusblog` 库可手动删除）。
- `session/` 目录下是历史开发会话快照（MoyuBlog1.0/2.0/3.0.md），保留原貌仅供参考。
