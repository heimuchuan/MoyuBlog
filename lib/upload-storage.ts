// 上传文件统一存储层：
// 线上（配置了 BLOB_READ_WRITE_TOKEN，如 Vercel）→ Vercel Blob，数据库存完整 URL
// 本地开发（无 Token）→ 本地文件系统，数据库只存文件名
import { del, put } from "@vercel/blob";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

/** 判断存储引用是否为 Blob URL（Blob 存完整 URL，本地存文件名） */
export const isBlobRef = (ref: string) => ref.startsWith("http");

/** 保存上传文件，返回存储引用（Blob URL 或本地文件名） */
export async function saveUpload(opts: {
  blobPath: string; // Blob 内路径，如 photos/xxx.jpg
  localDir: string; // 本地目录绝对路径
  fileName: string; // 本地文件名
  data: Buffer;
  contentType?: string;
}): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(opts.blobPath, opts.data, {
      access: "public",
      addRandomSuffix: false,
      contentType: opts.contentType,
    });
    return blob.url;
  }
  await mkdir(opts.localDir, { recursive: true });
  await writeFile(path.join(opts.localDir, opts.fileName), opts.data);
  return opts.fileName;
}

/** 删除上传文件，按引用类型自动选择 Blob 或本地文件 */
export async function removeUpload(ref: string, localDir: string) {
  if (isBlobRef(ref)) {
    await del(ref).catch(() => {});
    return;
  }
  await unlink(path.join(localDir, path.basename(ref))).catch(() => {});
}

/** 读取上传文件内容（私有文件代理下载用），不存在返回 null */
export async function readUpload(ref: string, localDir: string): Promise<Buffer | null> {
  if (isBlobRef(ref)) {
    const res = await fetch(ref).catch(() => null);
    if (!res?.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  }
  try {
    return await readFile(path.join(localDir, path.basename(ref)));
  } catch {
    return null;
  }
}
