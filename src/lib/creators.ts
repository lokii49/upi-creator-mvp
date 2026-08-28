import { supabase } from "./supabase";

export type Tier = {
  label: string; // e.g. "1 coffee"
  amount: number; // INR, whole rupees
};

export type Creator = {
  slug: string;
  name: string;
  bio: string | null;
  vpa: string; // UPI ID, e.g. "name@okhdfcbank"
  tiers: Tier[];
};

const SLUG_PATTERN = /^[a-z0-9]([a-z0-9-]{1,28}[a-z0-9])?$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

// Loose sanity check, not a real UPI VPA validator — the NPCI spec allows
// hyphens/dots/underscores in the local part, so a mistyped-but-plausible
// VPA (e.g. an autofilled phone number) can pass this and still be wrong.
// That's why the registration form also shows a live preview: format
// validity isn't enough, the creator has to actually look at the value.
const VPA_PATTERN = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9.\-]{1,64}$/;

export function isValidVpa(vpa: string): boolean {
  return VPA_PATTERN.test(vpa);
}

type CreatorRow = {
  slug: string;
  name: string;
  bio: string | null;
  vpa: string;
  tiers: Tier[];
};

export async function getCreatorBySlug(slug: string): Promise<Creator | null> {
  const { data, error } = await supabase
    .from("creators")
    .select("slug, name, bio, vpa, tiers")
    .eq("slug", slug)
    .maybeSingle<CreatorRow>();

  if (error) {
    console.error("getCreatorBySlug failed:", error.message);
    return null;
  }
  if (!data) return null;

  return {
    slug: data.slug,
    name: data.name,
    bio: data.bio,
    vpa: data.vpa,
    tiers: Array.isArray(data.tiers) ? data.tiers : [],
  };
}

export async function listCreators(): Promise<Pick<Creator, "slug" | "name">[]> {
  const { data, error } = await supabase
    .from("creators")
    .select("slug, name")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("listCreators failed:", error.message);
    return [];
  }
  return data ?? [];
}
