// 记账分类线条图标：按分类 key 映射，stroke=currentColor（颜色由父级 color 控制）
// 统一描边 1.8、圆角，与全站 Icons.tsx 风格一致
import type { ReactNode } from "react";

const PATHS: Record<string, ReactNode> = {
  // ── 支出 ──
  food: ( // 餐饮：刀叉
    <>
      <path d="M5 3v8a2 2 0 0 0 4 0V3" />
      <path d="M7 3v18" />
      <path d="M17 3c-1.5 0-3 1.8-3 5s1.5 4 3 4v9" />
    </>
  ),
  snack: ( // 零食：饼干
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="8.5" cy="9.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="8" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="14" cy="14.5" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  transport: ( // 交通：小汽车
    <>
      <path d="M4 16l1.4-4.8A2 2 0 0 1 7.3 9.8h9.4a2 2 0 0 1 1.9 1.4L20 16" />
      <path d="M3.5 16h17a1 1 0 0 1 1 1v1.5a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1V17a1 1 0 0 1 1-1Z" />
      <circle cx="7.5" cy="16" r="1.2" />
      <circle cx="16.5" cy="16" r="1.2" />
    </>
  ),
  shopping: ( // 购物：手提袋
    <>
      <path d="M6 8h12l-1 12a1.5 1.5 0 0 1-1.5 1.4h-7A1.5 1.5 0 0 1 7 20L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  fun: ( // 娱乐：游戏手柄
    <>
      <path d="M7 9h10a4 4 0 0 1 3.8 2.9l.9 3.3a2.2 2.2 0 0 1-3.9 1.7L16.6 15H7.4l-1.2 1.9a2.2 2.2 0 0 1-3.9-1.7l.9-3.3A4 4 0 0 1 7 9Z" />
      <path d="M7.5 11.5v2M6.5 12.5h2" />
      <circle cx="15.3" cy="12" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="17" cy="13.6" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  home: ( // 居住：房子
    <>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  medical: ( // 医疗：胶囊
    <>
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <path d="m8.5 8.5 7 7" />
    </>
  ),
  study: ( // 学习：翻开的书
    <>
      <path d="M12 7a3 3 0 0 0-4-3H3v14h5a3 3 0 0 1 4 3 3 3 0 0 1 4-3h5V4h-5a3 3 0 0 0-4 3Z" />
      <path d="M12 7v14" />
    </>
  ),
  travel: ( // 旅行：纸飞机
    <>
      <path d="M21.5 2.5 2.8 9.6c-.8.3-.7 1.4.1 1.6l7.4 1.7 1.7 7.4c.2.8 1.3.9 1.6.1l7.9-16.4c.2-.4-.2-.8-.5-.5Z" />
      <path d="m21 3-10.5 10.5" />
    </>
  ),
  phone: ( // 通讯：手机
    <>
      <rect width="13" height="19" x="5.5" y="2.5" rx="2.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  pet: ( // 宠物：爪印
    <>
      <circle cx="6.5" cy="9.5" r="1.5" />
      <circle cx="10.5" cy="6.5" r="1.5" />
      <circle cx="15" cy="6.5" r="1.5" />
      <circle cx="17.5" cy="9.5" r="1.5" />
      <path d="M12 11.5c-2.6 0-4.5 2-4.5 4 0 1.4 1.1 2.2 2.3 2.2.9 0 1.3-.5 2.2-.5s1.3.5 2.2.5c1.2 0 2.3-.8 2.3-2.2 0-2-1.9-4-4.5-4Z" />
    </>
  ),
  other_exp: ( // 其他支出：钱包
    <>
      <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6H18" />
      <path d="M4 7.5V17a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 1-2-1.5Z" />
      <circle cx="16.5" cy="13.5" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),

  // ── 收入 ──
  salary: ( // 工资：公文包
    <>
      <rect width="18" height="13" x="3" y="7.5" rx="2" />
      <path d="M9 7.5V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8v1.7" />
      <path d="M3 12.5h18" />
    </>
  ),
  parttime: ( // 兼职：笔记本
    <>
      <path d="M5 5h14a1 1 0 0 1 1 1v9H4V6a1 1 0 0 1 1-1Z" />
      <path d="M3 19h18" />
    </>
  ),
  bonus: ( // 红包/礼金：礼物
    <>
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <path d="M3 9h18" />
      <path d="M12 9v11" />
      <path d="M12 9S10.5 4 8 4a2.2 2.2 0 0 0 0 4.4M12 9s1.5-5 4-5a2.2 2.2 0 0 1 0 4.4" />
    </>
  ),
  invest: ( // 理财：上升趋势
    <>
      <path d="m3 16 5-5 3.5 3.5L20 6" />
      <path d="M15 6h5v5" />
    </>
  ),
  refund: ( // 退款：回转箭头
    <>
      <path d="M3 11a9 9 0 1 1 2.6 7" />
      <path d="M3 19v-5h5" />
    </>
  ),
  other_inc: ( // 其他收入：硬币
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v9M9.5 10h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3H14" />
    </>
  ),

  // 兜底
  _default: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M11 12h1v4h1" />
    </>
  ),
};

export default function LedgerIcon({
  name,
  className = "h-5 w-5",
}: {
  name: string;
  className?: string;
}) {
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
      {PATHS[name] ?? PATHS._default}
    </svg>
  );
}
