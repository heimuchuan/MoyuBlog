"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

/**
 * 技能轮盘：12 片 SVG 环形扇形，半透明径向渐变 + 白色细缝，
 * 悬停单片弹簧外扩并在中心显示技能名。
 */

// 技能列表（片数自动均分 360°；颜色由下方 HSL 生成，无需手填）
const SKILLS = [
  "React", "Next.js", "TypeScript", "Python",
  "FastAPI", "MySQL", "Redis", "Tailwind",
  "Prisma", "Docker", "Git", "Framer",
];

// 配色：仅紫/靛蓝/天蓝/青色系——HSL 色相围绕 270°（紫）上下浮动 40°（230°~310°）
const HUE_CENTER = 270;
const HUE_SPREAD = 40; // ±40°
const sliceHue = (i: number, total: number): number =>
  HUE_CENTER - HUE_SPREAD + (i * HUE_SPREAD * 2) / Math.max(total - 1, 1);
const hsl = (h: number, s: number, l: number): string => `hsl(${h.toFixed(1)}, ${s}%, ${l}%)`;

const C = 100; // 圆心
const R_OUT = 92; // 外半径
const R_IN = 42; // 内半径（环形，中心留空显示文字）
const GAP_DEG = 1.6; // 片间缝隙（角度）

function polar(r: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(rad), C + r * Math.sin(rad)];
}

/** 环形扇形路径（a0 → a1 度） */
function donutSlice(a0: number, a1: number): string {
  const [x0, y0] = polar(R_OUT, a0);
  const [x1, y1] = polar(R_OUT, a1);
  const [x2, y2] = polar(R_IN, a1);
  const [x3, y3] = polar(R_IN, a0);
  const large = a1 - a0 > 180 ? 1 : 0;
  return [
    `M${x0.toFixed(2)},${y0.toFixed(2)}`,
    `A${R_OUT},${R_OUT} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`,
    `L${x2.toFixed(2)},${y2.toFixed(2)}`,
    `A${R_IN},${R_IN} 0 ${large} 0 ${x3.toFixed(2)},${y3.toFixed(2)}`,
    "Z",
  ].join(" ");
}

export default function SkillWheel({ className = "" }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const step = 360 / SKILLS.length;

  return (
    <div className={`relative aspect-square ${className}`}>
      {/* 柔和发光背景 */}
      <div
        aria-hidden
        className="absolute -inset-[22%] rounded-full blur-xl"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.38) 0%, rgba(34,211,238,0.14) 55%, transparent 72%)",
        }}
      />

      <svg viewBox="0 0 200 200" className="relative h-full w-full drop-shadow-[0_8px_28px_rgba(0,0,0,0.4)]">
        <defs>
          {SKILLS.map((_, i) => {
            const h = sliceHue(i, SKILLS.length);
            return (
              <radialGradient
                key={i}
                id={`sw-${i}`}
                gradientUnits="userSpaceOnUse"
                cx={C}
                cy={C}
                r={R_OUT}
              >
                {/* 内缘：深暗（低亮度+更低透明度）；外缘：亮色 0.7 透明度 → 发光玻璃感 */}
                <stop offset={`${(R_IN / R_OUT) * 100}%`} stopColor={hsl(h, 62, 22)} stopOpacity="0.5" />
                <stop offset="100%" stopColor={hsl(h, 88, 66)} stopOpacity="0.7" />
              </radialGradient>
            );
          })}
        </defs>

        {SKILLS.map((name, i) => {
          const a0 = i * step + GAP_DEG / 2;
          const a1 = (i + 1) * step - GAP_DEG / 2;
          return (
            <motion.path
              key={name}
              d={donutSlice(a0, a1)}
              fill={`url(#sw-${i})`}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth={1}
              className="cursor-pointer"
              style={{ transformBox: "view-box", transformOrigin: "100px 100px" }}
              whileHover={{ scale: 1.08 }}
              transition={{ type: "spring", stiffness: 320, damping: 15 }}
              onHoverStart={() => setActive(name)}
              onHoverEnd={() => setActive(null)}
            />
          );
        })}
      </svg>

      {/* 中心：当前技能名 */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={active ?? "default"}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.16 }}
            className="text-[11px] font-semibold tracking-[0.2em] text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)] 2xl:text-xs"
          >
            {(active ?? "SKILLS").toUpperCase()}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
