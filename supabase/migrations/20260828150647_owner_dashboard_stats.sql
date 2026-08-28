-- Dashboard shows an edit form but no data — a creator can't see how
-- many people claimed support or viewed their page despite the app
-- already logging both to claims/events. Add owner-scoped SELECT so a
-- signed-in creator can read counts for slugs they actually own.
--
-- No SECURITY DEFINER needed here (unlike the rate-limit check): this
-- runs as the querying user and RLS itself does the scoping via EXISTS
-- against creators.owner_id — a real ownership check, not just
-- `to authenticated` (which alone would be authentication without
-- authorization).
create policy "owner can read their own claims"
  on public.claims
  for select
  to authenticated
  using (
    exists (
      select 1 from public.creators c
      where c.slug = claims.creator_slug
        and c.owner_id = (select auth.uid())
    )
  );

create policy "owner can read their own events"
  on public.events
  for select
  to authenticated
  using (
    exists (
      select 1 from public.creators c
      where c.slug = events.creator_slug
        and c.owner_id = (select auth.uid())
    )
  );

-- events had no index on creator_slug at all (claims got one for the
-- rate-limit check; events never did). The dashboard's owner-scoped
-- SELECT above filters/aggregates by it.
create index events_creator_slug_idx on public.events (creator_slug);
