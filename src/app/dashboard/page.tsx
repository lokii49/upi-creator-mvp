"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isValidVpa, type Creator, type Tier } from "@/lib/creators";
import { AuthGate } from "@/components/AuthGate";
import { VpaField } from "@/components/VpaField";
import { TierEditor } from "@/components/TierEditor";
import { inputClass, primaryButtonClass, eyebrowClass } from "@/lib/ui";

export default function DashboardPage() {
  return (
    <main className="min-h-screen paper-texture flex items-start justify-center">
      <div className="w-full max-w-md px-4 py-14 space-y-6">
        <div className="text-center space-y-1.5">
          <p className={eyebrowClass}>account</p>
          <h1 className="font-display text-4xl text-ink">Manage your page</h1>
        </div>
        <AuthGate redirectPath="/dashboard">{(user) => <CreatorPicker user={user} />}</AuthGate>
      </div>
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

  if (!creators) return <p className="font-receipt text-xs text-muted text-center">loading…</p>;

  if (creators.length === 0) {
    return (
      <div className="space-y-3 text-sm text-center">
        <p className="text-muted">No page yet for this email.</p>
        <Link href="/register" className="text-ink underline">
          Create one
        </Link>
      </div>
    );
  }

  if (creators.length > 1 && !selected) {
    return (
      <ul className="space-y-2 rounded-lg border-2 border-rule bg-paper-raised p-4">
        {creators.map((c) => (
          <li key={c.slug}>
            <button onClick={() => setSelected(c.slug)} className="text-sm text-ink underline">
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
    <form
      onSubmit={save}
      className="space-y-4 rounded-lg border-2 border-rule bg-paper-raised p-5"
    >
      <p className="font-receipt text-xs text-muted">
        support.tinyact.app/{creator.slug}{" "}
        <Link href={`/${creator.slug}`} className="text-ink underline">
          view page
        </Link>
      </p>
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
      {saved && <p className="text-sm text-stamp">Saved.</p>}
      <button type="submit" disabled={busy} className={primaryButtonClass}>
        {busy ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
