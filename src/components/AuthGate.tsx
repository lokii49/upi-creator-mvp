"use client";

import type { User } from "@supabase/supabase-js";
import { useEmailOtpAuth } from "@/lib/useEmailOtpAuth";

export function AuthGate({
  redirectPath,
  children,
}: {
  redirectPath: string;
  children: (user: User) => React.ReactNode;
}) {
  const { step, email, setEmail, otp, setOtp, error, busy, sendOtp, verifyOtp, user } =
    useEmailOtpAuth(redirectPath);

  if (step === "authed" && user) return <>{children(user)}</>;

  return (
    <div className="space-y-6">
      {step === "email" && (
        <form onSubmit={sendOtp} className="space-y-3">
          <p className="text-sm text-neutral-500">
            We&apos;ll email you a one-time code — no password, ties your page to this
            inbox.
          </p>
          <input
            required
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-2 text-sm font-medium disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send code"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verifyOtp} className="space-y-3">
          <p className="text-sm text-neutral-500">Enter the code sent to {email}.</p>
          <input
            required
            inputMode="numeric"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm tracking-widest"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-2 text-sm font-medium disabled:opacity-50"
          >
            {busy ? "Verifying…" : "Verify"}
          </button>
        </form>
      )}
    </div>
  );
}
