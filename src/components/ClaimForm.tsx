"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { logEvent } from "@/lib/events";
import type { Tier } from "@/lib/creators";
import { inputClass, primaryButtonClass, cardClass } from "@/lib/ui";

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
      <div className="rounded-3xl border border-success/30 bg-success/5 p-5 text-center space-y-1">
        <p className="text-sm font-semibold text-success">You&apos;re on the list</p>
        <p className="text-sm text-muted">
          The creator will reach out directly by email if there&apos;s a reward for this tier.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${cardClass} p-5`}>
      <div>
        <p className="text-sm font-semibold text-ink">Claim your support</p>
        <p className="text-sm text-muted mt-0.5">
          Already paid (or about to)? Drop your details so the creator knows it was you.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <input
          required
          type="email"
          placeholder="Email — for any reward"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={`${inputClass} sm:col-span-2`}
        />
        <textarea
          placeholder="Leave a note (optional, shown publicly if you opt in below)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className={`${inputClass} sm:col-span-2`}
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={publicOptIn}
          onChange={(e) => setPublicOptIn(e.target.checked)}
          className="mt-1 accent-accent"
        />
        <span>Show my name and note on the public supporter feed for this creator.</span>
      </label>

      <label className="flex items-start gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 accent-accent"
        />
        <span>
          I agree to share my name/email/phone with the creator for the purpose of this
          support. The creator is the data owner; this page only relays and stores it on
          their behalf.
        </span>
      </label>

      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      <button type="submit" disabled={status === "submitting"} className={primaryButtonClass}>
        {status === "submitting" ? "Saving…" : "Submit"}
      </button>
    </form>
  );
}
