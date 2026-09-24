"use client";

import { useEffect, useState } from "react";

const IMAGES = [
  { src: "/background.jpg", position: "center" },
  { src: "/background-2.jpg", position: "top" },
];
const INTERVAL = 5000; // 每 5 秒切换

// 流动弹幕文案（随机分布在不同高度、不同速度）
const DANMAKU = [
  { text: "今天又没有更新！", top: "6%", dur: 18 },
  { text: "你说你十连双金？", top: "18%", dur: 22 },
  { text: "大家都觉得蕾缪安是美神！", top: "30%", dur: 26 },
  { text: "歇会~", top: "42%", dur: 15 },
  { text: "午饭吃什么？", top: "54%", dur: 19 },
  { text: "嘻嘻/", top: "66%", dur: 14 },
  { text: "无可奉告！是的，你还没问，不过不影响我的回答~", top: "78%", dur: 30 },
  { text: "哎呀，问嘛，问嘛~", top: "90%", dur: 24 },
];

export default function BackgroundSlideshow() {
  const [index, setIndex] = useState(0);
  const [clear, setClear] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % IMAGES.length), INTERVAL);
    return () => clearInterval(timer);
  }, []);

  // 监听首页「清屏 / 恢复」事件：清屏时背景图完全清晰、光斑隐藏
  useEffect(() => {
    function onClear() {
      setClear(true);
    }
    function onRestore() {
      setClear(false);
    }
    window.addEventListener("bg-clear", onClear);
    window.addEventListener("bg-restore", onRestore);
    return () => {
      window.removeEventListener("bg-clear", onClear);
      window.removeEventListener("bg-restore", onRestore);
    };
  }, []);

  return (
    <>
      {/* 背景图：清屏时移除透明与模糊 */}
      <div
        className={`absolute inset-0 bg-cover transition-all duration-1000 ${
          clear ? "opacity-100 blur-none" : "opacity-50 blur-[2px] dark:opacity-35"
        }`}
      >
        {IMAGES.map((img, i) => (
          <div
            key={img.src}
            className="absolute inset-0 bg-cover transition-opacity duration-1000"
            style={{
              backgroundImage: `url('${img.src}')`,
              backgroundPosition: img.position,
              opacity: i === index ? 1 : 0,
            }}
          />
        ))}
      </div>

      {/* 彩色光斑：清屏时淡出，让背景图完全展示 */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${clear ? "opacity-0" : "opacity-100"}`}>
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-300/40 blur-3xl dark:bg-indigo-600/20" />
        <div className="absolute right-[-10%] top-1/4 h-80 w-80 rounded-full bg-pink-300/40 blur-3xl dark:bg-pink-600/20" />
        <div className="absolute bottom-[-10%] left-1/3 h-96 w-96 rounded-full bg-sky-300/30 blur-3xl dark:bg-purple-600/20" />
      </div>

      {/* 流动弹幕：清屏时淡出 */}
      <div className={`absolute inset-0 overflow-hidden transition-opacity duration-1000 ${clear ? "opacity-0" : "opacity-100"}`}>
        {DANMAKU.map((d) => (
          <span
            key={d.text}
            className="absolute whitespace-nowrap font-medium"
            style={{
              top: d.top,
              fontSize: "13px",
              color: "var(--danmaku-color)",
              textShadow: "var(--danmaku-glow)",
              transition: "color 0.7s ease, text-shadow 0.7s ease",
              animation: `danmaku-flow ${d.dur}s linear infinite`,
            }}
          >
            {d.text}
          </span>
        ))}
      </div>
    </>
  );
}