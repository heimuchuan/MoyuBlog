import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import MusicManager from "@/components/admin/MusicManager";

const orderBy = [{ isDefault: "desc" as const }, { order: "asc" as const }, { id: "asc" as const }];

const getPlaylists = unstable_cache(
  async () => prisma.playlist.findMany({ orderBy }),
  ["admin-playlists"],
  { revalidate: 10, tags: ["music"] }
);

export default async function AdminMusicPage() {
  const rows = await getPlaylists();
  return (
    <div className="space-y-6">
      <h1 className="industrial-zh text-2xl font-bold">音乐</h1>
      <MusicManager
        initial={rows.map((r) => ({
          id: r.id,
          playlistId: r.playlistId,
          name: r.name,
          cover: r.cover,
          songCount: r.songCount,
          order: r.order,
          active: r.active,
          isDefault: r.isDefault,
        }))}
      />
    </div>
  );
}
