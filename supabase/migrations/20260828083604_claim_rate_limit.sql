-- Rate limit: one claim per email per creator per 24h. This was in the
-- original MVP spec as "the only anti-abuse mechanism in v0" but never
-- actually got built — right now anon/authenticated can submit unlimited
-- claims with any name/email, no throttle at all.
--
-- Implementation note: a naive correlated subquery directly inside the
-- INSERT policy's WITH CHECK (`not exists (select 1 from claims c
-- where c.creator_slug = creator_slug ...)`) is a real trap — the
-- unqualified `creator_slug` on the right-hand side binds to the
-- subquery's own FROM alias (self-referential, always true) rather than
-- the new row, silently making the guard a no-op. A helper function with
-- its own parameter names sidesteps that ambiguity entirely.
--
-- The function also has to run as SECURITY DEFINER: claims has no SELECT
-- policy for anon/authenticated (intentionally — supporters' contact
-- info isn't public), so a SECURITY INVOKER count would see zero rows
-- via RLS and the rate limit would always pass, defeating its own
-- purpose. Keeping it in a `private` schema (never exposed via the Data
-- API, unlike `public`) closes off the direct-RPC-callable surface this
-- would otherwise open — same class of issue the sync_public_feed
-- trigger function had, fixed the same way.
create schema if not exists private;

create or replace function private.recent_claim_exists(p_creator_slug text, p_email text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.claims c
    where c.creator_slug = p_creator_slug
      and c.email = p_email
      and c.created_at > now() - interval '24 hours'
  );
$$;

revoke execute on function private.recent_claim_exists(text, text) from public;
grant execute on function private.recent_claim_exists(text, text) to anon, authenticated;

drop policy "any visitor can insert claims with consent" on public.claims;
create policy "any visitor can insert claims with consent"
  on public.claims
  for insert
  to anon, authenticated
  with check (
    contact_consent = true
    and not private.recent_claim_exists(creator_slug, email)
  );

-- Covers the lookup the function above does on every claim insert.
create index claims_creator_slug_email_created_at_idx
  on public.claims (creator_slug, email, created_at);
