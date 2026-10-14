"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

/** 打字节奏：基准 155ms/字 + 随机抖动，模拟真人敲字的快慢起伏 */
const BASE_MS = 155;
const DELETE_MS = 90; // 删除比打字稍慢，让消失过程更从容
const PAUSE_AFTER_TYPE = 1200; // 打完停留
const PAUSE_AFTER_DELETE = 500; // 删完切下一条前的小停
const CLAUSE_PUNCT = new Set(["，", "、", "；", "：", ",", ";", ":"]); // 句中停顿 ~2x
const SENT_PUNCT = new Set(["。", "？", "！", "…", ".", "?", "!"]); // 句末停顿 ~3x

/** 下一字延迟：基准 ×(0.6~1.4) 抖动，标点分级停顿 */
function typeDelay(ch: string): number {
  const jitter = 0.6 + Math.random() * 0.8;
  if (SENT_PUNCT.has(ch)) return BASE_MS * 3 + Math.random() * 150;
  if (CLAUSE_PUNCT.has(ch)) return BASE_MS * 2 + Math.random() * 100;
  return BASE_MS * jitter;
}

type Phase = "typing" | "pauseType" | "deleting" | "pauseDelete";

/**
 * 动漫台词海报式金句：粗体白字 + 强投影 + 全角引号包裹，
 * 多条金句循环：逐字打出 → 停顿 → 逐字删除 → 下一条；尾部光标 1s 节奏闪烁。
 * 传入 texts 数组；若只传单个 text，会被包成单元素数组循环。
 */
export default function TypewriterQuote({
  text,
  texts,
  className = "",
}: {
  text?: string;
  texts?: string[];
  className?: string;
}) {
  const list = useMemo(() => {
    const arr = texts && texts.length ? texts : text ? [text] : [];
    return arr.filter((s) => s && s.length > 0);
  }, [text, texts]);

  const [idx, setIdx] = useState(0);
  const [n, setN] = useState(0); // 当前已显示字符数
  const [phase, setPhase] = useState<Phase>("typing");

  // 用 ref 记录上一次的 list 内容，避免引用变化（如 Strict Mode 双 fetch）触发不必要的重置
  const prevListKey = useRef("");

  // 用 ref 记录当前文本，避免闭包陈旧
  const current = list[idx] ?? "";

  useEffect(() => {
    // 仅当 list 内容真正变化时才重置（用 join 生成内容指纹比较，避免引用相同但内容不同的误判）
    const key = list.join("\u0001");
    if (prevListKey.current === key) return;
    prevListKey.current = key;
    setIdx(0);
    setN(0);
    setPhase("typing");
  }, [list]);

  useEffect(() => {
    if (!current) return;
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (n < current.length) {
        timer = setTimeout(() => setN(n + 1), typeDelay(current[n]));
      } else {
        timer = setTimeout(() => setPhase("pauseType"), 0);
      }
    } else if (phase === "pauseType") {
      timer = setTimeout(() => setPhase("deleting"), PAUSE_AFTER_TYPE);
    } else if (phase === "deleting") {
      if (n > 0) {
        timer = setTimeout(() => setN(n - 1), DELETE_MS);
      } else {
        timer = setTimeout(() => setPhase("pauseDelete"), 0);
      }
    } else {
      // pauseDelete → 切下一条
      timer = setTimeout(() => {
        setIdx((i) => (i + 1) % list.length);
        setN(0);
        setPhase("typing");
      }, PAUSE_AFTER_DELETE);
    }

    return () => clearTimeout(timer);
  }, [phase, n, current, list.length]);

  if (!current) {
    return null;
  }

  return (
    <span className={className}>
      {/* 全角引号：微弱透明，与文字同色系 */}
      <span aria-hidden className="mr-1 text-white/60">“</span>
      {/* 逐字符淡入上浮，消除生硬跳字感；key 用索引，已显示字符不重播动画 */}
      {current.slice(0, n).split("").map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="inline-block whitespace-pre"
        >
          {ch}
        </motion.span>
      ))}
      {/* 闪烁光标：1s 周期，前 50% 显、后 50% 隐；始终位于引号内部 */}
      <motion.span
        aria-hidden
        className="ml-0.5 inline-block font-light text-white/90"
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1], ease: "linear" }}
      >
        |
      </motion.span>
      {/* 闭引号：始终固定在末尾，光标在其内侧推进 */}
      <span aria-hidden className="ml-1 text-white/60">”</span>
    </span>
  );
}
