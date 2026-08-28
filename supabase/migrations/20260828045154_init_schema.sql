-- UPI Creator Contact Capture — MVP v0 schema
-- No payment data ever stored. Self-reported claims + coarse event counters only.

-- ── claims ──────────────────────────────────────────────────────────────
-- Private table. Never exposed to anon via SELECT. Holds contact info
-- (email/phone) which is why it stays locked down; public feed is served
-- from a separate table (see below), populated by trigger.
create table public.claims (
  id uuid primary key default gen_random_uuid(),
  creator_slug text not null,
  name text not null,
  email text not null,
  phone text,
  tier_label text not null,
  tier_amount numeric not null,
  note text,
  public_opt_in boolean not null default false,
  contact_consent boolean not null,
  tr text not null, -- client-generated ref, ties this claim back to a tap event
  created_at timestamptz not null default now()
);

alter table public.claims enable row level security;

-- Supporters can submit a claim; they must have ticked the consent box.
-- No SELECT policy at all for anon/authenticated — this table is never
-- read back by the client, only by the project owner via the dashboard.
create policy "anon can insert claims with consent"
  on public.claims
  for insert
  to anon
  with check (contact_consent = true);

-- ── public_feed_entries ─────────────────────────────────────────────────
-- Deliberately separate from claims: holds only the columns safe to show
-- publicly (no email/phone). Written exclusively by the trigger below,
-- never directly by the client, so a supporter can't forge feed entries
-- for someone else or claim without actually inserting a claims row.
create table public.public_feed_entries (
  id uuid primary key default gen_random_uuid(),
  creator_slug text not null,
  claim_id uuid not null references public.claims(id) on delete cascade,
  display_name text not null,
  tier_label text not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.public_feed_entries enable row level security;

-- Public read only. No insert/update/delete policy for anon — the trigger
-- function (security definer) is the only writer.
create policy "anyone can read the public feed"
  on public.public_feed_entries
  for select
  to anon, authenticated
  using (true);

create or replace function public.sync_public_feed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.public_opt_in then
    insert into public.public_feed_entries (creator_slug, claim_id, display_name, tier_label, note)
    values (new.creator_slug, new.id, new.name, new.tier_label, new.note);
  end if;
  return new;
end;
$$;

create trigger claims_sync_public_feed
  after insert on public.claims
  for each row
  execute function public.sync_public_feed();

-- ── events ──────────────────────────────────────────────────────────────
-- Coarse counters only: page views, intent-link taps, claims submitted.
-- Never used to correlate an individual supporter to an individual tap —
-- aggregate counts per creator_slug/event_type is all this is for
-- (claim-to-tap ratio, per the MVP spec's exit criteria).
create table public.events (
  id uuid primary key default gen_random_uuid(),
  creator_slug text not null,
  event_type text not null check (event_type in ('view', 'tap', 'claim')),
  tr text,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

-- Write-only from the client. No SELECT policy — counts are pulled via
-- the Supabase dashboard SQL editor for now, not exposed to the public.
create policy "anon can insert events"
  on public.events
  for insert
  to anon
  with check (true);
