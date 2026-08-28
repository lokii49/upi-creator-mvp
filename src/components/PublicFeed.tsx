"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type FeedEntry = {
  id: string;
  display_name: string;
  tier_label: string;
  note: string | null;
  created_at: string;
};

export function PublicFeed({ creatorSlug }: { creatorSlug: string }) {
  const [entries, setEntries] = useState<FeedEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("public_feed_entries")
      .select("id, display_name, tier_label, note, created_at")
      .eq("creator_slug", creatorSlug)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("feed load failed:", error.message);
          setEntries([]);
          return;
        }
        setEntries(data ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [creatorSlug]);

  if (!entries) {
    return <p className="text-sm text-neutral-400">Loading supporters…</p>;
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-neutral-400">No supporters yet — be the first.</p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wide text-neutral-400">
        Recent supporters — self-reported, not payment-verified
      </p>
      <ul className="space-y-2">
        {entries.map((e) => (
          <li
            key={e.id}
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 text-sm"
          >
            <span className="font-medium">{e.display_name}</span>{" "}
            <span className="text-neutral-500">bought {e.tier_label}</span>
            {e.note && <p className="mt-1 text-neutral-600 dark:text-neutral-300">{e.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
