import Chat from "@/components/Chat";

export default function ChatPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">聊一聊</h1>
        <p className="mt-1 text-sm text-zinc-500">
          基于校园知识库的回答，答案下方会标注引用的资料来源。
        </p>
      </div>
      <div className="glass h-[560px] overflow-hidden rounded-3xl">
        <Chat />
      </div>
    </div>
  );
}