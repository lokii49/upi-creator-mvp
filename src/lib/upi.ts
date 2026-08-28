import type { Creator, Tier } from "./creators";

/**
 * Builds a `upi://pay` intent URI per the NPCI spec.
 *
 * - `pn`/`tn` are URL-encoded — spaces/punctuation in a creator name or
 *   note otherwise silently break the link in some UPI apps.
 * - `am` is a plain decimal amount, no currency symbol.
 * - `tr` is a unique reference per pay attempt, used only to correlate a
 *   tap → claim for the claim-to-tap ratio. It is NOT a payment guarantee:
 *   the amount is editable by the payer on a plain VPA, and this app never
 *   sees whether the payment actually happened. Self-report only.
 */
export function buildUpiUri(creator: Creator, tier: Tier, tr: string): string {
  const params = new URLSearchParams({
    pa: creator.vpa,
    pn: creator.name,
    am: String(tier.amount),
    cu: "INR",
    tn: `Support for ${creator.name} — ${tier.label}`,
    tr,
  });
  return `upi://pay?${params.toString()}`;
}

/** Short random reference — good enough for client-side event correlation. */
export function generateTr(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 20);
  }
  return `tr${Date.now()}${Math.random().toString(36).slice(2, 10)}`;
}
