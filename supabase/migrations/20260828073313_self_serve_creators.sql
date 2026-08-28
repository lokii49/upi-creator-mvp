-- Self-serve creator registration. Replaces the hand-edited src/lib/creators.ts
-- config with a real table, gated by Supabase Auth (email OTP) so a page's
-- UPI ID is tied to a reachable email, not anonymously submitted — this
-- table holds a VPA that real payments get redirected to, so open/anonymous
-- write access here is a fraud vector, unlike the self-report claims table.
create table public.creators (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  name text not null,
  bio text,
  vpa text not null,
  tiers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint creators_slug_format check (slug ~ '^[a-z0-9]([a-z0-9-]{1,28}[a-z0-9])?$')
);

alter table public.creators enable row level security;

-- Public pages need to read any creator by slug — the VPA is inherently
-- public anyway (it's what's rendered into the QR/pay link).
create policy "anyone can read creators"
  on public.creators
  for select
  to anon, authenticated
  using (true);

-- Only a signed-in owner can create their own row.
create policy "owner can insert their own creator row"
  on public.creators
  for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

-- Only a signed-in owner can edit their own row (SELECT policy above covers
-- the read-back UPDATE needs).
create policy "owner can update their own creator row"
  on public.creators
  for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "owner can delete their own creator row"
  on public.creators
  for delete
  to authenticated
  using (owner_id = (select auth.uid()));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger creators_set_updated_at
  before update on public.creators
  for each row
  execute function public.set_updated_at();

create index creators_owner_id_idx on public.creators (owner_id);
