# UPI Creator Support — MVP v0

Buy-Me-a-Coffee-style hosted page for a creator's own UPI ID. No custody of
funds, no PA/AA/FIU licensing — the platform never touches money, it only
captures supporter contact info (self-reported) and shows a public feed.

Self-serve: a creator signs in with email OTP and registers their own page
at `support.tinyact.app/<slug>` — no code changes needed per creator.

## Stack

- Next.js, dynamic routes — deployed to Vercel (not a static export; a
  brand-new signup has to appear with no rebuild).
- Supabase (`hajeiotyqmgzzbbgqafs`, ap-southeast-1):
  - `creators` — one row per creator, gated by Supabase Auth email OTP
    (`owner_id = auth.uid()`). This is the one table that isn't
    self-report-and-trust: it holds the UPI ID real payments get sent to,
    so writes are scoped to a signed-in owner, not open to anon.
  - `claims` / `events` / `public_feed_entries` — unchanged from the
    original design: self-reported, RLS locked, no payment verification.
- QR generated client-side (`qrcode` package) from a `upi://pay` intent URI.

## Register / manage a creator page

- `/register` — email OTP sign-in, then fill in slug/name/bio/UPI ID/tiers.
  No admin action needed; this replaced the old hand-edited
  `src/lib/creators.ts` config entirely.
- `/dashboard` — same email OTP sign-in, edit an existing page's
  name/bio/UPI ID/tiers. Slug isn't editable (would break already-shared
  links). No admin action needed here either.

## Local dev

```bash
npm install
npm run dev
```

## Deploy

```bash
vercel login   # once, interactively
vercel link    # first time, links this dir to a Vercel project
vercel --prod
```

Point `support.tinyact.app` at the Vercel project (Vercel dashboard →
Domains). DNS: `A support 76.76.21.21` in Cloudflare, **DNS-only / grey
cloud, not proxied** — Vercel needs direct access to issue the HTTPS
cert. (`vercel domains inspect <domain>` shows the exact record Vercel
wants if this ever needs redoing.)

## What's deliberately NOT built (v0 scope)

- No reward auto-delivery email (Resend/signed URLs) — for the pilot,
  rewards are sent by hand.
- No payment verification (no UTR, no bank/AA read) — claims are
  self-reported, labeled as such everywhere they're shown.
- No spam/rate-limit guard on claims yet — anyone can submit unlimited
  claims with any name/email. Doesn't cost the creator money (self-report,
  no custody), but pollutes their contact list. Was in the original spec,
  never actually built — needs doing before wider rollout.
