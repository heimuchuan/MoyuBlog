// 记账日期工具：本地自然日格式化 + 备注中的智能日期识别（客户端/服务端通用）

/** Date → YYYY-MM-DD（按本地时区） */
export function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return fmtDate(new Date());
}

function parseStr(s: string): Date {
  return new Date(`${s}T00:00:00`);
}

export function addDaysStr(s: string, n: number): string {
  const d = parseStr(s);
  d.setDate(d.getDate() + n);
  return fmtDate(d);
}

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
export function weekdayStr(s: string): string {
  return WEEKDAYS[parseStr(s).getDay()];
}

/** 分 → 元字符串（保留两位小数，整数不带 .00） */
export function yuan(cents: number): string {
  return (cents / 100).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const RELATIVE: { re: RegExp; offset: number }[] = [
  { re: /(今天|今日|今晚)/g, offset: 0 },
  { re: /(昨天|昨日|昨晚)/g, offset: -1 },
  { re: /(前天)/g, offset: -2 },
  { re: /(明天|明日)/g, offset: 1 },
];

// 显式日期：2026年9月20日 / 9月20日 / 9-20 / 9/20（刻意不支持 9.20，避免与小数金额冲突）
const ABS_RE = /(\d{4}\s*年\s*)?(\d{1,2})\s*[月\-/]\s*(\d{1,2})\s*[日号]?/g;

export type ParsedDate = { date: string | null; cleaned: string };

/**
 * 从备注文本中识别日期并剔除日期文字。
 * 识别“今天/昨天/前天/明天”、“9月20日/号”、“9-20”、“9/20”、“2026年9月20日”。
 * 多个日期时取最后一个；未写年份时，若推算日期在未来一周以后则视为上一年。
 */
export function parseDateFromText(text: string): ParsedDate {
  if (!text) return { date: null, cleaned: "" };
  let found: string | null = null;
  let cleaned = text;

  // 相对日期
  let bestOffset: number | null = null;
  for (const { re, offset } of RELATIVE) {
    re.lastIndex = 0;
    if (re.test(cleaned)) {
      bestOffset = offset;
      cleaned = cleaned.replace(re, " ");
    }
  }
  if (bestOffset !== null) found = addDaysStr(todayStr(), bestOffset);

  // 显式日期
  const dates: string[] = [];
  cleaned = cleaned.replace(ABS_RE, (m, year?: string, mo?: string, da?: string) => {
    const month = Number(mo);
    const day = Number(da);
    if (month < 1 || month > 12 || day < 1 || day > 31) return m;
    const now = new Date();
    let y = year ? Number(year.trim().replace(/\s*年\s*$/, "")) : now.getFullYear();
    let candidate = new Date(y, month - 1, day);
    if (!year) {
      // 没写年份：超过未来一个月的日期回退到上一年（记账多为补录，允许近期预记）
      const limit = new Date();
      limit.setMonth(limit.getMonth() + 1);
      if (candidate > limit) {
        y -= 1;
        candidate = new Date(y, month - 1, day);
      }
    }
    const s = fmtDate(candidate);
    dates.push(s);
    return " ";
  });
  if (dates.length > 0) found = dates[dates.length - 1];

  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return { date: found, cleaned };
}

/** 周期范围：week=本周一至周日；month=本月1日至月末 */
export function periodRange(ref: string, period: "week" | "month"): { start: string; end: string; label: string } {
  const d = parseStr(ref);
  if (period === "week") {
    const mondayOffset = (d.getDay() + 6) % 7; // 周一为 0
    const startD = new Date(d);
    startD.setDate(d.getDate() - mondayOffset);
    const endD = new Date(startD);
    endD.setDate(startD.getDate() + 6);
    const start = fmtDate(startD);
    const end = fmtDate(endD);
    return { start, end, label: `${start} ~ ${end}` };
  }
  const startD = new Date(d.getFullYear(), d.getMonth(), 1);
  const endD = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return {
    start: fmtDate(startD),
    end: fmtDate(endD),
    label: `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`,
  };
}

/** 列出 [start,end] 之间的全部日期字符串（含端点） */
export function listDates(start: string, end: string): string[] {
  const out: string[] = [];
  let cur = start;
  while (cur <= end) {
    out.push(cur);
    cur = addDaysStr(cur, 1);
  }
  return out;
}
