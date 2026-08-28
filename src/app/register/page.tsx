"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isValidSlug, type Tier } from "@/lib/creators";

type Step = "email" | "otp" | "profile";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [vpa, setVpa] = useState("");
  const [tiers, setTiers] = useState<Tier[]>([
    { label: "1 coffee", amount: 49 },
    { label: "3 coffees", amount: 149 },
  ]);

  async function sendOtp(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep("otp");
  }

  async function verifyOtp(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep("profile");
  }

  function updateTier(i: number, patch: Partial<Tier>) {
    setTiers((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }

  function addTier() {
    setTiers((prev) => [...prev, { label: "", amount: 0 }]);
  }

  function removeTier(i: number) {
    setTiers((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function createPage(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!isValidSlug(slug)) {
      setError("URL can only use lowercase letters, numbers, and hyphens (3-30 chars).");
      return;
    }
    if (tiers.length === 0 || tiers.some((t) => !t.label || t.amount <= 0)) {
      setError("Every tier needs a label and an amount greater than 0.");
      return;
    }

    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      setError("Session expired — please verify your email again.");
      setStep("email");
      return;
    }

    const { error } = await supabase.from("creators").insert({
      owner_id: user.id,
      slug,
      name,
      bio: bio || null,
      vpa,
      tiers,
    });
    setBusy(false);

    if (error) {
      if (error.code === "23505") {
        setError("That URL is already taken — try another.");
      } else {
        setError(error.message);
      }
      return;
    }

    router.push(`/${slug}`);
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10 space-y-6">
      <h1 className="text-xl font-semibold">Create your support page</h1>

      {step === "email" && (
        <form onSubmit={sendOtp} className="space-y-3">
          <p className="text-sm text-neutral-500">
            We&apos;ll email you a one-time code — no password, ties your page to this
            inbox.
          </p>
          <input
            required
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-2 text-sm font-medium disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send code"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verifyOtp} className="space-y-3">
          <p className="text-sm text-neutral-500">Enter the code sent to {email}.</p>
          <input
            required
            inputMode="numeric"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm tracking-widest"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-2 text-sm font-medium disabled:opacity-50"
          >
            {busy ? "Verifying…" : "Verify"}
          </button>
        </form>
      )}

      {step === "profile" && (
        <form onSubmit={createPage} className="space-y-3">
          <div>
            <label className="text-xs text-neutral-500">
              Your page: support.tinyact.app/
              <input
                required
                placeholder="yourname"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                className="inline w-40 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1 text-sm"
              />
            </label>
          </div>
          <input
            required
            placeholder="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Short bio (optional)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Your UPI ID (e.g. name@okhdfcbank)"
            value={vpa}
            onChange={(e) => setVpa(e.target.value.trim())}
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />

          <div className="space-y-2">
            <p className="text-xs text-neutral-500">Support tiers</p>
            {tiers.map((t, i) => (
              <div key={i} className="flex gap-2">
                <input
                  placeholder="Label (e.g. 1 coffee)"
                  value={t.label}
                  onChange={(e) => updateTier(i, { label: e.target.value })}
                  className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-sm"
                />
                <input
                  type="number"
                  min={1}
                  placeholder="₹"
                  value={t.amount || ""}
                  onChange={(e) => updateTier(i, { amount: Number(e.target.value) })}
                  className="w-20 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-sm"
                />
                {tiers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTier(i)}
                    className="px-2 text-sm text-neutral-400"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addTier}
              className="text-sm text-neutral-500 underline"
            >
              + add tier
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-2 text-sm font-medium disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create my page"}
          </button>
        </form>
      )}
    </main>
  );
}
