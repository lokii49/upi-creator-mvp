// Shared class tokens. Every form/page pulls from here instead of
// hand-writing utility strings, so a design pass only has to touch this
// file + globals.css — components stay untouched and can't silently
// drift out of sync (bit us twice in earlier passes).

// Full-width input. Compact variants below are separate strings, not
// `${inputBaseClass} + override`: two utility classes for the same CSS
// property are order-dependent in the compiled stylesheet, not
// string-order-dependent, so appending "py-1.5" after "py-2.5" doesn't
// reliably win. Keeping each size as its own complete string sidesteps
// that trap entirely.
export const inputClass =
  "w-full rounded-2xl border border-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition";

export const inputCompactClass =
  "rounded-xl border border-border bg-white px-3 py-1.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition";

export const primaryButtonClass =
  "w-full rounded-full bg-gradient-to-r from-accent to-accent2 text-white py-2.5 text-sm font-semibold shadow-[0_8px_20px_-6px_rgba(99,102,241,0.45)] hover:opacity-90 transition disabled:opacity-50 disabled:shadow-none";

export const secondaryButtonClass =
  "rounded-full border border-border bg-white text-ink px-4 py-2 text-sm font-semibold hover:border-ink/30 transition";

export const eyebrowClass =
  "inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent";

// The floating-card look — soft double shadow (a tight neutral one for
// edge definition, a wider tinted one for the "lifted" feel) instead of
// a flat border-only card.
export const cardClass =
  "rounded-3xl border border-border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_40px_-16px_rgba(99,102,241,0.2)]";

export const gradientTextClass = "bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent";
