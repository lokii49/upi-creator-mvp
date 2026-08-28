"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AuthStep = "email" | "otp" | "authed";

/**
 * Shared email-OTP sign-in flow used by both /register and /dashboard.
 * Handles both ways a Supabase OTP email can be completed: the user types
 * the code (verifyOtp), or clicks the link in the email — supabase-js
 * auto-detects that from the URL on load (detectSessionInUrl, on by
 * default) and fires SIGNED_IN, which this also listens for so either
 * path lands the caller in the same "authed" state.
 */
export function useEmailOtpAuth(redirectPath: string) {
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(data.session.user);
        setStep("authed");
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setUser(session.user);
        setStep("authed");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}${redirectPath}`,
      },
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep("otp");
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.user) setUser(data.user);
    setStep("authed");
  }

  return { step, email, setEmail, otp, setOtp, error, busy, sendOtp, verifyOtp, user };
}
