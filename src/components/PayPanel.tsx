"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import type { Creator } from "@/lib/creators";
import { buildUpiUri, generateTr } from "@/lib/upi";
import { logEvent } from "@/lib/events";
import { cardClass, gradientTextClass } from "@/lib/ui";
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

  const vpaMissing = !creator.vpa;

  return (
    <div className="space-y-6">
      {/*
        Everything needed to actually pay — pick amount, scan, tap-to-pay
        — lives in one card now instead of three stacked ones. QR is
        deliberately still plain white (bg-white on the card, no gradient
        near it): it's the one element that can't be restyled and the
        whole product depends on it staying scannable.
      */}
      <div className={`${cardClass} p-5 sm:p-6 space-y-5`}>
        <div className="grid grid-cols-2 gap-2.5">
          {creator.tiers.map((t, i) => {
            const active = i === selected;
            return (
              <button
                key={t.label}
                onClick={() => selectTier(i)}
                className={`rounded-2xl border-2 px-4 py-3 text-left transition ${
                  active
                    ? "border-accent bg-accent-soft"
                    : "border-border bg-white hover:border-accent/30"
                }`}
              >
                <div className="text-xs text-muted">☕ {t.label}</div>
                <div className={`text-lg font-extrabold ${active ? gradientTextClass : "text-ink"}`}>
                  ₹{t.amount}
                </div>
              </button>
            );
          })}
        </div>

        {vpaMissing && (
          <p className="rounded-lg border border-accent/30 bg-accent-soft p-3 text-sm text-accent">
            ⚠️ This creator&apos;s UPI ID isn&apos;t set yet — the pay link below won&apos;t work
            until it is.
          </p>
        )}

        <div className="flex flex-col items-center gap-3 border-t border-border pt-5">
          {/* min-height reserves the slot so the QR popping in post-mount doesn't jump the layout */}
          <div
            className="flex items-center justify-center rounded-xl border border-border"
            style={{ minHeight: 200, minWidth: 200 }}
          >
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="UPI QR code" width={200} height={200} className="rounded-xl" />
            ) : (
              <span className="text-xs text-muted">Generating QR…</span>
            )}
          </div>
          <p className="text-xs text-muted text-center max-w-[30ch]">
            Scan with your UPI app&apos;s built-in scanner (GPay, PhonePe, Paytm, etc.)
          </p>
          <a
            href={uri}
            onClick={handleTap}
            className="w-full text-center rounded-full border border-border py-2 text-sm text-muted hover:border-accent/40 hover:text-ink transition"
          >
            or tap to pay ₹{tier.amount} directly
          </a>
          <p className="text-[11px] text-muted text-center">
            Tapping may open a different app than you expect on iPhone — if so, use the QR
            above instead.
          </p>
        </div>
      </div>

      <ClaimForm creatorSlug={creator.slug} tier={tier} tr={tr} />
    </div>
  );
}
