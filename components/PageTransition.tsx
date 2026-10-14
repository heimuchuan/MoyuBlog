"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useRef, useState } from "react";

type TransitionCtx = {
  start: () => void;
  end: () => void;
};

const Ctx = createContext<TransitionCtx>({ start: () => {}, end: () => {} });

export function usePageTransition() {
  return useContext(Ctx);
}

/**
 * 全屏转场遮罩：前台↔后台切换时遮挡加载过程，避免白屏卡顿。
 * 由调用方在跳转前 start()，目标页挂载后 end()。
 * 内置 5s 超时保护，防止目标页未调用 end() 时遮罩永久卡住。
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const start = useCallback(() => {
    clearTimer();
    setActive(true);
    // 超时兜底：5 秒后自动关闭，防止目标页漏调 end() 导致界面卡死
    timer.current = setTimeout(() => setActive(false), 5000);
  }, []);

  const end = useCallback(() => {
    clearTimer();
    setActive(false);
  }, []);

  return (
    <Ctx.Provider value={{ start, end }}>
      {children}
      <AnimatePresence>
        {active && (
          <motion.div
            key="page-transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -32, pointerEvents: "none" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6"
            style={{ backgroundColor: "#1a1e29" }}
          >
            <motion.div
              animate={{ scale: [1, 1.06, 1], opacity: [0.62, 1, 0.62] }}
              transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
            >
              <svg width="76" height="76" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Relief" role="img">
                <rect x="7" y="7" width="50" height="50" rx="15" stroke="#7d9aaa" strokeWidth="2" />
                <text x="32" y="33" textAnchor="middle" dominantBaseline="central" fontSize="28" fontWeight="700" fill="#e8edf2" fontFamily="ui-sans-serif, system-ui, sans-serif">
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
    </Ctx.Provider>
  );
}
