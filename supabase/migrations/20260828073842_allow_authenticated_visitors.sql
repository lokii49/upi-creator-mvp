-- claims/events insert policies were scoped to `anon` only. Now that
-- creators can sign in (self-serve registration), a signed-in creator
-- browsing any support page — including their own, including someone
-- else's — runs as `authenticated`, not `anon`, and was getting blocked
-- by RLS on both the event-logging fire-and-forget calls and the claim
-- form itself. Broaden both to cover a visitor in either state.
drop policy "anon can insert claims with consent" on public.claims;
create policy "any visitor can insert claims with consent"
  on public.claims
  for insert
  to anon, authenticated
  with check (contact_consent = true);

drop policy "anon can insert events" on public.events;
create policy "any visitor can insert events"
  on public.events
  for insert
  to anon, authenticated
  with check (true);
