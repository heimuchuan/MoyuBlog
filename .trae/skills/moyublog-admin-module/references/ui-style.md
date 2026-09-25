# MoyuBlog 后台 UI 样式 Token

新增后台页面/组件时直接复用，不要新造配色。全局定义在 `app/globals.css`。

## 容器与卡片

- 页面：`mx-auto w-full max-w-5xl px-4 py-6`（后台）/ `max-w-3xl`（前台长文）
- 毛玻璃卡片：`className="glass rounded-2xl p-6"`（50% 透明 + blur(20px) + 极细发光边，已自适应明暗主题）
- 悬浮导航：`nav-glass`（sticky、16px 圆角、离顶 12px），不要再加 `rounded-none sticky top-0`
- 工业风标题：`industrial-zh mb-6 text-2xl font-bold`（钢铁蓝灰 #5d7a8a）

## 输入控件（PostForm 已抽出常量，照抄）

```ts
const inputClass =
  "w-full rounded-xl border border-white/20 bg-white/60 px-3 py-2 outline-none " +
  "focus:border-[#5d7a8a] focus:ring-1 focus:ring-[#5d7a8a]/30 " +
  "dark:border-white/10 dark:bg-white/5";
```

- textarea 同款 + `resize-y font-mono text-sm`
- 弹窗内输入框可沿用，外层弹层用 `fixed inset-0 z-50 bg-black/40` + 居中/贴底的 `.glass rounded-3xl`
- 不要用原生 `<select>`：用自定义按钮弹层，菜单 `rounded-xl border bg-white/95 dark:bg-zinc-900/95 shadow-xl backdrop-blur-md`，选项 `hover:bg-[#5d7a8a]/15`，选中项 `text-[#5d7a8a]` + 对勾图标

## 按钮

- 主按钮：`rounded-xl bg-[#5d7a8a] px-5 py-2 text-sm text-white hover:bg-[#4a6470] disabled:opacity-50`
- 描边次按钮：`rounded-xl border border-black/10 px-5 py-2 text-sm dark:border-white/10`
- 危险操作不要用红色大按钮，行内文字/角标即可（`text-red-500 hover:underline` 或圆形角标 `hover:bg-red-500`）

## 主色板

| 用途 | 色值 |
|------|------|
| 主题色（钢铁蓝灰） | `#5d7a8a`，hover `#4a6470` |
| 浅高亮底 | `bg-[#5d7a8a]/15`（导航选中、提示胶囊） |
| 支出/危险 | `#FF6B6B` |
| 收入/成功 | `#26C281` |
| 喵喵暖色渐变 | `from-[#FF9F43] to-[#FF6B9D]` |
| 分类马卡龙底 | 见 `lib/ledger-categories.ts`（线条图标 + 浅圆底 + bar 描边色成套使用） |

## 图标（硬性约定）

- **全站禁止 emoji 充当图标**（🌍🔒🍜 等一律不行），统一内联 SVG 线条：`fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"`，viewBox 24x24
- 通用图标（lock/globe/plus/chevron/download 等）放 `components/Icons.tsx`，颜色用 `currentColor` 由父级控制
- 成组业务图标（如记账 18 分类）建独立映射组件（如 `components/ledger/LedgerIcon.tsx`，`name={分类key}`），配置表只存 `bg/bar` 不再存 emoji
- 不引入 lucide-react 等图标库

## 交互动效约定

- 主题切换：保留现有水波纹，时长 0.9s
- 弹层/菜单：淡入 + 4px 下滑，约 0.18s ease-out
- 列表/卡片 hover：`-translate-y-0.5` 或图片 `scale-105/110`，配 `transition duration-300`
- 圆角偏好：卡片 16-24px，不要超大圆角/胶囊通栏
