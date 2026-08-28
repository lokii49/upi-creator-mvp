// Shared Tailwind class strings for the Buy-Me-a-Coffee-style design
// language (see globals.css for tokens + the .shadow-pop utilities).
// Kept here so every form across register/dashboard/claim uses the same
// input/button treatment instead of each drifting slightly.
export const inputClass =
  "w-full rounded-xl border-2 border-ink bg-card px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-yellow";

export const primaryButtonClass =
  "w-full rounded-full border-2 border-ink bg-yellow text-ink py-3 text-sm font-display font-semibold shadow-pop shadow-pop-press transition-transform disabled:opacity-50";

export const eyebrowClass = "font-display text-xs font-semibold uppercase tracking-wide text-muted";
