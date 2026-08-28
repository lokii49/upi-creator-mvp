import { supabase } from "./supabase";

export type EventType = "view" | "tap" | "claim";

/**
 * Fire-and-forget event counter. Never awaited by callers, never blocks
 * the UI, and failures are swallowed — this is a coarse proxy metric
 * (page views / taps / claims per creator), not something the product
 * depends on functioning. See MVP spec: "What this product measures."
 */
export function logEvent(creatorSlug: string, eventType: EventType, tr?: string) {
  supabase
    .from("events")
    .insert({ creator_slug: creatorSlug, event_type: eventType, tr: tr ?? null })
    .then(({ error }) => {
      if (error) console.error("logEvent failed:", error.message);
    });
}
