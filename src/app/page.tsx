import Link from "next/link";
import { listCreators } from "@/lib/creators";
import { eyebrowClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function Home() {
  const creators = await listCreators();

  return (
    <main className="min-h-screen bg-surface flex items-start justify-center">
      <div className="w-full max-w-lg px-4 py-16 text-center space-y-8">
        <div className="space-y-1.5">
          <p className={eyebrowClass}>tinyact / support</p>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">
            Creator support pages
          </h1>
        </div>

        {creators.length > 0 ? (
          <ul className="divide-y divide-border rounded-xl border border-border bg-bg overflow-hidden text-left">
            {creators.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/${c.slug}`}
                  className="block px-4 py-3 text-ink hover:bg-surface transition"
                >
                  <span className="font-medium">{c.name}</span>{" "}
                  <span className="text-xs text-muted">/{c.slug}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No creator pages yet.</p>
        )}

        <div className="flex justify-center gap-3">
          <Link
            href="/register"
            className="rounded-lg bg-ink text-white px-4 py-2 text-sm font-medium hover:bg-ink/90 transition"
          >
            Create your page
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-border text-ink px-4 py-2 text-sm font-medium hover:border-ink/30 transition"
          >
            Manage your page
          </Link>
        </div>
      </div>
    </main>
  );
}
