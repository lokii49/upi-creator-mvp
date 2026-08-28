// Shared Tailwind class strings for the clean/minimal design language
// (see globals.css for tokens). Kept here so every form across
// register/dashboard/claim uses the same input/button treatment instead
// of each drifting slightly.
export const inputClass =
  "w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition";

export const primaryButtonClass =
  "w-full rounded-lg bg-ink text-white py-2.5 text-sm font-medium hover:bg-ink/90 transition disabled:opacity-50";

export const eyebrowClass = "text-xs font-medium uppercase tracking-wide text-muted";
