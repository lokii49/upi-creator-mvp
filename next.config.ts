import type { NextConfig } from "next";

// Vercel, not GitHub Pages: creator pages are created at runtime via
// self-serve registration, so they can't be enumerated at build time —
// this needs real dynamic routes / server rendering, not a static export.
const nextConfig: NextConfig = {};

export default nextConfig;
