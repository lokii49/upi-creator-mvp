"use client";

import type { User } from "@supabase/supabase-js";
import { useEmailOtpAuth } from "@/lib/useEmailOtpAuth";
import { inputClass, primaryButtonClass, cardClass } from "@/lib/ui";

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
    <div className={`${cardClass} p-6`}>
      {step === "email" && (
        <form onSubmit={sendOtp} className="space-y-3">
          <p className="text-sm text-muted">
            We&apos;ll email you a one-time code — no password, ties your page to this
            inbox.
          </p>
          <input
            required
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className={primaryButtonClass}>
            {busy ? "Sending…" : "Send code"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verifyOtp} className="space-y-3">
          <p className="text-sm text-muted">Enter the code sent to {email}.</p>
          <input
            required
            inputMode="numeric"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className={`${inputClass} tracking-widest`}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className={primaryButtonClass}>
            {busy ? "Verifying…" : "Verify"}
          </button>
        </form>
      )}
    </div>
  );
}
