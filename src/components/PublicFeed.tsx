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

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ink">Recent supporters</p>

      {!entries && <p className="text-sm text-muted py-4">Loading…</p>}

      {entries?.length === 0 && (
        <p className="text-sm text-muted py-4">No supporters yet — be the first.</p>
      )}

      {entries && entries.length > 0 && (
        <ul className="divide-y divide-border rounded-xl border border-border bg-bg overflow-hidden">
          {entries.map((e) => (
            <li key={e.id} className="px-4 py-3 flex items-start gap-3">
              <div
                aria-hidden
                className="flex items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent shrink-0"
                style={{ height: 28, width: 28 }}
              >
                {e.display_name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-ink">
                  <span className="font-medium">{e.display_name}</span> bought {e.tier_label}
                </p>
                {e.note && <p className="text-sm text-muted italic mt-0.5">&ldquo;{e.note}&rdquo;</p>}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] text-muted text-center">
        self-reported by supporters, not payment-verified
      </p>
    </div>
  );
}
