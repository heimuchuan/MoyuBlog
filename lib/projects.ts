// 项目板块数据：手动维护，可自由增删
// 封面图可选，没封面时用渐变 + 标题水印占位

export type ProjectCategory = "web" | "tool" | "experiment";

export type Project = {
  slug: string;
  title: string;
  desc: string;
  cover?: string;
  date: string;
  tags: string[];
  category: ProjectCategory;
  url: string; // gitee 项目地址，点击卡片直接跳转
  // 错落布局：可选 "lg"（占 2x2 大格）或 "sm"（默认 1x1）
  span?: "lg" | "sm";
};

export const projectCategories: { key: ProjectCategory | "all"; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "web", label: "Web" },
  { key: "tool", label: "工具" },
  { key: "experiment", label: "实验" },
];

// 示例数据，可替换成你自己的项目（url 改成你 gitee 仓库的真实地址）
export const projects: Project[] = [
  {
    slug: "moyublog",
    title: "MoyuBlog",
    desc: "校园博客摸鱼办首页，集入口导航、音乐、歌词、宠物、清屏彩蛋于一体的玻璃拟态工作台",
    cover: "/listening.jpg",
    date: "2024.05",
    tags: ["Next.js", "React", "Tailwind"],
    category: "web",
    url: "https://github.com/heimuchuan/MoyuBlog",
    span: "lg",
  },
  {
    slug: "rag-kb",
    title: "RAG 知识库",
    desc: "基于向量检索的文档问答系统，支持上传 PDF/Markdown 自动入库与召回",
    cover: "/determined.jpg",
    date: "2024.02",
    tags: ["Python", "FastAPI", "OpenAI"],
    category: "web",
    url: "https://gitee.com/your-name/rag-kb",
  },
  {
    slug: "doc-crawler",
    title: "文档爬虫",
    desc: "批量抓取与清洗文档的工具集，输出标准化 JSON 入知识库",
    cover: "/cheek-touch.jpg",
    date: "2023.11",
    tags: ["Python", "SQLAlchemy"],
    category: "tool",
    url: "https://gitee.com/your-name/doc-crawler",
  },
  {
    slug: "ai-doodle",
    title: "AI 涂鸦",
    desc: "随手画几笔生成完整插画的小实验",
    cover: "/confession.jpg",
    date: "2023.08",
    tags: ["OpenAI", "Canvas"],
    category: "experiment",
    url: "https://gitee.com/your-name/ai-doodle",
  },
  {
    slug: "blog-engine",
    title: "博客引擎",
    desc: "Markdown 驱动的轻量博客后端，带标签、搜索、订阅",
    cover: "/caught-in-rain.jpg",
    date: "2024.01",
    tags: ["FastAPI", "MySQL", "Redis"],
    category: "web",
    url: "https://gitee.com/your-name/blog-engine",
  },
  {
    slug: "cli-toolkit",
    title: "CLI 工具箱",
    desc: "日常脚本集合：批量重命名、压缩、水印等",
    cover: "/lamb.jpg",
    date: "2024.06",
    tags: ["Python", "CLI"],
    category: "tool",
    url: "https://gitee.com/your-name/cli-toolkit",
  },
];
