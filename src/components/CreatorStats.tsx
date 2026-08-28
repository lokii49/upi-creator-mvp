"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cardSubtleClass } from "@/lib/ui";

// The dashboard previously showed an edit form and nothing else — a
// creator had no way to see whether anyone had even looked at their
// page, despite view/tap/claim already being logged to events/claims.
// Relies on the owner-scoped SELECT policies added alongside this
// (claims/events were insert-only before).
export function CreatorStats({ slug }: { slug: string }) {
  const [stats, setStats] = useState<{ views: number; taps: number; claims: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("creator_slug", slug)
        .eq("event_type", "view"),
      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("creator_slug", slug)
        .eq("event_type", "tap"),
      supabase.from("claims").select("id", { count: "exact", head: true }).eq("creator_slug", slug),
    ]).then(([views, taps, claims]) => {
      if (cancelled) return;
      if (views.error || taps.error || claims.error) {
        console.error(
          "stats fetch failed:",
          views.error?.message ?? taps.error?.message ?? claims.error?.message
        );
        return;
      }
      setStats({ views: views.count ?? 0, taps: taps.count ?? 0, claims: claims.count ?? 0 });
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className={`${cardSubtleClass} p-4 grid grid-cols-3 divide-x divide-border text-center`}>
      <Stat label="Views" value={stats?.views} />
      <Stat label="Taps" value={stats?.taps} />
      <Stat label="Claims" value={stats?.claims} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div>
      <p className="text-xl font-extrabold text-ink">{value ?? "—"}</p>
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}
