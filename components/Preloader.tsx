"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * 首屏加载动画：深色全屏遮罩 + Logo 呼吸
 * 强制展示 1.8s，随后遮罩淡出并轻微上滑（0.6s），动画结束后从 DOM 移除
 */
export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -32, pointerEvents: "none" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6"
          style={{ backgroundColor: "#1a1e29" }}
        >
          {/* Logo 呼吸：缩放 + 透明度轻微循环 */}
          <motion.div
            animate={{ scale: [1, 1.06, 1], opacity: [0.62, 1, 0.62] }}
            transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
          >
            <svg
              width="76"
              height="76"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Relief"
              role="img"
            >
              <rect
                x="7"
                y="7"
                width="50"
                height="50"
                rx="15"
                stroke="#7d9aaa"
                strokeWidth="2"
              />
              <text
                x="32"
                y="33"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="28"
                fontWeight="700"
                fill="#e8edf2"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                R
              </text>
            </svg>
          </motion.div>

          <motion.p
            animate={{ opacity: [0.4, 0.85, 0.4] }}
            transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
            className="text-xs tracking-[0.4em] text-zinc-400"
          >
            RELIEF
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
