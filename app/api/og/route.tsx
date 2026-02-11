import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200",
          height: "630",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #050507 0%, #1a0a2e 40%, #0c1929 70%, #050507 100%)",
          fontFamily: "Inter, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow orbs */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "200px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "80px",
            height: "100%",
            zIndex: 1,
          }}
        >
          {/* HYBE badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                borderRadius: "8px",
                padding: "6px 16px",
                fontSize: "14px",
                fontWeight: 700,
                color: "white",
                letterSpacing: "2px",
              }}
            >
              HYBE LATIN AMERICA
            </div>
            <div
              style={{
                background: "rgba(29,185,84,0.15)",
                borderRadius: "8px",
                padding: "6px 16px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#1DB954",
              }}
            >
              ● LIVE DATA
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "64px",
              fontWeight: 900,
              letterSpacing: "-2px",
              lineHeight: 1.1,
              marginBottom: "16px",
              color: "white",
            }}
          >
            Santos Bravos
          </div>
          <div
            style={{
              fontSize: "32px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.5)",
              marginBottom: "48px",
            }}
          >
            Artist Intelligence Dashboard
          </div>

          {/* Metric pills */}
          <div style={{ display: "flex", gap: "16px" }}>
            {[
              { label: "Spotify Listeners", value: "345K", color: "#1DB954" },
              { label: "YouTube Views", value: "23.1M", color: "#FF0000" },
              { label: "SNS Footprint", value: "1.7M", color: "#8B5CF6" },
              { label: "Media Mentions", value: "6K+", color: "#06B6D4" },
            ].map((m) => (
              <div
                key={m.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  padding: "16px 24px",
                  minWidth: "180px",
                }}
              >
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                  {m.label}
                </span>
                <span style={{ fontSize: "28px", fontWeight: 800, color: m.color }}>
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
