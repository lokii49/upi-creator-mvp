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
    <main className="min-h-screen bg-surface">
      <div className="mx-auto max-w-lg px-4 py-16 space-y-10">
        <header className="flex flex-col items-center gap-3 text-center">
          <div
            aria-hidden
            className="flex items-center justify-center rounded-full bg-accent-soft text-2xl font-semibold text-accent"
            style={{ height: 80, width: 80 }}
          >
            {creator.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-ink tracking-tight">{creator.name}</h1>
            {creator.bio && <p className="text-sm text-muted max-w-xs mx-auto">{creator.bio}</p>}
          </div>
        </header>

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
