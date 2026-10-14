"use client";

import { useEffect, useState } from "react";

// 模块级缓存：同一次页面访问内只请求一次接口
let cachedUrl: string | null = null;
let pending: Promise<string> | null = null;

const LS_KEY = "moyu_avatar_url";

function fetchAvatarUrl(): Promise<string> {
  if (cachedUrl) return Promise.resolve(cachedUrl);
  if (!pending) {
    pending = fetch("/api/site-config/avatar")
      .then((r) => r.json())
      .then((d) => {
        const url = typeof d?.url === "string" && d.url ? d.url : "/avatar.jpg";
        cachedUrl = url;
        return url;
      })
      .catch(() => "/avatar.jpg");
  }
  return pending;
}

/** 站点头像：后台「设置」上传后全站生效；未配置时回退默认 /avatar.jpg */
export default function Avatar({
  className,
  alt = "Relief",
}: {
  className?: string;
  alt?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    // 上次访问缓存过的地址先立即上屏，避免闪默认头像
    const ls = localStorage.getItem(LS_KEY);
    if (ls) setSrc(ls);
    fetchAvatarUrl().then((url) => {
      localStorage.setItem(LS_KEY, url);
      setSrc(url);
    });
  }, []);

  if (!src) return null;
  return <img src={src} alt={alt} className={className} />;
}
