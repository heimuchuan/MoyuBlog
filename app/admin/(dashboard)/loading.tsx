export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#5d7a8a]/20 border-t-[#5d7a8a]" />
        <p className="text-sm text-zinc-500">加载中…</p>
      </div>
    </div>
  );
}
