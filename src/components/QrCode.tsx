"use client";

import { useEffect, useRef } from "react";
import type QRCodeStyling from "qr-code-styling";

// Small ₹ mark, same brand gradient as BrandBadge, encoded as an inline
// SVG data URI so qr-code-styling can drop it in as the center image —
// its own image-embedding handles the module excavation around the
// logo properly (vs. our earlier manual absolute-positioned overlay).
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#14b8a6"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><text x="32" y="44" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="800" fill="white" text-anchor="middle">₹</text></svg>`;
const LOGO_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(LOGO_SVG)}`;

// Solid on-brand indigo dot-matrix — dropped the two-tone gradient
// (indigo->teal), which read muddy at real dot size instead of crisp.
// Finder squares still stay solid near-black, not the accent color:
// they're the part a scanner locks onto first, and near-black holds
// more contrast than a mid-tone indigo would. errorCorrectionLevel "H"
// (~30% obstruction budget) covers the center logo with margin to spare.
export function QrCode({ uri, size = 240 }: { uri: string; size?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!uri || !containerRef.current) return;
    let cancelled = false;

    import("qr-code-styling").then(({ default: QRCodeStylingCtor }) => {
      if (cancelled || !containerRef.current) return;

      if (!qrRef.current) {
        qrRef.current = new QRCodeStylingCtor({
          width: size,
          height: size,
          data: uri,
          margin: 8,
          qrOptions: { errorCorrectionLevel: "H" },
          dotsOptions: { type: "dots", color: "#6366f1" },
          cornersSquareOptions: { type: "extra-rounded", color: "#0b0f19" },
          cornersDotOptions: { type: "dot", color: "#0b0f19" },
          backgroundOptions: { color: "#ffffff" },
          image: LOGO_DATA_URI,
          imageOptions: { imageSize: 0.22, margin: 3 },
        });
        containerRef.current.innerHTML = "";
        qrRef.current.append(containerRef.current);
      } else {
        qrRef.current.update({ data: uri });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [uri, size]);

  return (
    <div
      className="flex items-center justify-center rounded-3xl border-2 border-accent-soft bg-white p-3"
      style={{ minHeight: size, minWidth: size }}
    >
      <div ref={containerRef} />
      {!uri && <span className="text-xs text-muted">Generating QR…</span>}
    </div>
  );
}
