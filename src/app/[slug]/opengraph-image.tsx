import { ImageResponse } from "next/og";
import { getCreatorBySlug } from "@/lib/creators";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Without this, a link Aadi posts to Instagram/X shows a blank preview
// card — for a product whose entire distribution is "creator shares
// their link," that's not a cosmetic gap.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const creator = await getCreatorBySlug(slug);
  const name = creator?.name ?? "Someone";
  const bio = creator?.bio ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6366f1 0%, #14b8a6 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 160,
            height: 160,
            borderRadius: 40,
            background: "rgba(255,255,255,0.18)",
            border: "4px solid rgba(255,255,255,0.4)",
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            marginBottom: 40,
          }}
        >
          {name.charAt(0)}
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 800, color: "white" }}>
          Support {name}
        </div>
        {bio && (
          <div style={{ display: "flex", fontSize: 32, color: "rgba(255,255,255,0.85)", marginTop: 16 }}>
            {bio}
          </div>
        )}
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "rgba(255,255,255,0.7)",
            marginTop: 48,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          tinyact / support
        </div>
      </div>
    ),
    { ...size }
  );
}
