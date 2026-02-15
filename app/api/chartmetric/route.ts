import { NextResponse } from "next/server";
import {
  artistOverview, socialMedia, audioVirality, geoCountries, geoCities,
  businessPerformance,
} from "@/app/lib/data";

// Server-side cache (5-min TTL — Chartmetric data updates less frequently)
const CACHE_TTL_MS = 5 * 60 * 1000;
let cachedResponse: { data: any; timestamp: number } | null = null;

const CM_KEY = "D3dkDB915eXHxZd56jcBNdFkhqcrNmm2kdZy7VrryBbW1z0ELS5Mu7D9p5x9Atex";
const ARTIST_ID = 14502018;
const TRACK_IDS = [154858393, 156546722, 158459427]; // 0%, 0% PT, KAWASAKI

async function getToken(): Promise<string> {
  const res = await fetch("https://api.chartmetric.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshtoken: CM_KEY }),
  });
  if (!res.ok) throw new Error(`CM token failed: ${res.status}`);
  const data = await res.json();
  return data.token;
}

async function cmGet(token: string, path: string) {
  const res = await fetch(`https://api.chartmetric.com/api${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`CM ${path} failed: ${res.status}`);
  return res.json();
}

export async function GET() {
  if (cachedResponse && (Date.now() - cachedResponse.timestamp) < CACHE_TTL_MS) {
    const res = NextResponse.json(cachedResponse.data);
    res.headers.set("X-Cache", "HIT");
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60");
    return res;
  }

  try {
    const token = await getToken();

    // Fetch artist + all tracks in parallel
    const [artistRes, ...trackResults] = await Promise.all([
      cmGet(token, `/artist/${ARTIST_ID}`),
      ...TRACK_IDS.map(id => cmGet(token, `/track/${id}`)),
    ]);

    const artist = artistRes.obj;
    const stats = artist.cm_statistics || {};

    // Extract live metrics
    const liveData = {
      spotifyMonthlyListeners: stats.sp_monthly_listeners ?? businessPerformance.spotifyMonthlyListeners.current,
      spotifyFollowers: stats.sp_followers ?? businessPerformance.spotifyFollowers.current,
      spotifyPopularity: stats.sp_popularity ?? businessPerformance.spotifyPopularity.current,
      instagramFollowers: stats.ins_followers ?? null,
      tiktokFollowers: stats.tiktok_followers ?? null,
      tracks: trackResults.map((tr, i) => {
        const tStats = tr.obj?.cm_statistics || {};
        return {
          id: TRACK_IDS[i],
          name: businessPerformance.tracks[i]?.name ?? `Track ${i}`,
          spotifyStreams: tStats.sp_streams ?? businessPerformance.tracks[i]?.spotifyStreams.current ?? 0,
        };
      }),
      fetchedAt: new Date().toISOString(),
    };

    const responseData = { live: true, data: liveData };
    cachedResponse = { data: responseData, timestamp: Date.now() };
    const res = NextResponse.json(responseData);
    res.headers.set("X-Cache", "MISS");
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60");
    return res;
  } catch (err: any) {
    console.error("Chartmetric API error:", err.message);
    // Fallback to hardcoded data
    return NextResponse.json({
      live: false,
      error: err.message,
      data: {
        spotifyMonthlyListeners: businessPerformance.spotifyMonthlyListeners.current,
        spotifyFollowers: businessPerformance.spotifyFollowers.current,
        spotifyPopularity: businessPerformance.spotifyPopularity.current,
        instagramFollowers: null,
        tiktokFollowers: null,
        tracks: businessPerformance.tracks.map((t, i) => ({
          id: TRACK_IDS[i],
          name: t.name,
          spotifyStreams: t.spotifyStreams.current,
        })),
        fetchedAt: null,
      },
    });
  }
}
