import Link from "next/link";
import { listCreators } from "@/lib/creators";
import { eyebrowClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function Home() {
  const creators = await listCreators();

  return (
    <main className="min-h-screen paper-texture flex items-start justify-center">
      <div className="w-full max-w-lg px-4 py-14 text-center space-y-8">
        <div className="space-y-1.5">
          <p className={eyebrowClass}>tinyact / support</p>
          <h1 className="font-display text-4xl text-ink">Creator support pages</h1>
        </div>

        {creators.length > 0 ? (
          <div className="rounded-lg border-2 border-rule bg-paper-raised overflow-hidden text-left">
            {creators.map((c, i) => (
              <div key={c.slug}>
                {i > 0 && <hr className="tear-line" style={{ ["--notch-bg" as string]: "var(--paper-raised)" }} />}
                <Link
                  href={`/${c.slug}`}
                  className="block px-4 py-3 text-ink hover:bg-paper transition"
                >
                  {c.name}{" "}
                  <span className="font-receipt text-xs text-muted">/{c.slug}</span>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-receipt text-xs text-muted">no creator pages yet</p>
        )}

        <div className="flex justify-center gap-3">
          <Link
            href="/register"
            className="inline-block rounded-md bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-marigold-ink transition"
          >
            Create your page
          </Link>
          <Link
            href="/dashboard"
            className="inline-block rounded-md border-2 border-rule text-ink px-4 py-2 text-sm font-medium hover:border-ink transition"
          >
            Manage your page
          </Link>
        </div>
      </div>
    </main>
  );
}
