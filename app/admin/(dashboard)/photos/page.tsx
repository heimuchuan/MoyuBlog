import { prisma } from "@/lib/prisma";
import { photoUrl } from "@/lib/photo-url";
import PhotoUpload from "@/components/admin/PhotoUpload";
import PhotoDeleteButton from "@/components/admin/PhotoDeleteButton";

export default async function AdminPhotosPage() {
  const photos = await prisma.photo.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="industrial-zh mb-6 text-2xl font-bold">照片</h1>
      <div className="glass mb-6 rounded-2xl p-6">
        <PhotoUpload />
      </div>

      {photos.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-sm text-zinc-500">
          还没有照片，上传几张吧～
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((p) => (
            <div key={p.id} className="group relative overflow-hidden rounded-2xl">
              <img
                src={photoUrl(p.fileName)}
                alt={p.title || "照片"}
                className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <PhotoDeleteButton id={p.id} />
              {p.title && (
                <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-6 text-xs text-white">
                  {p.title}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
