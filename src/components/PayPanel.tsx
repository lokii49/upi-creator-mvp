"use client";

import type { Creator } from "@/lib/creators";
import { usePaySession } from "@/lib/usePaySession";
import { cardClass, gradientTextClass } from "@/lib/ui";
import { ClaimForm } from "./ClaimForm";

// Skeleton variant "card" (default): tier picker + QR + tap-link in one
// unified card. See HeroPayCard for the QR-first variant.
//
// Trimmed after checking this at actual phone width (390x844) — the
// original 2-up tier grid + a caption both above and below the QR
// pushed the tap-link below the fold. Pills + one collapsed caption
// bring the whole payment card back above the fold on mobile.
export function PayPanel({ creator }: { creator: Creator }) {
  const { selected, tier, uri, qrDataUrl, tr, selectTier, handleTap } = usePaySession(creator);

  if (creator.tiers.length === 0 || !tier) {
    return (
      <p className="text-sm text-neutral-500">
        This creator hasn&apos;t set up any support tiers yet.
      </p>
    );
  }

  const vpaMissing = !creator.vpa;

  return (
    <div className="space-y-6">
      <div className={`${cardClass} p-5 flex flex-col items-center gap-4`}>
        <div className="flex gap-2">
          {creator.tiers.map((t, i) => {
            const active = i === selected;
            return (
              <button
                key={t.label}
                onClick={() => selectTier(i)}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  active
                    ? "bg-gradient-to-r from-accent to-accent2 text-white shadow-[0_6px_14px_-6px_rgba(99,102,241,0.5)]"
                    : "border border-border text-muted hover:border-accent/30"
                }`}
                title={t.label}
              >
                ₹{t.amount}
              </button>
            );
          })}
        </div>

        {vpaMissing && (
          <p className="rounded-lg border border-accent/30 bg-accent-soft p-3 text-sm text-accent w-full text-center">
            ⚠️ UPI ID isn&apos;t set yet — the pay link below won&apos;t work until it is.
          </p>
        )}

        <div
          className="flex items-center justify-center rounded-xl border border-border"
          style={{ minHeight: 190, minWidth: 190 }}
        >
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="UPI QR code" width={190} height={190} className="rounded-xl" />
          ) : (
            <span className="text-xs text-muted">Generating QR…</span>
          )}
        </div>

        <a
          href={uri}
          onClick={handleTap}
          className="w-full text-center rounded-full border border-border py-2 text-sm text-muted hover:border-accent/40 hover:text-ink transition"
        >
          or tap to pay ₹{tier.amount} directly
        </a>
        <p className="text-[11px] text-muted text-center -mt-2">
          iPhone may open a different app when tapping — scan the QR above if so.
        </p>
      </div>

      <ClaimForm creatorSlug={creator.slug} tier={tier} tr={tr} />
    </div>
  );
}
