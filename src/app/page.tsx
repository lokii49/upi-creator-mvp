import Link from "next/link";
import { listCreators } from "@/lib/creators";
import { eyebrowClass, cardClass, secondaryButtonClass, gradientTextClass } from "@/lib/ui";
import { BrandBadge } from "@/components/BrandBadge";

export const dynamic = "force-dynamic";

export default async function Home() {
  const creators = await listCreators();

  return (
    <main className="min-h-screen bg-surface flex items-start justify-center">
      <div className="w-full max-w-lg px-4 py-16 space-y-10">
        <div className="text-center space-y-4">
          <span className={eyebrowClass}>
            <BrandBadge size={18} />
            tinyact / support
          </span>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">
            Support your favorite <span className={gradientTextClass}>creators</span>
          </h1>
          <p className="text-sm text-muted max-w-xs mx-auto">
            Straight to their own UPI ID — no middleman, no payout delay.
          </p>
        </div>

        {creators.length > 0 ? (
          <ul className={`${cardClass} divide-y divide-border overflow-hidden text-left`}>
            {creators.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/${c.slug}`}
                  className="flex items-center justify-between gap-3 px-5 py-4 text-ink hover:bg-surface/60 transition"
                >
                  <span className="font-semibold">{c.name}</span>
                  <span className="text-xs text-muted">/{c.slug}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted text-center">No creator pages yet.</p>
        )}

        <div className="flex justify-center gap-3">
          <Link
            href="/register"
            className="rounded-full bg-gradient-to-r from-accent to-accent2 text-white px-6 py-2 text-sm font-semibold shadow-[0_8px_20px_-6px_rgba(99,102,241,0.45)] hover:opacity-90 transition"
          >
            Create your page
          </Link>
          <Link href="/dashboard" className={secondaryButtonClass}>
            Manage your page
          </Link>
        </div>
      </div>
    </main>
  );
}
