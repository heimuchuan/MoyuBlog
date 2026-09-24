export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="glass rounded-3xl p-6 sm:p-8">
      <h1 className="text-2xl font-bold">关于本站</h1>
      <div className="prose mt-6 max-w-none dark:prose-invert">
        <p>
          这是我摸鱼的地方，无聊的时候玩玩
        </p>
        <h2>技术栈</h2>
        <ul>
          <li>Next.js 16（App Router）+ React 19 + TypeScript</li>
          <li>Tailwind CSS 4 + @tailwindcss/typography</li>
          <li>Prisma 7 + PostgreSQL</li>
          <li>NextAuth.js 5（认证）</li>
          <li>SiliconFlow（DeepSeek 对话 + bge-m3 向量嵌入）</li>
        </ul>
        <h2>功能</h2>
        <ul>
          <li>文章展示、分类/标签筛选、全文搜索、暗色模式</li>
          <li>后台管理：文章 CRUD、分类管理、知识库上传</li>
          <li>RAG 智能问答：文档解析 → 切片 → 向量化 → 检索 → 生成</li>
        </ul>
      </div>
      </div>
    </div>
  );
}