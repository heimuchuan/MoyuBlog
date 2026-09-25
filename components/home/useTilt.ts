"use client";

import { useRef, type MouseEvent } from "react";

type TiltOptions = {
  /** 最大倾斜角度（度） */
  maxTilt?: number;
  /** 倾斜时的放大倍数 */
  scale?: number;
  /** 跟随光斑颜色（rgba） */
  glowColor?: string;
  /** 光斑直径 px */
  glowSize?: number;
};

/**
 * 3D 倾斜交互：鼠标移动时元素跟随光标 rotateX/rotateY，离开平滑回正，
 * 同时驱动一个径向光斑层跟随鼠标。transform 直接写 DOM，跟手无重渲染。
 *
 * 用法：
 *   const { ref, glowRef, onMouseMove, onMouseLeave } = useTilt<HTMLAnchorElement>({ maxTilt: 6 });
 *   <a ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
 *     <div ref={glowRef} className="pointer-events-none absolute inset-0 opacity-0" />
 *   </a>
 */
export function useTilt<T extends HTMLElement = HTMLAnchorElement>(opts?: TiltOptions) {
  const maxTilt = opts?.maxTilt ?? 8;
  const scale = opts?.scale ?? 1.03;
  const glowColor = opts?.glowColor ?? "rgba(255,255,255,0.35)";
  const glowSize = opts?.glowSize ?? 220;

  const ref = useRef<T>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: MouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0~1
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 2 * maxTilt;
    const rx = -(py - 0.5) * 2 * maxTilt;
    el.style.transform = `perspective(800px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(
      2
    )}deg) scale(${scale})`;
    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(${glowSize}px circle at ${px * 100}% ${
        py * 100
      }%, ${glowColor}, transparent 60%)`;
      glowRef.current.style.opacity = "1";
    }
  };

  const onMouseLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
    if (glowRef.current) glowRef.current.style.opacity = "0";
  };

  return { ref, glowRef, onMouseMove, onMouseLeave };
}
