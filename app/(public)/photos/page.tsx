import AlbumExplorer, { type ExplorerAlbum } from "@/components/photos/AlbumExplorer";
import { photoUrl } from "@/lib/photo-url";
import { getPublicAlbums } from "@/lib/public-data";
import type { PublicPhotoItem } from "@/lib/public-data";

// 册内照片按时间倒序展示，编号每册独立，从 001 开始
function toPolaroids(photos: PublicPhotoItem[]) {
  return photos.map((p, i) => ({
    id: p.id,
    url: photoUrl(p.fileName),
    title: p.title,
    no: String(i + 1).padStart(3, "0"),
  }));
}

function buildAlbum(
  id: number | string,
  name: string,
  photos: PublicPhotoItem[],
  coverPhotoId?: number | null,
): ExplorerAlbum {
  // 指定封面优先排在最前，其余维持时间倒序；封面取前 3 张叠放
  const ordered = coverPhotoId
    ? [
        ...photos.filter((p) => p.id === coverPhotoId),
        ...photos.filter((p) => p.id !== coverPhotoId),
      ]
    : photos;
  return {
    id,
    name,
    date: photos[0]?.createdAt ?? new Date(0).toISOString(),
    coverUrls: ordered.slice(0, 3).map((p) => photoUrl(p.fileName)),
    photos: toPolaroids(photos),
  };
}

export default async function PhotosPage() {
  const { albums, unassigned } = await getPublicAlbums();

  const explorerAlbums: ExplorerAlbum[] = [
    ...albums.map((a) => buildAlbum(a.id, a.name, a.photos, a.coverPhotoId)),
    // 未归入任何相册的散片汇成一本系统相册
    ...(unassigned.length > 0 ? [buildAlbum("unassigned", "散落碎片", unassigned)] : []),
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">照片</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        翻开一本本相册，里面是贴在墙上的生活碎片
      </p>

      {explorerAlbums.length === 0 ? (
        <div className="glass mt-8 rounded-2xl p-12 text-center text-zinc-400">
          还没有照片～
        </div>
      ) : (
        <div className="mt-10">
          <AlbumExplorer albums={explorerAlbums} />
        </div>
      )}
    </div>
  );
}
