/** 照片访问地址：线上 Blob 存的是完整 URL，本地开发存的是文件名 */
export function photoUrl(fileName: string): string {
  return fileName.startsWith("http") ? fileName : `/uploads/photos/${fileName}`;
}
