import { NextResponse } from "next/server";
import { businessPerformance } from "@/app/lib/data";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN || "";

const VIDEO_IDS = {
  "KAWASAKI Performance Video": "Cmy8CsYIUL0",
  "0% Official MV": "ogmUm0xh8-w",
  "0% (Portuguese) Lyric Video": "_9tvZ5qoH_I",
  "0% Debut Visualizer": "CYse_hesElw",
};
const CHANNEL_ID = "UChKJaUFTKfw5O8JtQmF4Q6g";

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

export async function GET() {
  try {
    const token = await getAccessToken();
    const ids = Object.values(VIDEO_IDS).join(",");

    // Fetch video stats + channel stats in parallel
    const [videosRes, channelRes] = await Promise.all([
      fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ),
      fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ),
    ]);

    if (!videosRes.ok) throw new Error(`YouTube videos API: ${videosRes.status}`);
    if (!channelRes.ok) throw new Error(`YouTube channels API: ${channelRes.status}`);

    const videosData = await videosRes.json();
    const channelData = await channelRes.json();

    // Map video IDs back to names and view counts
    const idToName = Object.fromEntries(
      Object.entries(VIDEO_IDS).map(([name, id]) => [id, name])
    );

    const videos = (videosData.items || []).map((item: any) => ({
      name: idToName[item.id] || item.id,
      views: parseInt(item.statistics.viewCount, 10) || 0,
      likes: parseInt(item.statistics.likeCount, 10) || 0,
      comments: parseInt(item.statistics.commentCount, 10) || 0,
    }));

    const channel = channelData.items?.[0]?.statistics;
    const subscribers = channel ? parseInt(channel.subscriberCount, 10) : null;
    const totalChannelViews = channel ? parseInt(channel.viewCount, 10) : null;

    return NextResponse.json({
      live: true,
      data: {
        videos,
        subscribers,
        totalChannelViews,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("YouTube API error:", err.message);
    // Fallback to hardcoded data
    const fallbackVideos = businessPerformance.youtubeVideos.map((v) => ({
      name: v.name,
      views: v.views.current,
      likes: 0,
      comments: 0,
    }));
    return NextResponse.json({
      live: false,
      error: err.message,
      data: {
        videos: fallbackVideos,
        subscribers: null,
        totalChannelViews: null,
        fetchedAt: null,
      },
    });
  }
}
