"use client";

import { isValidVpa } from "@/lib/creators";
import { inputClass } from "@/lib/ui";

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
        className={`${inputClass} font-receipt`}
      />
      {value && (
        <p
          className={`mt-1 text-xs ${isValidVpa(value) ? "text-muted" : "text-marigold-ink"}`}
        >
          Payments will go to: <span className="font-receipt">{value}</span> — double-check
          this is exactly right, it isn&apos;t verified anywhere.
        </p>
      )}
    </div>
  );
}
