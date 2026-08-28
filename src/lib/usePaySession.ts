"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { Creator } from "@/lib/creators";
import { buildUpiUri, generateTr } from "@/lib/upi";
import { logEvent } from "@/lib/events";

// Shared across every layout skeleton (card/hero/banner) so QR
// generation, tr rotation, and view/tap logging live in exactly one
// place instead of being copy-pasted per variant and drifting apart.
export function usePaySession(creator: Creator) {
  const [selected, setSelected] = useState(0);
  // Empty on both server-render and first client render — identical, so
  // no hydration mismatch. Never seed with useState(() => generateTr()):
  // that runs at build time too, baking a value that won't match what
  // the client generates.
  const [tr, setTr] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const tier = creator.tiers[selected] as Creator["tiers"][number] | undefined;
  const uri = tier && tr ? buildUpiUri(creator, tier, tr) : "";

  useEffect(() => {
    setTr(generateTr());
    logEvent(creator.slug, "view");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!uri) return;
    let cancelled = false;
    QRCode.toDataURL(uri, {
      margin: 1,
      width: 220,
      color: { dark: "#172026", light: "#ffffff" },
    }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [uri]);

  function selectTier(i: number) {
    setSelected(i);
    setTr(generateTr());
  }

  function handleTap() {
    logEvent(creator.slug, "tap", tr);
  }

  return { selected, tier, uri, qrDataUrl, tr, selectTier, handleTap };
}
