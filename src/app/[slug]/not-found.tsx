import Link from "next/link";
import { cardClass, primaryButtonClass, eyebrowClass } from "@/lib/ui";
import { BrandBadge } from "@/components/BrandBadge";

// Handles notFound() calls from [slug]/page.tsx — a mistyped or
// deleted creator URL is the single most likely thing a visitor hits
// (they're following a link someone shared), so it gets the same
// visual language as the rest of the product instead of Next's bare
// default 404.
export default function CreatorNotFound() {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-full max-w-sm px-4 text-center space-y-6">
        <span className={eyebrowClass}>
          <BrandBadge size={14} />
          tinyact / support
        </span>
        <div className={`${cardClass} p-8 space-y-2`}>
          <p className="text-4xl">🔍</p>
          <h1 className="text-lg font-extrabold text-ink">No page at this link</h1>
          <p className="text-sm text-muted">
            This creator hasn&apos;t signed up yet, or the URL was typed wrong — double-check
            the link you followed.
          </p>
        </div>
        <Link href="/register" className={primaryButtonClass}>
          Create your own page
        </Link>
      </div>
    </main>
  );
}
