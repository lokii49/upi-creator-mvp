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
      <p className="font-receipt text-[10px] tracking-[0.25em] uppercase text-muted text-center">
        · recent support ·
      </p>

      {!entries && (
        <p className="font-receipt text-xs text-muted text-center py-6">loading…</p>
      )}

      {entries?.length === 0 && (
        <p className="font-receipt text-xs text-muted text-center py-6">
          no supporters yet — be the first
        </p>
      )}

      {entries && entries.length > 0 && (
        <div className="rounded-lg border-2 border-rule bg-paper-raised overflow-hidden">
          {entries.map((e, i) => (
            <div key={e.id}>
              {i > 0 && <hr className="tear-line" style={{ ["--notch-bg" as string]: "var(--paper-raised)" }} />}
              <div className="px-4 py-3 flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-ink">{e.display_name}</span>{" "}
                  <span className="text-muted text-sm">bought {e.tier_label}</span>
                  {e.note && <p className="mt-1 text-sm text-muted italic truncate">&ldquo;{e.note}&rdquo;</p>}
                </div>
                <span className="font-receipt text-xs text-stamp shrink-0">claimed*</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="font-receipt text-[10px] text-muted/70 text-center">
        * self-reported by the supporter, not payment-verified
      </p>
    </div>
  );
}
