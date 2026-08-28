import { notFound } from "next/navigation";
import { creators, getCreator } from "@/lib/creators";
import { PayPanel } from "@/components/PayPanel";
import { PublicFeed } from "@/components/PublicFeed";

export function generateStaticParams() {
  return creators.map((c) => ({ slug: c.slug }));
}

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const creator = getCreator(slug);
  if (!creator) notFound();

  return (
    <main className="mx-auto max-w-lg px-4 py-10 space-y-10">
      <header className="flex flex-col items-center gap-3 text-center">
        {creator.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={creator.photo}
            alt={creator.name}
            width={88}
            height={88}
            className="rounded-full object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-22 w-22 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800 text-2xl font-semibold"
            style={{ height: 88, width: 88 }}
          >
            {creator.name.charAt(0)}
          </div>
        )}
        <h1 className="text-xl font-semibold">{creator.name}</h1>
        <p className="text-sm text-neutral-500">{creator.bio}</p>
      </header>

      <PayPanel creator={creator} />

      <section>
        <PublicFeed creatorSlug={creator.slug} />
      </section>

      <footer className="text-center text-xs text-neutral-400 pt-6">
        Payments go directly to {creator.name.split(" — ")[0]}&apos;s own UPI ID. This page
        never touches your money — it only helps them know who supported them.
      </footer>
    </main>
  );
}
