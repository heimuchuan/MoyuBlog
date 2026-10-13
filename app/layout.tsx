import type { Metadata } from "next";
import "./globals.css";
import { ThemeProviderWrapper } from "@/components/theme-provider";
import AuthSessionProvider from "@/components/auth-provider";
import BackgroundSlideshow from "@/components/BackgroundSlideshow";
import Preloader from "@/components/Preloader";

export const metadata: Metadata = {
  title: {
    default: "摸鱼办",
    template: "%s | MoyuBlog",
  },
  description: "摸鱼，顺便写点东西",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <BackgroundSlideshow />
        </div>
        <ThemeProviderWrapper>
          <AuthSessionProvider>
            {children}
            <Preloader />
          </AuthSessionProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}