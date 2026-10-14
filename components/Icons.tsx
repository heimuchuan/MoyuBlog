// 全站通用线条图标：stroke=currentColor，风格与导航栏 home 图标一致（描边 1.8、圆角）
// 颜色由父元素 color 控制，明暗主题自动适配
import type { ComponentType, ReactNode } from "react";
import { Bird } from "lucide-react";

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

/** GitHub */
export function GithubIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </Svg>
  );
}

/** 邮件 */
export function MailIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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

/** 链接（通用社交图标） */
export function LinkIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Svg>
  );
}

/** 社交链接图标映射：key → 组件（后台管理与前台大屏共用） */
export const SOCIAL_ICONS: Record<string, ComponentType<IconProps>> = {
  github: GithubIcon,
  mail: MailIcon,
  globe: GlobeIcon,
  link: LinkIcon,
  bilibili: BilibiliIcon,
  queyu: QueyuIcon,
};

/** bilibili（线条小电视：双天线 + 圆角机身 + 双竖眼） */
export function BilibiliIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M8 3.5 10.5 7" />
      <path d="M16 3.5 13.5 7" />
      <rect width="19" height="12.5" x="2.5" y="7" rx="3" />
      <path d="M8.5 12v2.5" />
      <path d="M15.5 12v2.5" />
    </Svg>
  );
}

/** 雀语（线条小鸟，沿用 lucide bird 的 1.8 描边线条风格） */
export function QueyuIcon({ className }: IconProps) {
  return <Bird className={className ?? "h-4 w-4"} strokeWidth={1.8} aria-hidden />;
}

/** 社交图标合法 key 白名单（服务端校验用） */
export const SOCIAL_ICON_KEYS = Object.keys(SOCIAL_ICONS);
