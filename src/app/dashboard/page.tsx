"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isValidVpa, type Creator, type Tier } from "@/lib/creators";
import { AuthGate } from "@/components/AuthGate";
import { VpaField } from "@/components/VpaField";
import { TierEditor } from "@/components/TierEditor";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-10 space-y-6">
      <h1 className="text-xl font-semibold">Manage your page</h1>
      <AuthGate redirectPath="/dashboard">{(user) => <CreatorPicker user={user} />}</AuthGate>
    </main>
  );
}

function CreatorPicker({ user }: { user: User }) {
  const [creators, setCreators] = useState<Creator[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("creators")
      .select("slug, name, bio, vpa, tiers")
      .eq("owner_id", user.id)
      .then(({ data, error }) => {
        if (error) {
          console.error("dashboard fetch failed:", error.message);
          setCreators([]);
          return;
        }
        setCreators(data ?? []);
        if (data && data.length === 1) setSelected(data[0].slug);
      });
  }, [user.id]);

  if (!creators) return <p className="text-sm text-neutral-500">Loading…</p>;

  if (creators.length === 0) {
    return (
      <div className="space-y-3 text-sm">
        <p className="text-neutral-500">No page yet for this email.</p>
        <Link href="/register" className="underline">
          Create one
        </Link>
      </div>
    );
  }

  if (creators.length > 1 && !selected) {
    return (
      <ul className="space-y-2">
        {creators.map((c) => (
          <li key={c.slug}>
            <button onClick={() => setSelected(c.slug)} className="underline text-sm">
              {c.name} — support.tinyact.app/{c.slug}
            </button>
          </li>
        ))}
      </ul>
    );
  }

  const creator = creators.find((c) => c.slug === selected) ?? creators[0];
  return <EditForm creator={creator} />;
}

function EditForm({ creator }: { creator: Creator }) {
  const [name, setName] = useState(creator.name);
  const [bio, setBio] = useState(creator.bio ?? "");
  const [vpa, setVpa] = useState(creator.vpa);
  const [tiers, setTiers] = useState<Tier[]>(creator.tiers);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (!isValidVpa(vpa)) {
      setError("That doesn't look like a valid UPI ID (should be something@bank).");
      return;
    }
    if (tiers.length === 0 || tiers.some((t) => !t.label || t.amount <= 0)) {
      setError("Every tier needs a label and an amount greater than 0.");
      return;
    }

    setBusy(true);
    const { error } = await supabase
      .from("creators")
      .update({ name, bio: bio || null, vpa, tiers })
      .eq("slug", creator.slug);
    setBusy(false);

    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <p className="text-xs text-neutral-500">
        support.tinyact.app/{creator.slug}{" "}
        <Link href={`/${creator.slug}`} className="underline">
          view page
        </Link>
      </p>
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
      {saved && <p className="text-sm text-green-600">Saved.</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-2 text-sm font-medium disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
