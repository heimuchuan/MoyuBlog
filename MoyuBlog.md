# MoyuBlog · 个人摸鱼博客

> 玻璃拟态 + 工业废土风 · Next.js 全栈实践 · 个人博客 + 校园 RAG 智能问答

MoyuBlog 是一个集入口导航、文章、项目、音乐歌单、歌词联动、悬浮宠物、背景轮播、清屏彩蛋、RAG 智能问答于一体的个人博客系统。前端走玻璃拟态 + 工业废土风时间显示，后端用 Prisma + PostgreSQL，RAG 基于 SiliconFlow（BAAI/bge-m3 嵌入 + DeepSeek-V3 对话）。

> 项目前身为 CampusBlog，已于 2026-09-24 整体改名为 MoyuBlog（数据库实体同步重建为 `moyublog`）。

---

## 一、项目概述

- **项目名**：MoyuBlog = 个人摸鱼博客 + 校园 RAG 智能问答
- **定位**：练技术的全栈项目，兼顾实用（博客 + 校园生活咨询入口）
- **风格**：玻璃拟态（毛玻璃 + 渐变光斑）+ 工业废土风时间显示（Black Ops One + 锐字奥运精神拼搏简-闪 + 钢铁蓝灰锈斑阴影）
- **管理员**：`admin@moyublog.com` / `admin123456`

---

## 二、技术栈

| 层 | 选型 |
|----|------|
| 框架 | Next.js 16 (App Router) + React 19 |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4（玻璃拟态 + 工业废土风） |
| ORM | Prisma 6 |
| 数据库 | PostgreSQL 18（本地，实体名 `moyublog`） |
| 认证 | NextAuth (Auth.js) |
| RAG 嵌入 | SiliconFlow · BAAI/bge-m3（1024 维） |
| RAG 对话 | SiliconFlow · deepseek-ai/DeepSeek-V3 |
| 文档解析 | pdfjs-dist（PDF）+ mammoth（docx） |
| 字体 | Black Ops One（工业风数字）+ 锐字奥运精神拼搏简-闪（工业风中文） |
| 包管理 | pnpm 10（`node-linker=hoisted` 避免 Windows EBUSY） |

> 注：原规划用 pgvector + 应用层算相似度，当前实现用 PostgreSQL `Float[]` 存向量 + 应用层 cosine 相似度，无需 pgvector 扩展。

---

## 三、功能模块

### 前台

| 模块 | 说明 |
|------|------|
| 首页 | 便当盒布局，**矩阵网格 / 中枢链路** 两种可切换；欢迎卡 + 音乐播放器 + 歌词卡 + 时间技术栈卡 + 六入口卡 |
| 文章 | 列表（分页/时间排序）+ 详情（Markdown + 代码高亮）+ 分类/标签筛选 |
| 项目 | 卡片网格，悬浮放大 + 遮罩加深 + 光斑扫过，点击跳转 GitHub 仓库 |
| 音乐 | 自动扫描 `public/music` 子文件夹生成歌单，LRC 歌词解析（支持双语），三种播放模式（顺序 / 单曲循环 / 随机） |
| 说说 / 照片 / 关于 | 占位页（待填充） |
| 问答 | 右下角悬浮宠物（灰原哀 Q 版）入口，RAG 检索 + 引用来源 |

### 后台

- 管理员登录（NextAuth）
- 文章增删改查（Markdown 编辑）
- 分类管理
- 知识库管理（上传 PDF/docx/txt → 解析 → 切片 → 向量化 → 入库）

### 交互彩蛋

- **10 秒清屏**：无操作 10 秒，卡片向两侧散开 + 导航/宠物/回到顶部按钮淡出 + 背景图完全不透明无模糊；任意操作恢复（也支持双击空白触发）
- **主题切换波纹**：从点击位置扩散的半透明实心圆，单波纹，配合 0.7s 全局颜色过渡
- **导航滚动收起**：向下滚过 80px 自动收起，向上滚/回顶重新展开
- **隐藏滚动条**：保留滚动功能，视觉上不可见（Chrome/Safari/Firefox 兼容）
- **回到顶部按钮**：左下角，滚动超 300px 淡入，与右下角宠物对称

---

## 四、UI/UX 设计要点

- **玻璃拟态**：`.glass` 工具类（半透明 + `backdrop-blur(24px)` + `saturate(180%)` + 135° 渐变高光 + 顶部内高光）
- **背景轮播**：`重生.jpg` / `m3.jpg` 两图淡入淡出轮播（5 秒切换），m3 用 `object-top` 保留头部
- **背景弹幕**：8 条文案从右飘到左，浅蓝 `rgba(173,216,230,0.15)`，夜间发光 + 0.7s 过渡
- **工业废土时间**：时大分中秒小错落，`Black_Ops_One` 数字 + 锐字奥运拼搏简中文，钢铁蓝灰 `#5d7a8a` + 多层 text-shadow 做旧锈斑
- **入口卡片**：`object-cover object-[50%_25%]` 保留人脸，悬浮 `scale-110` + 遮罩加深 + 文字上移 + 倾斜光斑扫过
- **中枢链路**：中间竖线 + 卡片左右交错，`HubCard` 上下两段式（上图 + 下半透明毛玻璃文字区），可拖动锚点沿中线滑动（`computeProgress` 限制在卡片段内，`startScrollY` 基准拖动避免首帧瞬移）
- **悬浮宠物**：灰原哀 Q 版（待机/思考用 `感冒.jpg`，聊天用 `表白.jpg`），呼吸光晕，思考时头顶三个气泡
- **主题过渡**：0.7s 全局颜色过渡，`clip-path`/`scale` 波纹不触碰 `transform/opacity`（避免破坏卡片散开）

---

## 五、数据库设计

6 张表（`prisma/schema.prisma`）：

- `User` — 管理员（email/password/name）
- `Post` — 文章（title/slug/content/excerpt/published/categoryId/tags/views）
- `Category` — 分类
- `Tag` — 标签
- `KnowledgeDoc` — 知识库文档（title/fileName/fileType/content/status）
- `KnowledgeChunk` — 切片（content/embedding `Float[]`，级联删除）
- `QALog` — 问答记录（question/answer/sources JSON）

---

## 六、目录结构

```
app/
├── (public)/         # 前台：首页 / 文章 / 项目 / 音乐 / 说说 / 照片 / 关于 / 问答
├── admin/            # 后台：登录 + 文章/分类/知识库管理
└── api/             # 接口：文章 CRUD / 知识库上传 / chat / music
components/          # Navbar / MusicPlayer / ChatWidget / BackgroundSlideshow / BackToTop / PostCard
lib/                 # prisma / auth / rag / document / music / projects
prisma/              # schema.prisma + seed.mjs
public/              # 背景图 / fonts / music 歌单 / 入口卡片图
session/             # 历史开发会话快照（MoyuBlog1.0/2.0/3.0.md）
```

---

## 七、API 接口

- `POST /api/auth/*` — NextAuth 登录/注销
- `GET/POST/PUT/DELETE /api/posts` — 文章 CRUD
- `GET /api/categories` — 分类
- `POST /api/knowledge/upload` — 知识库文档上传（解析→切片→向量化→入库）
- `GET /api/knowledge` — 知识库列表
- `DELETE /api/knowledge/:id` — 删除文档（级联删切片）
- `POST /api/chat` — RAG 问答（向量化→Top-5 检索→拼 Prompt→生成→返回答案+引用）
- `GET /api/music` — 扫描 `public/music` 子文件夹生成歌单（递归，同名 .lrc 配对）

---

## 八、RAG 核心流程

1. 上传 PDF/docx/txt → `pdfjs-dist`/`mammoth` 解析纯文本
2. 切片（800 字/段 + 100 字重叠）
3. SiliconFlow `bge-m3` 生成 1024 维向量
4. 存 PostgreSQL `KnowledgeChunk.embedding`（`Float[]`）
5. 用户提问 → 向量化 → 应用层 cosine 相似度检索 Top-5
6. 拼接 Prompt（结论先行 + 引用来源）→ DeepSeek-V3 生成
7. 返回答案 + 引用来源（`[1]~[5]`）

**双语歌词解析**（`parseLrc`）：合并同时间戳相邻行（原文 + 中文翻译），用 `isChineseTranslation`（含汉字且不含假名 = 中文翻译）区分，外语原文做主行、翻译做 `trans` 副行。

---

## 九、配置与启动

### 环境变量（`.env`，已被 `.gitignore` 忽略）

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/moyublog?schema=public"
SILICONFLOW_API_KEY="sk-..."
SILICONFLOW_BASE_URL="https://api.siliconflow.cn/v1"
CHAT_MODEL="deepseek-ai/DeepSeek-V3"
EMBED_MODEL="BAAI/bge-m3"
AUTH_SECRET="..."
AUTH_URL="http://localhost:3000"
```

### `.npmrc`

```
node-linker=hoisted
```

Windows 上避免 VSCode/Defender 锁文件导致 `ERR_PNPM_EBUSY`。

### 启动

```bash
pnpm install
pnpm prisma generate
pnpm prisma migrate deploy
pnpm prisma db seed
pnpm dev
```

打开 http://localhost:3000

---

## 十、已完成 / 待办

### 已完成

- 前台全模块（首页便当盒 + 中枢链路切换、文章、项目、音乐歌单、问答）
- 后台（登录 + 文章/分类/知识库管理）
- RAG 全链路（解析→切片→向量化→检索→问答，实测通过）
- 玻璃拟态全局改造 + 背景轮播 + 弹幕
- 工业废土风时间显示 + 锐字奥运拼搏简中文字体
- 入口卡片悬浮效果（放大 + 遮罩 + 光斑 + 人脸裁剪）
- 中枢链路可拖动锚点（跟手修复）
- 主题切换波纹（半透明实心圆，单波纹）
- 10 秒清屏 + 双击触发
- 悬浮宠物灰原哀 Q 版 + 呼吸光晕
- 数据库重建为 `moyublog`，邮箱 `admin@moyublog.com`

### 待办（原规划 P1/P2）

- 全文搜索
- 评论（Giscus）
- 访问统计
- RSS
- SEO 优化
- 图片上传到文章
- 草稿箱
- 说说 / 照片 / 关于 页面填充
- 部署到 Vercel
- 多轮对话 / 意图识别（RAG 增强）

---

## 十一、已知遗留

- `admin@campus.com` 旧账号：旧 `campusblog` 库已删，无残留
- `session/` 历史会话快照保留原貌（含 `campusblog` 字样），仅供参考
- 中枢链路锚点「刚开始拖动时锚点不动」的问题未完全闭环（按下时进度为 0，锚点停顶端，需指针位移累积才滑动）

---

## 十二、练到的技术点

- Next.js 16 App Router + React 19 服务端/客户端组件
- Prisma 6 + PostgreSQL 迁移与 seed
- NextAuth (Auth.js) 认证
- RAG 全链路（文档解析→切片→向量化→检索→生成）
- Tailwind CSS v4 玻璃拟态 + 工业废土风设计
- 自定义事件总线（清屏状态联动，无 zustand）
- `requestAnimationFrame` 节流 + `position: fixed` 拖动跟手优化
- `clip-path`/`scale` 主题波纹（避开全局 transition 冲突）
- LRC 双语歌词解析与时间戳对齐修复
- pnpm `node-linker=hoisted` 解决 Windows EBUSY
