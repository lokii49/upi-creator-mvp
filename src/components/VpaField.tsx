"use client";

import { isValidVpa } from "@/lib/creators";

export function VpaField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <input
        required
        name="upi-vpa"
        placeholder="Your UPI ID (e.g. name@okhdfcbank)"
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        // Caught a real bug from this: a phone-shaped VPA got silently
        // autofilled wrong (a stray hyphen inserted) and nothing in the
        // form surfaced it — the creator only found out when a real
        // payment failed. autoComplete="off" plus an unusual `name`
        // stops most browsers/keyboards from "helpfully" substituting a
        // saved contact/phone value here; the live preview below is the
        // actual defense, since a substituted value can still be
        // format-valid and pass isValidVpa.
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
      />
      {value && (
        <p
          className={`mt-1 text-xs ${
            isValidVpa(value) ? "text-neutral-500" : "text-amber-600 dark:text-amber-400"
          }`}
        >
          Payments will go to: <span className="font-mono">{value}</span> — double-check
          this is exactly right, it isn&apos;t verified anywhere.
        </p>
      )}
    </div>
  );
}
