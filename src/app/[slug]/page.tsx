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

  // banner won the live 3-way comparison — now the default. ?layout=card
  // / ?layout=hero still reachable for reference.
  const layout: Layout = layoutParam === "card" || layoutParam === "hero" ? layoutParam : "banner";

  return (
    <main className="min-h-screen bg-surface">
      {/*
        Checked at actual phone width (390x844) — the original 128px
        banner + 88px avatar + eyebrow badge pushed the tap-link below
        the fold on a real phone, where UPI payments actually happen.
        Trimmed banner/avatar and dropped the redundant eyebrow badge
        here (the brand mark still appears on card/hero).
      */}
      {layout === "banner" && (
        <div className="bg-gradient-to-br from-accent to-accent2" style={{ height: 72 }} />
      )}

      <div className={`mx-auto max-w-lg px-4 pb-10 space-y-6 ${layout === "banner" ? "" : "pt-10"}`}>
        {layout === "banner" && (
          // Avatar overlaps the banner/content seam — the standard
          // cover-photo pattern (LinkedIn/Twitter profile headers) —
          // instead of the banner and the pay card meeting as two flat
          // stacked blocks. Ring color matches the page background so
          // it reads as a clean cutout against the gradient, not a
          // random white circle.
          <div className="-mt-8 flex flex-col items-center text-center gap-1.5">
            <div
              aria-hidden
              className="flex items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent2 text-lg font-extrabold text-white ring-4 ring-surface shadow-[0_8px_20px_-6px_rgba(15,23,42,0.35)]"
              style={{ height: 64, width: 64 }}
            >
              {creator.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-ink tracking-tight">{creator.name}</h1>
              {creator.bio && <p className="text-sm text-muted max-w-xs mx-auto">{creator.bio}</p>}
            </div>
          </div>
        )}

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
