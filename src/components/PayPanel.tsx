"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { Creator } from "@/lib/creators";
import { buildUpiUri, generateTr } from "@/lib/upi";
import { logEvent } from "@/lib/events";
import { ClaimForm } from "./ClaimForm";

export function PayPanel({ creator }: { creator: Creator }) {
  const [selected, setSelected] = useState(0);
  // Fresh tr whenever the selected tier changes — one UPI intent = one tr,
  // per NPCI spec. Not used to precisely correlate to a claim (see
  // lib/events.ts) — just attached to the claim as loose context.
  const [tr, setTr] = useState(() => generateTr());
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const tier = creator.tiers[selected];
  const uri = buildUpiUri(creator, tier, tr);

  useEffect(() => {
    logEvent(creator.slug, "view");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(uri, { margin: 1, width: 220 }).then((url) => {
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

  const vpaIsPlaceholder = creator.vpa.startsWith("REPLACE_WITH_");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {creator.tiers.map((t, i) => (
          <button
            key={t.label}
            onClick={() => selectTier(i)}
            className={`rounded-xl border p-4 text-left transition ${
              i === selected
                ? "border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800"
                : "border-neutral-200 dark:border-neutral-800"
            }`}
          >
            <div className="font-medium">☕ {t.label}</div>
            <div className="text-sm text-neutral-500">₹{t.amount}</div>
          </button>
        ))}
      </div>

      {vpaIsPlaceholder && (
        <p className="rounded-md bg-yellow-50 dark:bg-yellow-950 border border-yellow-300 dark:border-yellow-800 p-3 text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ This creator&apos;s UPI ID isn&apos;t set yet — the pay link below won&apos;t work
          until it is.
        </p>
      )}

      <div className="flex flex-col items-center gap-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
        {qrDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="UPI QR code" width={220} height={220} />
        )}
        <a
          href={uri}
          onClick={handleTap}
          className="w-full text-center rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-2.5 text-sm font-medium"
        >
          Pay ₹{tier.amount} with UPI app
        </a>
        <p className="text-xs text-neutral-500 text-center">
          On phone: tap to open your UPI app. On desktop: scan the QR with your phone.
          Amount is editable in your UPI app — pay what you want.
        </p>
      </div>

      <ClaimForm creatorSlug={creator.slug} tier={tier} tr={tr} />
    </div>
  );
}
