# 后台 UI 风格统一改造

## Context

MoyuBlog 前台已用玻璃拟态（`.glass`）+ 工业废土风（`.rust-text` / `.industrial-zh` 钢铁蓝灰 `#5d7a8a` + 锐字拼搏简）做了精致风格化。但后台 `/admin` 全是基础 Tailwind（白卡 `rounded-2xl border bg-white/70` + indigo 按钮），和前台风格断层。

本次把后台改造成与前台统一的玻璃拟态 + 工业风点缀，让全站风格连贯。后台是工作区，不照搬前台炫酷布局（便当盒/清屏/锚点等），保留常规管理后台结构（顶栏 + 主区），只在质感上统一。

## 设计决策（已和用户确认）

1. **背景层**：BackgroundSlideshow 是全局根布局挂载（`app/layout.tsx`），后台路由共享。在后台区域加一层**半透明深色遮罩**（`bg-black/40`）压暗背景，既保留 `.glass` 模糊质感又便于专注工作。
2. **工业风程度**：标题/数字点缀。顶栏 "MoyuBlog·后台" logo + 各页大标题用 `.industrial-zh` 工业黑体；统计数字用 `.rust-text` 锈斑。按钮/输入框/正文保持正常，不强行工业风。
3. **配色协调**：主按钮由 `indigo-500` 改为钢铁蓝灰 `#5d7a8a`（与工业风配色协调，属配色统一非过度点缀）；输入框 focus 边框同步用 `#5d7a8a`。

## 复用的现有工具（globals.css）

- `.glass`（L77-88）：玻璃拟态卡片，含 dark 模式。前台范式：`Navbar` 用 `.glass sticky top-0`，`PostCard` 用 `.glass rounded-3xl p-5`。
- `.rust-text`（L156-164）：钢铁蓝灰 `#5d7a8a` + 多层做旧 text-shadow。
- `.industrial-zh`（L189-198）：REEJI-PinboGB 工业黑体 + 做旧阴影。

## 共性改造模式（写一次，各文件套用）

| 现状 | 改成 |
|------|------|
| 卡片容器 `rounded-2xl border border-black/5 bg-white/70` | `.glass rounded-2xl`（dark 模式自动跟随） |
| 大标题 `text-2xl font-bold` | 追加 `.industrial-zh`（工业黑体） |
| 统计数字 `text-3xl font-bold` | 追加 `.rust-text`（锈斑） |
| 主按钮 `rounded-xl bg-indigo-500 ... hover:bg-indigo-600` | `bg-[#5d7a8a] hover:bg-[#4a6470]` |
| 输入框 `rounded-xl border border-black/10 bg-white focus:border-indigo-400` | `bg-white/60 border-white/20 focus:border-[#5d7a8a]`（半透明 + 工业 focus） |
| 后台顶栏 | 追加 `.glass sticky top-0 z-10` |
| 后台背景 | 加 `<div className="fixed inset-0 -z-10 bg-black/40" />` 压暗遮罩 |

## 关键文件清单 + 改动

### 1. 后台布局 `app/admin/(dashboard)/layout.tsx`
- 最外层加压暗遮罩 `<div className="fixed inset-0 -z-10 bg-black/40" />`（盖住 BackgroundSlideshow）
- `header` 追加 `.glass sticky top-0 z-10 rounded-none border-x-0 border-t-0`（吸顶玻璃栏）
- 在 nav 前加 "MoyuBlog · 后台" 文字 + `.industrial-zh text-sm`
- nav 链接 active 态用钢铁蓝灰下划线

### 2. 登录页 `app/admin/login/page.tsx`
- 加压暗遮罩（同上）
- 登录卡 `rounded-2xl border bg-white/70 backdrop-blur-xl` → `.glass rounded-3xl p-8`
- 标题 "MoyuBlog" 或 "登录后台" 加 `.industrial-zh`
- 输入框 + 按钮套用共性模式

### 3. 仪表盘 `app/admin/(dashboard)/page.tsx`
- "概览" 标题加 `.industrial-zh`
- 4 个统计卡 `border bg-white/70` → `.glass`
- 统计数字 `text-3xl font-bold` 加 `.rust-text`

### 4. 文章列表 `app/admin/(dashboard)/posts/page.tsx`
- "文章" 标题加 `.industrial-zh`
- 表格容器用 `.glass` 包裹（`overflow-x-auto` 保留）
- "新建文章" 按钮改钢铁蓝灰

### 5. 文章表单 `components/admin/PostForm.tsx` + `posts/new/page.tsx` + `posts/[id]/edit/page.tsx`
- 表单外层容器加 `.glass rounded-2xl p-6`
- 输入框套用共性模式（半透明 + 工业 focus）
- 提交按钮改钢铁蓝灰
- 页面标题加 `.industrial-zh`

### 6. 分类管理 `app/admin/(dashboard)/categories/page.tsx` + `components/admin/AddCategoryForm.tsx`
- 列表 `<ul>` 容器加 `.glass rounded-2xl p-4`
- "分类管理" 标题 `.industrial-zh`
- AddCategoryForm 输入框 + 按钮套共性模式

### 7. 知识库管理 `app/admin/(dashboard)/knowledge/page.tsx` + `components/admin/KnowledgeUploadForm.tsx`
- 上传卡 `border bg-white/70` → `.glass`
- 表格容器 `.glass` 包裹
- "知识库管理" 标题 `.industrial-zh`
- KnowledgeUploadForm 输入框 + 按钮套共性模式

### 8. 小组件 `components/admin/DeleteButton.tsx` + `components/admin/SignOutButton.tsx`
- 按钮样式统一（DeleteButton 删除保持红色警示；SignOutButton 改钢铁蓝灰描边按钮）

## 验证

1. `pnpm dev` 启动，访问 http://localhost:3000
2. **未登录访问 `/admin`** → 重定向到 `/admin/login`：确认登录页玻璃卡居中 + 工业风标题 + 背景压暗
3. 用 `admin@moyublog.com` / `admin123456` 登录 → `/admin` 仪表盘：4 统计卡 `.glass` + 数字 `.rust-text` 锈斑 + 顶栏吸顶玻璃栏 + 背景压暗可专注
4. 逐个访问 `/admin/posts` `/admin/categories` `/admin/knowledge`：容器 `.glass` + 标题工业风 + 按钮/输入框钢铁蓝灰
5. 点右上角主题切换：确认 `.glass` dark 模式正确跟随（深色半透明渐变）
6. 确认背景压暗遮罩不遮挡内容、滚动正常、`z-index` 层级正确（遮罩 `-z-10`，内容默认）
7. 文章新建/编辑表单：输入框 focus 时边框变钢铁蓝灰 `#5d7a8a`，提交功能不受影响

## 范围说明

- 只改样式（className + 必要的遮罩 div），不动业务逻辑/数据流/API
- 不引入新依赖，全部复用 globals.css 现有工具类
- 不改前台任何文件
- 中枢链路锚点跟手问题（MoyuBlog3.0 遗留）不在本次范围
