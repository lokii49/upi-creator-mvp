import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

// Single family, variable weight — geometric/rounded grotesk in the same
// register as the satya/kree8 reference. Weight alone carries hierarchy
// (800 for headlines, 600 for UI labels, 500 for body) instead of mixing
// families, keeping this pass to the "one distinctive choice, everything
// else quiet" rule.
const manrope = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Support — TinyAct",
  description: "A UPI support page for creators. Pay directly, no middleman.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
