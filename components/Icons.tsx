// 全站通用线条图标：stroke=currentColor，风格与导航栏 home 图标一致（描边 1.8、圆角）
// 颜色由父元素 color 控制，明暗主题自动适配
import type { ReactNode } from "react";

type IconProps = { className?: string };

function Svg({ className = "h-4 w-4", children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** 挂锁（私密/加密） */
export function LockIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Svg>
  );
}

/** 地球（公开） */
export function GlobeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" />
    </Svg>
  );
}

/** 加号 */
export function PlusIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

/** 左箭头 */
export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m15 18-6-6 6-6" />
    </Svg>
  );
}

/** 右箭头 */
export function ChevronRightIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m9 18 6-6-6-6" />
    </Svg>
  );
}

/** 上箭头 */
export function ChevronUpIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m18 15-6-6-6 6" />
    </Svg>
  );
}

/** 下箭头 */
export function ChevronDownIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

/** 下载 */
export function DownloadIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </Svg>
  );
}

/** 音符（音乐/歌词） */
export function MusicIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </Svg>
  );
}

/** 随机切换（洗牌） */
export function ShuffleIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M16 3h5v5" />
      <path d="M4 20 21 3" />
      <path d="M21 16v5h-5" />
      <path d="m15 15 6 6" />
      <path d="m4 4 5 5" />
    </Svg>
  );
}
