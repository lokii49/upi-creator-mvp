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
    <main className="mx-auto max-w-lg px-4 py-10 space-y-10">
      <header className="flex flex-col items-center gap-3 text-center">
        <div
          aria-hidden
          className="flex items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800 text-2xl font-semibold"
          style={{ height: 88, width: 88 }}
        >
          {creator.name.charAt(0)}
        </div>
        <h1 className="text-xl font-semibold">{creator.name}</h1>
        {creator.bio && <p className="text-sm text-neutral-500">{creator.bio}</p>}
      </header>

      <PayPanel creator={creator} />

      <section>
        <PublicFeed creatorSlug={creator.slug} />
      </section>

      <footer className="text-center text-xs text-neutral-400 pt-6">
        Payments go directly to {creator.name}&apos;s own UPI ID. This page never touches
        your money — it only helps them know who supported them.
      </footer>
    </main>
  );
}
