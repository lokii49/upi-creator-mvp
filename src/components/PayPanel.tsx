"use client";

import type { Creator } from "@/lib/creators";
import { usePaySession } from "@/lib/usePaySession";
import { cardClass, gradientTextClass } from "@/lib/ui";
import { ClaimForm } from "./ClaimForm";

// Skeleton variant "card" (default): tier picker + QR + tap-link in one
// unified card. See HeroPayCard for the QR-first variant.
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
      <div className={`${cardClass} p-5 sm:p-6 space-y-5`}>
        <div className="grid grid-cols-2 gap-2.5">
          {creator.tiers.map((t, i) => {
            const active = i === selected;
            return (
              <button
                key={t.label}
                onClick={() => selectTier(i)}
                className={`rounded-2xl border-2 px-4 py-3 text-left transition ${
                  active
                    ? "border-accent bg-accent-soft"
                    : "border-border bg-white hover:border-accent/30"
                }`}
              >
                <div className="text-xs text-muted">☕ {t.label}</div>
                <div className={`text-lg font-extrabold ${active ? gradientTextClass : "text-ink"}`}>
                  ₹{t.amount}
                </div>
              </button>
            );
          })}
        </div>

        {vpaMissing && (
          <p className="rounded-lg border border-accent/30 bg-accent-soft p-3 text-sm text-accent">
            ⚠️ This creator&apos;s UPI ID isn&apos;t set yet — the pay link below won&apos;t work
            until it is.
          </p>
        )}

        <div className="flex flex-col items-center gap-3 border-t border-border pt-5">
          <div
            className="flex items-center justify-center rounded-xl border border-border"
            style={{ minHeight: 200, minWidth: 200 }}
          >
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="UPI QR code" width={200} height={200} className="rounded-xl" />
            ) : (
              <span className="text-xs text-muted">Generating QR…</span>
            )}
          </div>
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
      </div>

      <ClaimForm creatorSlug={creator.slug} tier={tier} tr={tr} />
    </div>
  );
}
