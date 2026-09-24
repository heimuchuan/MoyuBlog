import { prisma } from "@/lib/prisma";
import KnowledgeUploadForm from "@/components/admin/KnowledgeUploadForm";
import DeleteButton from "@/components/admin/DeleteButton";

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  processed: { text: "已就绪", className: "bg-green-500/10 text-green-600" },
  processing: { text: "处理中", className: "bg-amber-500/10 text-amber-600" },
  failed: { text: "失败", className: "bg-red-500/10 text-red-600" },
  pending: { text: "待处理", className: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800" },
};

export default async function AdminKnowledge() {
  const docs = await prisma.knowledgeDoc.findMany({
    include: { _count: { select: { chunks: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">知识库管理</h1>

      <div className="mb-8 max-w-md rounded-2xl border border-black/5 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="mb-4 text-sm font-semibold">上传文档</h2>
        <KnowledgeUploadForm />
      </div>

      {docs.length === 0 ? (
        <p className="py-16 text-center text-zinc-500">暂无知识文档</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 text-left text-zinc-500 dark:border-white/10">
                <th className="py-2 pr-4 font-medium">标题</th>
                <th className="py-2 pr-4 font-medium">类型</th>
                <th className="py-2 pr-4 font-medium">切片数</th>
                <th className="py-2 pr-4 font-medium">状态</th>
                <th className="py-2 pr-4 font-medium">上传时间</th>
                <th className="py-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => {
                const s = STATUS_LABEL[d.status] || STATUS_LABEL.pending;
                return (
                  <tr key={d.id} className="border-b border-black/5 dark:border-white/10">
                    <td className="max-w-[240px] truncate py-3 pr-4">{d.title}</td>
                    <td className="py-3 pr-4 uppercase">{d.fileType}</td>
                    <td className="py-3 pr-4">{d._count.chunks}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2 py-0.5 ${s.className}`}>{s.text}</span>
                    </td>
                    <td className="py-3 pr-4 text-zinc-500">
                      {new Date(d.createdAt).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="py-3">
                      <DeleteButton
                        url="/api/knowledge"
                        body={{ id: d.id }}
                        confirmText={`确定删除「${d.title}」吗？`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}