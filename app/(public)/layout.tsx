import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";
import BackToTop from "@/components/BackToTop";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <ChatWidget />
      <BackToTop />
      <footer className="border-t border-black/5 py-8 text-center text-sm text-zinc-500 dark:border-white/10">
        <p>© {new Date().getFullYear()} MoyuBlog · 个人摸鱼记录</p>
      </footer>
    </div>
  );
}