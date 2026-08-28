// The one signature element this pass is built around: a gradient
// squircle carrying the ₹ mark — grounded in what the product actually
// moves (rupees via UPI), not a generic sparkle/AI icon. Used sparingly:
// brand mark, creator avatar, nothing else gets the gradient treatment.
export function BrandBadge({ size = 36 }: { size?: number }) {
  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent2 font-extrabold text-white shadow-[0_6px_16px_-4px_rgba(99,102,241,0.55)]"
      style={{ height: size, width: size, fontSize: size * 0.5 }}
    >
      ₹
    </div>
  );
}
