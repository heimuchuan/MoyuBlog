import mammoth from "mammoth";

export type FileType = "pdf" | "docx" | "txt";

// 根据文件类型提取纯文本
export async function extractText(fileType: FileType, buffer: Buffer): Promise<string> {
  if (fileType === "txt") {
    return buffer.toString("utf-8");
  }
  if (fileType === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }
  if (fileType === "pdf") {
    // pdfjs-dist 仅服务端使用；Node 环境下自动回退到 fake worker
    const { getDocument } = await import("pdfjs-dist");
    const doc = await getDocument({
      data: new Uint8Array(buffer),
      useWorkerFetch: false,
    }).promise;
    let text = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => ("str" in item ? item.str : "")).join(" ") + "\n";
    }
    return text.trim();
  }
  throw new Error(`不支持的文件类型：${fileType}`);
}

// 将长文本切成带重叠的切片，便于向量化与检索
export function chunkText(text: string, maxLen = 800, overlap = 100): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    chunks.push(clean.slice(start, start + maxLen));
    if (start + maxLen >= clean.length) break;
    start += maxLen - overlap;
  }
  return chunks;
}