"use client";

import { useEffect, useState } from "react";
import type { Creator } from "@/lib/creators";
import { buildUpiUri, generateTr } from "@/lib/upi";
import { logEvent } from "@/lib/events";

// Shared across every layout skeleton (card/hero/banner) so tier
// selection, tr rotation, and view/tap logging live in exactly one
// place instead of being copy-pasted per variant and drifting apart.
// QR rendering itself lives in QrCode.tsx (it needs the DOM, so it
// generates from `uri` directly rather than through this hook).
export function usePaySession(creator: Creator) {
  const [selected, setSelected] = useState(0);
  // Empty on both server-render and first client render — identical, so
  // no hydration mismatch. Never seed with useState(() => generateTr()):
  // that runs at build time too, baking a value that won't match what
  // the client generates.
  const [tr, setTr] = useState("");

  const tier = creator.tiers[selected] as Creator["tiers"][number] | undefined;
  const uri = tier && tr ? buildUpiUri(creator, tier, tr) : "";

  useEffect(() => {
    setTr(generateTr());
    logEvent(creator.slug, "view");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectTier(i: number) {
    setSelected(i);
    setTr(generateTr());
  }

  function handleTap() {
    logEvent(creator.slug, "tap", tr);
  }

  return { selected, tier, uri, tr, selectTier, handleTap };
}
