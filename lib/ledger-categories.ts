// 记账分类配置（线条图标见 components/ledger/LedgerIcon.tsx，按 key 映射）

export type EntryType = "expense" | "income";

export type LedgerCategory = {
  key: string;
  label: string;
  /** 图标圆底：浅马卡龙色 */
  bg: string;
  /** 图标描边 / 报表进度条色 */
  bar: string;
};

// 支出分类
export const EXPENSE_CATEGORIES: LedgerCategory[] = [
  { key: "food", label: "餐饮", bg: "#FFE8D6", bar: "#E08A2E" },
  { key: "snack", label: "零食", bg: "#FFF3D6", bar: "#D69A1F" },
  { key: "transport", label: "交通", bg: "#D6ECFF", bar: "#3E82D6" },
  { key: "shopping", label: "购物", bg: "#FFE0EC", bar: "#E05888" },
  { key: "fun", label: "娱乐", bg: "#E8E0FF", bar: "#7563D6" },
  { key: "home", label: "居住", bg: "#DFF5E8", bar: "#1F9F69" },
  { key: "medical", label: "医疗", bg: "#FFE0E0", bar: "#DB5858" },
  { key: "study", label: "学习", bg: "#E0F0FF", bar: "#3C7BBF" },
  { key: "travel", label: "旅行", bg: "#D6F5F2", bar: "#17967C" },
  { key: "phone", label: "通讯", bg: "#EDE7FF", bar: "#6757C4" },
  { key: "pet", label: "宠物", bg: "#FFF0E0", bar: "#C76B1E" },
  { key: "other_exp", label: "其他", bg: "#EEEEEE", bar: "#7A8690" },
];

// 收入分类
export const INCOME_CATEGORIES: LedgerCategory[] = [
  { key: "salary", label: "工资", bg: "#DFF5E8", bar: "#1F9F69" },
  { key: "parttime", label: "兼职", bg: "#D6ECFF", bar: "#3E82D6" },
  { key: "bonus", label: "红包", bg: "#FFE0E0", bar: "#DB5858" },
  { key: "invest", label: "理财", bg: "#D6F5F2", bar: "#17967C" },
  { key: "refund", label: "退款", bg: "#FFF3D6", bar: "#D69A1F" },
  { key: "other_inc", label: "其他", bg: "#FFE8EC", bar: "#E05888" },
];

const ALL: Record<EntryType, LedgerCategory[]> = {
  expense: EXPENSE_CATEGORIES,
  income: INCOME_CATEGORIES,
};

/** 按 key 查分类元信息，找不到时给一个兜底展示 */
export function getCategory(type: string, key: string): LedgerCategory {
  const list = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return list.find((c) => c.key === key) ?? { key, label: key, bg: "#EEEEEE", bar: "#7A8690" };
}

export function categoriesOf(type: EntryType): LedgerCategory[] {
  return ALL[type];
}
