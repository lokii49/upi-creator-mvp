"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isValidSlug, isValidVpa, type Tier } from "@/lib/creators";
import { AuthGate } from "@/components/AuthGate";
import { VpaField } from "@/components/VpaField";
import { TierEditor } from "@/components/TierEditor";
import { inputClass, primaryButtonClass, eyebrowClass } from "@/lib/ui";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-yellow flex items-start justify-center">
      <div className="w-full max-w-md px-4 py-14 space-y-6">
        <div className="text-center space-y-1.5">
          <p className={eyebrowClass}>new page</p>
          <h1 className="font-display text-4xl font-semibold text-ink">
            Create your support page
          </h1>
        </div>
        <AuthGate redirectPath="/register">{(user) => <ProfileForm user={user} />}</AuthGate>
      </div>
    </main>
  );
}

function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
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

  async function createPage(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!isValidSlug(slug)) {
      setError("URL can only use lowercase letters, numbers, and hyphens (3-30 chars).");
      return;
    }
    if (!isValidVpa(vpa)) {
      setError("That doesn't look like a valid UPI ID (should be something@bank).");
      return;
    }
    if (tiers.length === 0 || tiers.some((t) => !t.label || t.amount <= 0)) {
      setError("Every tier needs a label and an amount greater than 0.");
      return;
    }

    setBusy(true);
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
    <form
      onSubmit={createPage}
      className="space-y-4 rounded-2xl border-2 border-ink bg-card shadow-pop p-6"
    >
      <div>
        <label className="text-xs text-muted">
          Your page: support.tinyact.app/
          <input
            required
            placeholder="yourname"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            className="inline w-40 rounded-lg border-2 border-ink bg-card px-2 py-1 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-yellow"
          />
        </label>
      </div>
      <input
        required
        placeholder="Display name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={inputClass}
      />
      <textarea
        placeholder="Short bio (optional)"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={2}
        className={inputClass}
      />
      <VpaField value={vpa} onChange={setVpa} />
      <TierEditor tiers={tiers} onChange={setTiers} />

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className={primaryButtonClass}>
        {busy ? "Creating…" : "Create my page"}
      </button>
    </form>
  );
}
