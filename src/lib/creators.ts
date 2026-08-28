export type Tier = {
  label: string; // e.g. "1 coffee"
  amount: number; // INR, whole rupees
};

export type Creator = {
  slug: string;
  name: string;
  bio: string;
  photo: string; // path under /public, or a full URL — leave "" for an initials placeholder
  vpa: string; // UPI ID, e.g. "name@okhdfcbank" — PLACEHOLDER, replace before sharing a link
  tiers: Tier[];
};

// Add one entry per creator here. No database needed for this — it's
// config, not user data, and changes go through a PR/redeploy same as
// any other code change.
export const creators: Creator[] = [
  {
    slug: "aadi",
    name: "Aadi — DEF Talks",
    bio: "Explaining tech, simply.",
    photo: "",
    vpa: "REPLACE_WITH_AADI_VPA@bank", // ⚠️ placeholder — get real VPA before sending the link
    tiers: [
      { label: "1 coffee", amount: 49 },
      { label: "3 coffees", amount: 149 },
    ],
  },
];

export function getCreator(slug: string): Creator | undefined {
  return creators.find((c) => c.slug === slug);
}
