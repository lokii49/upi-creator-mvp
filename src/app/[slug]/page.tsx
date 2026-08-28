import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCreatorBySlug } from "@/lib/creators";
import { PayPanel } from "@/components/PayPanel";
import { HeroPayCard } from "@/components/HeroPayCard";
import { PublicFeed } from "@/components/PublicFeed";
import { BrandBadge } from "@/components/BrandBadge";

export const dynamic = "force-dynamic"; // always fetch fresh — a brand new signup must show up with no rebuild

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const creator = await getCreatorBySlug(slug);
  if (!creator) return { title: "Creator not found" };
  return {
    title: `Support ${creator.name}`,
    description: creator.bio ?? `Support ${creator.name} via UPI.`,
  };
}

type Layout = "card" | "hero" | "banner";

export default async function CreatorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ layout?: string }>;
}) {
  const { slug } = await params;
  const { layout: layoutParam } = await searchParams;
  const creator = await getCreatorBySlug(slug);
  if (!creator) notFound();

  // Three real skeletons to compare live, not mockups: ?layout=card
  // (default — slim identity row, one unified pay card), ?layout=hero
  // (QR is the literal first thing on the page), ?layout=banner
  // (full-bleed identity header, same pay card as "card" below it).
  const layout: Layout =
    layoutParam === "hero" || layoutParam === "banner" ? layoutParam : "card";

  return (
    <main className="min-h-screen bg-surface">
      {layout === "banner" && (
        <div className="bg-gradient-to-br from-accent to-accent2 px-4 py-10">
          <div className="mx-auto max-w-lg flex items-center gap-4">
            <div
              aria-hidden
              className="flex shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl font-extrabold text-white ring-2 ring-white/40"
              style={{ height: 68, width: 68 }}
            >
              {creator.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-white/70">
                tinyact / support
              </p>
              <h1 className="text-2xl font-extrabold text-white truncate">{creator.name}</h1>
              {creator.bio && <p className="text-sm text-white/80 truncate">{creator.bio}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-lg px-4 py-10 space-y-6">
        {layout === "card" && (
          <>
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted">
              <BrandBadge size={14} />
              tinyact / support
            </div>
            <div className="flex items-center gap-3">
              <div
                aria-hidden
                className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent2 text-lg font-extrabold text-white shadow-[0_8px_18px_-6px_rgba(99,102,241,0.5)]"
                style={{ height: 52, width: 52 }}
              >
                {creator.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-extrabold text-ink tracking-tight truncate">
                  {creator.name}
                </h1>
                {creator.bio && <p className="text-sm text-muted truncate">{creator.bio}</p>}
              </div>
            </div>
          </>
        )}

        {layout === "hero" && (
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted">
            <BrandBadge size={14} />
            tinyact / support
          </div>
        )}

        {layout === "hero" ? <HeroPayCard creator={creator} /> : <PayPanel creator={creator} />}

        <PublicFeed creatorSlug={creator.slug} />

        <footer className="text-center text-xs text-muted pt-2 leading-relaxed">
          Payments go directly to {creator.name}&apos;s own UPI ID.
          <br />
          This page never touches your money — it only helps them know who supported them.
        </footer>
      </div>
    </main>
  );
}
