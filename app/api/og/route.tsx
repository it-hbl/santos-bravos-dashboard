import { ImageResponse } from "next/og";

export const runtime = "edge";

// Compact number formatter for OG metrics
function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toLocaleString();
}

// Fallback values (updated periodically) in case API calls fail
const FALLBACK = {
  listeners: "345K",
  ytViews: "23.1M",
  sns: "1.7M",
  mentions: "6K+",
};

async function fetchLiveMetrics(): Promise<{
  listeners: string;
  ytViews: string;
  sns: string;
  mentions: string;
}> {
  try {
    // Chartmetric: Spotify listeners + social followers
    const cmTokenRes = await fetch("https://api.chartmetric.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshtoken: "D3dkDB915eXHxZd56jcBNdFkhqcrNmm2kdZy7VrryBbW1z0ELS5Mu7D9p5x9Atex" }),
    });
    if (!cmTokenRes.ok) throw new Error("CM token fail");
    const { token } = await cmTokenRes.json();

    const artistRes = await fetch(`https://api.chartmetric.com/api/artist/14502018`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!artistRes.ok) throw new Error("CM artist fail");
    const { obj: artist } = await artistRes.json();
    const cm = artist?.cm_statistics || {};

    const listeners = cm.sp_monthly_listeners || 345000;
    const igFollowers = cm.ins_followers || 0;
    const tiktokFollowers = cm.tiktok_followers || 0;

    // YouTube uses OAuth (no public API key available), so use fallback for YT views
    const totalYtViews = 23100000; // Updated when dashboard data refreshes
    const ytSubs = 471000; // Fallback — Chartmetric doesn't track YT subs reliably

    const snsTotal = (igFollowers || 0) + (tiktokFollowers || 0) + ytSubs;

    // Meltwater: mention volume (7-day)
    let mentions = 6000;
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      const qs = new URLSearchParams({
        start: start.toISOString().split("T")[0] + "T00:00:00",
        end: end.toISOString().split("T")[0] + "T23:59:59",
        tz: "America/Mexico_City",
      });
      const mwRes = await fetch(`https://api.meltwater.com/v3/analytics/27861227?${qs}`, {
        headers: { apikey: "CwyOVYu0hn3hdXQ1CFPCqr5LLRVkuPNjn6tSAGtZ", Accept: "application/json" },
      });
      if (mwRes.ok) {
        const mwData = await mwRes.json();
        mentions = mwData.volume || mentions;
      }
    } catch {}

    return {
      listeners: fmt(listeners),
      ytViews: fmt(totalYtViews),
      sns: fmt(snsTotal),
      mentions: mentions >= 1000 ? fmt(mentions) : `${mentions}+`,
    };
  } catch {
    return FALLBACK;
  }
}

export async function GET() {
  const metrics = await fetchLiveMetrics();
  const now = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Mexico_City" });

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
              marginBottom: "12px",
            }}
          >
            Artist Intelligence Dashboard
          </div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.3)",
              marginBottom: "36px",
            }}
          >
            Updated {now}
          </div>

          {/* Metric pills */}
          <div style={{ display: "flex", gap: "16px" }}>
            {[
              { label: "Spotify Listeners", value: metrics.listeners, color: "#1DB954" },
              { label: "YouTube Views", value: metrics.ytViews, color: "#FF0000" },
              { label: "SNS Footprint", value: metrics.sns, color: "#8B5CF6" },
              { label: "Media Mentions", value: metrics.mentions, color: "#06B6D4" },
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
