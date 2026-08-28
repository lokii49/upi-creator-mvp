"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isValidSlug, isValidVpa, type Tier } from "@/lib/creators";
import { AuthGate } from "@/components/AuthGate";
import { VpaField } from "@/components/VpaField";
import { TierEditor } from "@/components/TierEditor";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-10 space-y-6">
      <h1 className="text-xl font-semibold">Create your support page</h1>
      <AuthGate redirectPath="/register">{(user) => <ProfileForm user={user} />}</AuthGate>
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
      <VpaField value={vpa} onChange={setVpa} />
      <TierEditor tiers={tiers} onChange={setTiers} />

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-2 text-sm font-medium disabled:opacity-50"
      >
        {busy ? "Creating…" : "Create my page"}
      </button>
    </form>
  );
}
