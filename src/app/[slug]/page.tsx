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
    <main className="min-h-screen bg-yellow">
      <div className="mx-auto max-w-lg px-4 py-14 space-y-8">
        <header className="flex flex-col items-center gap-3 text-center">
          <div
            aria-hidden
            className="flex items-center justify-center rounded-full bg-card border-2 border-ink shadow-pop-lg text-4xl font-display font-semibold text-ink"
            style={{ height: 100, width: 100 }}
          >
            {creator.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <h1 className="font-display text-4xl font-semibold text-ink">{creator.name}</h1>
            {creator.bio && <p className="text-sm text-ink/70 max-w-xs mx-auto">{creator.bio}</p>}
          </div>
        </header>

        <div className="rounded-3xl bg-cream border-2 border-ink shadow-pop-lg p-6 space-y-8">
          <PayPanel creator={creator} />
          <PublicFeed creatorSlug={creator.slug} />
        </div>

        <footer className="text-center text-xs text-ink/60 pt-2 leading-relaxed">
          Payments go directly to {creator.name}&apos;s own UPI ID.
          <br />
          This page never touches your money — it only helps them know who supported them.
        </footer>
      </div>
    </main>
  );
}
