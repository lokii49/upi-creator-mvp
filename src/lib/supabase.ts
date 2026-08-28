import { createClient } from "@supabase/supabase-js";

// Publishable/anon key — safe to ship in client code by design. Every
// table it can touch is locked down with RLS (see supabase/migrations):
// insert-only on claims/events, public read-only on public_feed_entries.
// Never put the service_role/secret key here.
const SUPABASE_URL = "https://hajeiotyqmgzzbbgqafs.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Pmw4hZdXUn740dpcoUdHJA_lkG_xHx7";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
