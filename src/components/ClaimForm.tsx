"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { logEvent } from "@/lib/events";
import type { Tier } from "@/lib/creators";

type Props = {
  creatorSlug: string;
  tier: Tier;
  tr: string;
};

export function ClaimForm({ creatorSlug, tier, tr }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [publicOptIn, setPublicOptIn] = useState(true);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!consent) {
      setErrorMsg("Please tick the consent box — required to save your details.");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");

    const { error } = await supabase.from("claims").insert({
      creator_slug: creatorSlug,
      name,
      email,
      phone: phone || null,
      tier_label: tier.label,
      tier_amount: tier.amount,
      note: note || null,
      public_opt_in: publicOptIn,
      contact_consent: consent,
      tr,
    });

    if (error) {
      setStatus("error");
      // 42501 = RLS check failed. contact_consent is already guaranteed
      // true above, so the only other thing the policy checks is the
      // 24h-per-email rate limit — map it to a message that means
      // something, instead of a raw Postgres error string.
      setErrorMsg(
        error.code === "42501"
          ? "Looks like you've already claimed for this creator recently — try again in 24h."
          : error.message
      );
      return;
    }

    logEvent(creatorSlug, "claim", tr);
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border-2 border-stamp bg-stamp/[0.06] p-5 text-center space-y-1.5">
        <p className="font-receipt text-[11px] tracking-[0.2em] uppercase text-stamp">
          ✓ claim recorded
        </p>
        <p className="font-display text-2xl text-ink">You&apos;re on the list.</p>
        <p className="text-sm text-muted">
          The creator will reach out directly by email if there&apos;s a reward for this tier.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border-2 border-rule bg-paper p-5">
      <p className="font-receipt text-[10px] tracking-[0.25em] uppercase text-muted">
        · claim your support ·
      </p>
      <p className="text-sm text-muted -mt-2">
        Already paid (or about to)? Drop your details so the creator knows it was you.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-rule bg-paper-raised px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink"
        />
        <input
          required
          type="email"
          placeholder="Email — for any reward"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-rule bg-paper-raised px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink"
        />
        <input
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-md border border-rule bg-paper-raised px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink sm:col-span-2"
        />
        <textarea
          placeholder="Leave a note (optional, shown publicly if you opt in below)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="rounded-md border border-rule bg-paper-raised px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink sm:col-span-2"
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={publicOptIn}
          onChange={(e) => setPublicOptIn(e.target.checked)}
          className="mt-1 accent-marigold"
        />
        <span>Show my name and note on the public supporter feed for this creator.</span>
      </label>

      <label className="flex items-start gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 accent-marigold"
        />
        <span>
          I agree to share my name/email/phone with the creator for the purpose of this
          support. The creator is the data owner; this page only relays and stores it on
          their behalf.
        </span>
      </label>

      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-md bg-ink text-paper py-2.5 text-sm font-medium hover:bg-marigold-ink transition disabled:opacity-50"
      >
        {status === "submitting" ? "Saving…" : "Submit"}
      </button>
    </form>
  );
}
