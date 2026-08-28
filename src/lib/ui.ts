// Shared Tailwind class strings for the warm-paper/receipt design language
// (see globals.css for the token definitions). Kept here so every form
// across register/dashboard/claim uses the exact same input/button
// treatment instead of each drifting slightly.
export const inputClass =
  "w-full rounded-md border border-rule bg-paper-raised px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink";

export const primaryButtonClass =
  "w-full rounded-md bg-ink text-paper py-2.5 text-sm font-medium hover:bg-marigold-ink transition disabled:opacity-50";

export const eyebrowClass = "font-receipt text-[10px] tracking-[0.25em] uppercase text-muted";
