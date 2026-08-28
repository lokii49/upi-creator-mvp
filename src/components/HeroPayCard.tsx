"use client";

import type { Creator } from "@/lib/creators";
import { usePaySession } from "@/lib/usePaySession";
import { cardClass, gradientTextClass } from "@/lib/ui";
import { ClaimForm } from "./ClaimForm";

// Skeleton variant "hero": QR is the first thing on the page, full stop.
// Identity is a small caption riding on the QR card itself, not a
// separate row above it. Tier amounts are a compact pill row that sits
// on top of the QR like a price tag, not a 2-up grid before it.
export function HeroPayCard({ creator }: { creator: Creator }) {
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
      <div className={`${cardClass} p-6 flex flex-col items-center gap-4`}>
        <div className="flex items-center gap-2">
          <div
            aria-hidden
            className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent2 text-xs font-extrabold text-white"
            style={{ height: 24, width: 24 }}
          >
            {creator.name.charAt(0)}
          </div>
          <p className="text-sm font-semibold text-ink">{creator.name}</p>
        </div>

        <div
          className="flex items-center justify-center rounded-xl border border-border"
          style={{ minHeight: 220, minWidth: 220 }}
        >
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="UPI QR code" width={220} height={220} className="rounded-xl" />
          ) : (
            <span className="text-xs text-muted">Generating QR…</span>
          )}
        </div>

        <div className="flex gap-2">
          {creator.tiers.map((t, i) => {
            const active = i === selected;
            return (
              <button
                key={t.label}
                onClick={() => selectTier(i)}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  active
                    ? `bg-gradient-to-r from-accent to-accent2 text-white shadow-[0_6px_14px_-6px_rgba(99,102,241,0.5)]`
                    : "border border-border text-muted hover:border-accent/30"
                }`}
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

        <p className="text-xs text-muted text-center max-w-[30ch]">
          Scan with your UPI app&apos;s built-in scanner (GPay, PhonePe, Paytm, etc.)
        </p>
        <a
          href={uri}
          onClick={handleTap}
          className="w-full text-center rounded-full border border-border py-2 text-sm text-muted hover:border-accent/40 hover:text-ink transition"
        >
          or tap to pay ₹{tier.amount} directly
        </a>
        <p className="text-[11px] text-muted text-center">
          Tapping may open a different app than you expect on iPhone — if so, use the QR
          above instead.
        </p>
      </div>

      <ClaimForm creatorSlug={creator.slug} tier={tier} tr={tr} />
    </div>
  );
}
