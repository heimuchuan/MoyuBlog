// 记账条目前端数据类型（与 Prisma LedgerEntry 对应）
export type LedgerEntryT = {
  id: number;
  type: "expense" | "income";
  amount: number; // 分
  category: string;
  note: string;
  date: string; // YYYY-MM-DD
};
