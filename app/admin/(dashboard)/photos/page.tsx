import { prisma } from "@/lib/prisma";
import PhotoManager from "@/components/admin/PhotoManager";

export default async function AdminPhotosPage() {
  const [albums, photos] = await Promise.all([
    prisma.album.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.photo.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div>
      <h1 className="industrial-zh mb-6 text-2xl font-bold">照片</h1>
      <PhotoManager
        initialAlbums={albums.map((a) => ({ id: a.id, name: a.name }))}
        initialPhotos={photos.map((p) => ({
          id: p.id,
          title: p.title,
          fileName: p.fileName,
          albumId: p.albumId,
        }))}
      />
    </div>
  );
}
