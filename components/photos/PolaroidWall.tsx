"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";

export type PolaroidPhoto = {
  id: number | string;
  url: string;
  title?: string | null;
  /** 底部编号，如 "001" */
  no: string;
};

// 确定性伪随机：同一位置每次渲染角度一致，范围 [-2.4, 2.4)，错落但不混乱
function pseudo(i: number, seed: number, range: number) {
  return (((i * seed) % 100) / 100 - 0.5) * 2 * range;
}

export default function PolaroidWall({ photos }: { photos: PolaroidPhoto[] }) {
  return (
    <div
      className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4"
      style={{ perspective: 1000 } as CSSProperties}
    >
      {photos.map((p, i) => {
        // 错落倾角 -2.4° ~ 2.4°；胶带倾角 -5° ~ 5°；胶带黄/白交替
        const tilt = pseudo(i, 47, 2.4);
        const tapeRotate = pseudo(i, 31, 5);
        const tapeYellow = i % 2 === 0;

        return (
          // 外层：3D 翻转入场（父容器提供 perspective）
          <motion.div
            key={p.id}
            initial={{ rotateY: -90, opacity: 0, scale: 0.9 }}
            whileInView={{ rotateY: 0, opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              delay: Math.min(i * 0.09, 1.2),
              duration: 0.65,
              ease: [0.2, 0.7, 0.3, 1],
            }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* 内层：静态错落倾角 + 悬停弹簧（回正 / 上浮 / 放大 / 置顶） */}
            <motion.div
              initial={false}
              animate={{ rotate: tilt, y: 0 }}
              whileHover={{
                rotate: 0,
                y: -8,
                scale: 1.05,
                zIndex: 30,
                boxShadow:
                  "0 22px 45px -12px rgba(0,0,0,0.35), 0 8px 18px -8px rgba(0,0,0,0.22)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative z-0 will-change-transform"
            >
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-[3px] bg-white p-2 pb-7 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.35),0_3px_8px_-4px_rgba(0,0,0,0.18)] ring-1 ring-black/5"
              >
                {/* 透明胶带：顶部居中、微倾、半透明黄/白交替 */}
                <span
                  aria-hidden
                  className={`absolute -top-2.5 left-1/2 h-6 w-16 shadow-[0_1px_2px_rgba(0,0,0,0.12)] backdrop-blur-[1px] ${
                    tapeYellow
                      ? "bg-amber-200/45"
                      : "bg-white/60"
                  }`}
                  style={{ transform: `translateX(-50%) rotate(${tapeRotate}deg)` }}
                />

                {/* 方形照片区：居中偏上裁剪保人脸 */}
                <img
                  src={p.url}
                  alt={p.title || "照片"}
                  loading="lazy"
                  className="block aspect-square w-full rounded-[2px] object-cover object-[50%_25%]"
                />

                {/* 底部宽留白区：编号居中，有标题时标题在上 */}
                <span className="absolute inset-x-2 bottom-1.5 flex flex-col items-center gap-0.5">
                  {p.title && (
                    <span className="w-full truncate text-center text-[10px] leading-tight text-zinc-500">
                      {p.title}
                    </span>
                  )}
                  <span className="text-[11px] leading-none tracking-widest text-zinc-400 tabular-nums">
                    {p.no}
                  </span>
                </span>
              </a>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
