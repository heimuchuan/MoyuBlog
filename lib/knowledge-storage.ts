// 知识库原始文件留档目录（位于项目根 storage 下，非 public，仅经鉴权 API 下载）
import path from "path";

export const KNOWLEDGE_DIR = path.join(process.cwd(), "storage", "knowledge");

/** 生成存储文件名：时间戳 + 随机串 + 原扩展名 */
export function storedName(ext: string): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}
