import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCreatorBySlug } from "@/lib/creators";
import { PayPanel } from "@/components/PayPanel";
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
      <div className="mx-auto max-w-lg px-4 py-10 space-y-6">
        {/*
          Pass 4 buried identity below an 84px hero avatar and put the QR
          ~700px down, after two separate stacked cards. User rated it
          1/10 on exactly that: "the name, QR placement and all other".
          This pass: identity is one slim row (not a detached hero
          block), and the tier picker + QR + pay link live inside ONE
          card immediately below it — no scrolling past extra boxes to
          reach the thing people actually came to do.
        */}
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
