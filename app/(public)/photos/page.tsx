import { prisma } from "@/lib/prisma";
import { photoUrl } from "@/lib/photo-url";

// 照片随上传实时变化，禁止静态化缓存
export const dynamic = "force-dynamic";

export default async function PhotosPage() {
  const photos = await prisma.photo.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">照片</h1>
      <p className="mt-1 text-sm text-zinc-500">记录生活碎片</p>

      {photos.length === 0 ? (
        <div className="glass mt-8 rounded-2xl p-12 text-center text-zinc-400">
          还没有照片～
        </div>
      ) : (
        <div className="mt-8 columns-2 gap-4 sm:columns-3">
          {photos.map((p) => (
            <a
              key={p.id}
              href={photoUrl(p.fileName)}
              target="_blank"
              rel="noopener noreferrer"
              className="group mb-4 block overflow-hidden rounded-2xl border border-white/35 shadow-lg dark:border-white/10"
            >
              <img
                src={photoUrl(p.fileName)}
                alt={p.title || "照片"}
                className="w-full transition duration-500 group-hover:scale-105"
              />
              {p.title && (
                <p className="bg-white/50 px-3 py-2 text-xs text-zinc-600 backdrop-blur dark:bg-black/40 dark:text-zinc-300">
                  {p.title}
                </p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
