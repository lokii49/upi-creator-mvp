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
    QRCode.toDataURL(uri, {
      margin: 1,
      width: 220,
      color: { dark: "#1a1a2e", light: "#faf6ee" },
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
    <div className="space-y-8">
      {/* Tier picker styled as ticket stubs — a torn ticket rather than a
          plain card grid, since "pick an amount" is literally choosing
          a token, the way a chai-stall or a movie counter works. */}
      <div className="grid grid-cols-2 gap-4">
        {creator.tiers.map((t, i) => {
          const active = i === selected;
          return (
            <button
              key={t.label}
              onClick={() => selectTier(i)}
              className={`group text-left rounded-lg border-2 transition ${
                active
                  ? "border-ink bg-paper-raised"
                  : "border-rule bg-paper hover:border-ink/40"
              }`}
            >
              <div className="px-4 pt-3 pb-2">
                <div className="font-receipt text-[10px] tracking-[0.2em] uppercase text-muted">
                  ☕ {t.label}
                </div>
              </div>
              <div
                className="ticket-notch tear-line px-4 pt-2 pb-3"
                style={{ ["--notch-bg" as string]: active ? "var(--paper-raised)" : "var(--paper)" }}
              >
                <div className="font-display text-3xl text-ink">₹{t.amount}</div>
              </div>
            </button>
          );
        })}
      </div>

      {vpaMissing && (
        <p className="rounded-md bg-marigold/10 border border-marigold/40 p-3 text-sm text-marigold-ink">
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
      <div className="rounded-lg border-2 border-dashed border-rule bg-paper-raised p-6 flex flex-col items-center gap-4">
        <p className="font-receipt text-[10px] tracking-[0.25em] uppercase text-muted">
          · scan to pay ·
        </p>
        {qrDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrDataUrl}
            alt="UPI QR code"
            width={200}
            height={200}
            className="border border-rule"
          />
        )}
        <p className="text-xs text-muted text-center max-w-[26ch]">
          Scan with your UPI app&apos;s built-in scanner (GPay, PhonePe, Paytm, etc.) — most
          reliable. Amount is editable in your app.
        </p>
        <hr className="tear-line w-full" />
        <a
          href={uri}
          onClick={handleTap}
          className="w-full text-center rounded-md border border-ink/20 py-2 font-receipt text-xs text-muted hover:border-ink/40 hover:text-ink transition"
        >
          or tap to pay ₹{tier.amount} directly
        </a>
        <p className="text-[11px] text-muted/80 text-center">
          Tapping may open a different app than you expect on iPhone — if so, use the QR
          above instead.
        </p>
      </div>

      <ClaimForm creatorSlug={creator.slug} tier={tier} tr={tr} />
    </div>
  );
}
