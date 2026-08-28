"use client";

import type { Tier } from "@/lib/creators";

export function TierEditor({
  tiers,
  onChange,
}: {
  tiers: Tier[];
  onChange: (tiers: Tier[]) => void;
}) {
  function updateTier(i: number, patch: Partial<Tier>) {
    onChange(tiers.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }

  function addTier() {
    onChange([...tiers, { label: "", amount: 0 }]);
  }

  function removeTier(i: number) {
    onChange(tiers.filter((_, idx) => idx !== i));
  }

  return (
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
      <button type="button" onClick={addTier} className="text-sm text-neutral-500 underline">
        + add tier
      </button>
    </div>
  );
}
