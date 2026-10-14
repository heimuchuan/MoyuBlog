import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import QuoteManager from "@/components/admin/QuoteManager";

const getQuotes = unstable_cache(
  async () => prisma.quote.findMany({ orderBy: { createdAt: "desc" } }),
  ["admin-quotes-list"],
  { revalidate: 10 }
);

export default async function AdminQuotesPage() {
  const quotes = await getQuotes();
  return (
    <div className="space-y-6">
      <h1 className="industrial-zh text-2xl font-bold">金句</h1>
      <QuoteManager
        initial={quotes.map((q) => ({
          id: q.id,
          content: q.content,
          active: q.active,
          createdAt: typeof q.createdAt === "string" ? q.createdAt : q.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
