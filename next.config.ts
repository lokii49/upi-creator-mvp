import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: this ships to GitHub Pages, no Node server behind it.
  // All data access happens client-side against Supabase (anon key + RLS).
  output: "export",
  // GitHub Pages serves static files; folder+index.html is the
  // unambiguous form (avoids the aadi.html + aadi/ dual-output above).
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
