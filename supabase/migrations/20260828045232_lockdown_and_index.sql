-- Close the RPC surface on the trigger function: it must only ever run as
-- a trigger, never callable directly by anon/authenticated via
-- /rest/v1/rpc/sync_public_feed (advisor: anon/authenticated_security_definer_function_executable).
revoke execute on function public.sync_public_feed() from public;
revoke execute on function public.sync_public_feed() from anon;
revoke execute on function public.sync_public_feed() from authenticated;

-- Missing covering index on the FK (advisor: unindexed_foreign_keys).
create index public_feed_entries_claim_id_idx on public.public_feed_entries (claim_id);
