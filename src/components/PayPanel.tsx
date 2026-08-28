"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { Creator } from "@/lib/creators";
import { buildUpiUri, generateTr } from "@/lib/upi";
import { logEvent } from "@/lib/events";
import { ClaimForm } from "./ClaimForm";

export function PayPanel({ creator }: { creator: Creator }) {
  const [selected, setSelected] = useState(0);
  if (creator.tiers.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        This creator hasn&apos;t set up any support tiers yet.
      </p>
    );
  }
  return <PayPanelInner creator={creator} selected={selected} setSelected={setSelected} />;
}

function PayPanelInner({
  creator,
  selected,
  setSelected,
}: {
  creator: Creator;
  selected: number;
  setSelected: (i: number) => void;
}) {
  // Empty on both server-render (build) and first client render — identical,
  // so no hydration mismatch. The real tr is generated client-side only,
  // right after mount (see effect below). Never seed this with useState(()
  // => generateTr()): that runs during the static build too, baking a
  // random value into the HTML that won't match what the client generates,
  // which React flags as a hydration error on the href below.
  const [tr, setTr] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const tier = creator.tiers[selected];
  const uri = tr ? buildUpiUri(creator, tier, tr) : "";

  useEffect(() => {
    setTr(generateTr());
    logEvent(creator.slug, "view");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!uri) return;
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

  const vpaMissing = !creator.vpa;

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

      {vpaMissing && (
        <p className="rounded-md bg-yellow-50 dark:bg-yellow-950 border border-yellow-300 dark:border-yellow-800 p-3 text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ This creator&apos;s UPI ID isn&apos;t set yet — the pay link below won&apos;t work
          until it is.
        </p>
      )}

      {/*
        QR is the primary path, tap-to-pay is secondary — not just a
        desktop/mobile split. Confirmed on a real phone: the "Pay" link
        below is a raw `upi://` scheme, and multiple apps register as
        handlers for it (GPay, PhonePe, WhatsApp Pay, etc). Android shows
        a chooser; iOS doesn't — it silently opens whichever app "won"
        the scheme registration (often just install order), with no way
        for the page or the user to control which one. Scanning the QR
        sidesteps this entirely, since the person picks which app does
        the scanning. See advisor note in project history re: "iOS is
        the trap" — this is that trap, observed live.
      */}
      <div className="flex flex-col items-center gap-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
        {qrDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="UPI QR code" width={220} height={220} />
        )}
        <p className="text-xs text-neutral-500 text-center">
          Scan with your UPI app's built-in scanner (GPay, PhonePe, Paytm, etc.) — most
          reliable. Amount is editable in your UPI app, pay what you want.
        </p>
        <a
          href={uri}
          onClick={handleTap}
          className="w-full text-center rounded-md border border-neutral-300 dark:border-neutral-700 py-2 text-sm text-neutral-600 dark:text-neutral-300"
        >
          or tap to pay ₹{tier.amount} directly
        </a>
        <p className="text-xs text-neutral-400 text-center">
          Tapping may open a different app than you expect on iPhone — if so, use the QR
          above instead.
        </p>
      </div>

      <ClaimForm creatorSlug={creator.slug} tier={tier} tr={tr} />
    </div>
  );
}
