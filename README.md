# UPI Creator Support — MVP v0

Buy-Me-a-Coffee-style hosted page for a creator's own UPI ID. No custody of
funds, no PA/AA/FIU licensing — the platform never touches money, it only
captures supporter contact info (self-reported) and shows a public feed.

Full spec: see the MVP spec doc (not in this repo — ask Lokesh).

## Stack

- Next.js static export (`output: "export"`) — deployed to GitHub Pages, no server.
- Supabase (`hajeiotyqmgzzbbgqafs`, ap-southeast-1) for `claims` + `events` tables,
  called directly from the browser with the publishable/anon key. RLS locks
  every table down — see `supabase/migrations/`.
- QR generated client-side (`qrcode` package) from a `upi://pay` intent URI.

## Add a creator

Edit `src/lib/creators.ts` — add an entry with slug, name, bio, UPI VPA, and
tiers. Push to `main`; GitHub Actions rebuilds and deploys automatically.

**Get the creator's real UPI VPA before publishing their page** — a
placeholder VPA (`REPLACE_WITH_...`) renders a warning banner instead of a
working pay link.

## Local dev

```bash
npm install
npm run dev
```

## Deploy

Push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) builds and
deploys to GitHub Pages → live at `support.tinyact.app` (DNS: CNAME
`support` → `lokii49.github.io`, needs to be added once in your registrar).

## What's deliberately NOT built (v0 scope)

- No reward auto-delivery email (Resend/signed URLs) — for the pilot,
  rewards are sent by hand.
- No payment verification (no UTR, no bank/AA read) — claims are
  self-reported, labeled as such everywhere they're shown.
- No creator dashboard — query Supabase directly for now.
