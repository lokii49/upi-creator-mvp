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
  return {
    title: `Support ${creator.name}`,
    description: creator.bio ?? `Support ${creator.name} via UPI.`,
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
    <main className="min-h-screen paper-texture">
      <div className="mx-auto max-w-lg px-4 py-14 space-y-12">
        <header className="flex flex-col items-center gap-4 text-center">
          <div
            aria-hidden
            className="flex items-center justify-center rounded-full bg-paper-raised border border-rule text-3xl font-display text-ink"
            style={{ height: 92, width: 92 }}
          >
            {creator.name.charAt(0)}
          </div>
          <div className="space-y-1.5">
            <p className="font-receipt text-[11px] tracking-[0.25em] uppercase text-muted">
              accepting support via UPI
            </p>
            <h1 className="font-display text-5xl leading-none text-ink">{creator.name}</h1>
            {creator.bio && <p className="text-sm text-muted max-w-xs mx-auto">{creator.bio}</p>}
          </div>
        </header>

        <PayPanel creator={creator} />

        <section>
          <PublicFeed creatorSlug={creator.slug} />
        </section>

        <footer className="text-center font-receipt text-[11px] text-muted pt-4 leading-relaxed">
          Payments go directly to {creator.name}&apos;s own UPI ID.
          <br />
          This page never touches your money — it only helps them know who supported them.
        </footer>
      </div>
    </main>
  );
}
