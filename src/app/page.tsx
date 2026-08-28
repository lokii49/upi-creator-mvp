import Link from "next/link";
import { listCreators } from "@/lib/creators";
import { eyebrowClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function Home() {
  const creators = await listCreators();

  return (
    <main className="min-h-screen bg-yellow flex items-start justify-center">
      <div className="w-full max-w-lg px-4 py-14 text-center space-y-8">
        <div className="space-y-1.5">
          <p className={eyebrowClass}>tinyact / support</p>
          <h1 className="font-display text-4xl font-semibold text-ink">
            Creator support pages
          </h1>
        </div>

        {creators.length > 0 ? (
          <ul className="space-y-2 text-left">
            {creators.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/${c.slug}`}
                  className="block rounded-xl border-2 border-ink bg-card shadow-pop px-4 py-3 text-ink hover:bg-cream transition"
                >
                  <span className="font-semibold">{c.name}</span>{" "}
                  <span className="text-xs text-muted">/{c.slug}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink/70">No creator pages yet.</p>
        )}

        <div className="flex justify-center gap-3">
          <Link
            href="/register"
            className="rounded-full border-2 border-ink bg-card px-5 py-2.5 text-sm font-display font-semibold text-ink shadow-pop shadow-pop-press transition-transform"
          >
            Create your page
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border-2 border-ink bg-transparent px-5 py-2.5 text-sm font-display font-semibold text-ink hover:bg-card/50 transition"
          >
            Manage your page
          </Link>
        </div>
      </div>
    </main>
  );
}
