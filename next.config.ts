import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfjs-dist 为 ESM-only，交由 Node 直接加载，避免打包问题
  serverExternalPackages: ["pdfjs-dist"],
  // 禁用开发模式左下角的 DevTools 指示器
  devIndicators: false,
};

export default nextConfig;
