import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCreatorBySlug } from "@/lib/creators";
import { PayPanel } from "@/components/PayPanel";
import { PublicFeed } from "@/components/PublicFeed";

export const dynamic = "force-dynamic"; // always fetch fresh — a brand new signup must show up with no rebuild

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const creator = await getCreatorBySlug(slug);
  if (!creator) return { title: "Creator not found" };
  const title = `Support ${creator.name}`;
  const description = creator.bio ?? `Support ${creator.name} via UPI.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const creator = await getCreatorBySlug(slug);
  if (!creator) notFound();

  return (
    <main className="min-h-screen bg-surface">
      {/*
        Checked at actual phone width (390x844) — a taller banner+avatar
        pushed the tap-link below the fold on a real phone, where UPI
        payments actually happen. Trimmed to this size deliberately.
      */}
      <div className="bg-gradient-to-br from-accent to-accent2" style={{ height: 72 }} />

      <div className="mx-auto max-w-lg px-4 pb-10 space-y-6">
        {/*
          Avatar overlaps the banner/content seam — the standard
          cover-photo pattern (LinkedIn/Twitter profile headers) —
          instead of the banner and the pay card meeting as two flat
          stacked blocks. Ring color matches the page background so it
          reads as a clean cutout against the gradient, not a random
          white circle.
        */}
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

        <PayPanel creator={creator} />

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
