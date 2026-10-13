"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import PolaroidWall, { type PolaroidPhoto } from "./PolaroidWall";

export type ExplorerAlbum = {
  id: number | string;
  name: string;
  /** 册内最新一张照片的 ISO 时间，作为封面日期 */
  date: string;
  /** 封面叠放照片（已按封面优先、最多 3 张排好） */
  coverUrls: string[];
  photos: PolaroidPhoto[];
};

// 确定性伪随机：同一相册每次渲染角度一致
function pseudo(i: number, seed: number, range: number) {
  return (((i * seed) % 100) / 100 - 0.5) * 2 * range;
}

// 三张拍立得叠放槽位：[rotate, x(px), y(px)]，闭合 / 悬停散开两态
const SLOTS: Record<"shut" | "open", Array<[number, number, number]>> = {
  shut: [
    [-8, -14, 4],
    [2, 0, -3],
    [9, 14, 4],
  ],
  open: [
    [-14, -24, -2],
    [-2, -3, -10],
    [14, 22, -2],
  ],
};
// 1~3 张时分别使用的槽位下标
const SLOT_PICK: Record<number, number[]> = { 1: [1], 2: [0, 2], 3: [0, 1, 2] };

function fmtDate(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

/** 相册封面：几张微倾拍立得叠放，悬停时整卡弹跳上浮、照片轻轻散开 */
function AlbumCover({
  album,
  index,
  onOpen,
}: {
  album: ExplorerAlbum;
  index: number;
  onOpen: () => void;
}) {
  const n = Math.min(album.coverUrls.length, 3);
  const picks = SLOT_PICK[n] ?? [0, 1, 2];

  // 每本相册加 ±3° 确定性微扰，避免所有书皮角度雷同
  const jitter = (k: number) => pseudo(index, 13 + k * 29, 3);
  const custom = {
    shut: picks.map((slot, k) => {
      const [r, x, y] = SLOTS.shut[slot];
      return [r + jitter(k), x, y] as [number, number, number];
    }),
    open: picks.map((slot, k) => {
      const [r, x, y] = SLOTS.open[slot];
      return [r + jitter(k), x, y] as [number, number, number];
    }),
  };

  return (
    <motion.div
      variants={{
        closed: { y: 0, scale: 1 },
        hover: { y: -10, scale: 1.03 },
      }}
      initial="closed"
      animate="closed"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="h-full will-change-transform"
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`打开相册 ${album.name}`}
        className="group flex h-full w-full cursor-pointer flex-col rounded-2xl border border-white/40 bg-white/55 p-5 text-left shadow-[0_12px_30px_-14px_rgba(0,0,0,0.35)] backdrop-blur-md transition-shadow hover:shadow-[0_26px_50px_-18px_rgba(0,0,0,0.4)] dark:border-white/10 dark:bg-white/10"
      >
        {/* 叠放拍立得区域：外层 flex 居中，内层 motion 只负责旋转/偏移，避免 transform 互相覆盖 */}
        <div className="relative mx-auto aspect-[5/4] w-full max-w-[240px]">
          {album.coverUrls.slice(0, 3).map((url, k) => (
            <div key={url} className="absolute inset-0 flex items-center justify-center">
              <motion.div
                variants={{
                  closed: {
                    rotate: custom.shut[k][0],
                    x: custom.shut[k][1],
                    y: custom.shut[k][2],
                  },
                  hover: {
                    rotate: custom.open[k][0],
                    x: custom.open[k][1],
                    y: custom.open[k][2],
                  },
                }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                style={{ zIndex: k === 1 ? 20 : k === 0 ? 10 : 30 }}
                className="h-[78%] w-[62%] rounded-[3px] bg-white p-1.5 pb-5 shadow-[0_10px_22px_-8px_rgba(0,0,0,0.4)] ring-1 ring-black/5"
              >
                <img
                  src={url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full rounded-[2px] object-cover object-[50%_25%]"
                />
              </motion.div>
            </div>
          ))}
        </div>

        {/* 相册信息 */}
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <h3 className="truncate text-base font-semibold text-zinc-800 dark:text-zinc-100">
            {album.name}
          </h3>
          <span className="shrink-0 text-xs tabular-nums text-zinc-400">
            {album.photos.length} 张
          </span>
        </div>
        <p className="mt-0.5 text-[11px] tracking-wide text-zinc-400 tabular-nums">
          {fmtDate(album.date)}
        </p>
      </button>
    </motion.div>
  );
}

export default function AlbumExplorer({ albums }: { albums: ExplorerAlbum[] }) {
  const [openId, setOpenId] = useState<number | string | null>(null);
  const open = albums.find((a) => a.id === openId) ?? null;

  // 翻开 / 返回时回到页面顶部，避免停在列表中段
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [openId]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {open ? (
        /* ── 第二层：相册内部（摊开的书页） ── */
        <motion.div
          key={`album-${open.id}`}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.38, ease: [0.2, 0.7, 0.3, 1] }}
        >
          {/* 顶栏：左上角返回箭头 + 相册名 */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpenId(null)}
              aria-label="返回相册列表"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/60 text-zinc-600 shadow-sm backdrop-blur-md transition hover:-translate-x-0.5 hover:text-[#5d7a8a] dark:border-white/10 dark:bg-white/10 dark:text-zinc-300"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold">{open.name}</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                {open.photos.length} 张 · {fmtDate(open.date)}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <PolaroidWall photos={open.photos} />
          </div>
        </motion.div>
      ) : (
        /* ── 第一层：相册书皮列表 ── */
        <motion.div
          key="album-list"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.2, 0.7, 0.3, 1] }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3"
        >
          {albums.map((album, i) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.08, 0.6), duration: 0.45, ease: "easeOut" }}
            >
              <AlbumCover album={album} index={i} onOpen={() => setOpenId(album.id)} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
