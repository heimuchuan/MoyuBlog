/** 照片访问地址：线上 Blob 存的是完整 URL，本地开发存的是文件名 */
export function photoUrl(fileName: string): string {
  return fileName.startsWith("http") ? fileName : `/uploads/photos/${fileName}`;
}

/** 头像访问地址：无配置时回退默认 /avatar.jpg，本地文件在 public/uploads/avatar/ 下 */
export function avatarUrl(ref: string | null | undefined): string {
  if (!ref) return "/avatar.jpg";
  return ref.startsWith("http") ? ref : `/uploads/avatar/${ref}`;
}
