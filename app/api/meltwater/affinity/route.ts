import { NextResponse } from "next/server";

const MW_TOKEN = "CwyOVYu0hn3hdXQ1CFPCqr5LLRVkuPNjn6tSAGtZ";
const CULTURAL_SEARCH_ID = "27940963"; // HBL - Cultural Affinity
const BASE = "https://api.meltwater.com";

function getDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  return {
    start: start.toISOString().split("T")[0] + "T00:00:00",
    end: end.toISOString().split("T")[0] + "T23:59:59",
  };
}

async function mwGet(path: string, params: Record<string, string> = {}) {
  const { start, end } = getDateRange();
  const qs = new URLSearchParams({ start, end, tz: "America/Mexico_City", ...params });
  const url = `${BASE}${path}?${qs}`;
  const res = await fetch(url, {
    headers: { apikey: MW_TOKEN, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Meltwater affinity ${path} failed: ${res.status}`);
  return res.json();
}

export async function GET() {
  try {
    const [analyticsRes, keyphrasesRes, hashtagsRes] = await Promise.all([
      mwGet(`/v3/analytics/${CULTURAL_SEARCH_ID}`),
      mwGet(`/v3/analytics/${CULTURAL_SEARCH_ID}/top_keyphrases`, { source: "twitter" }).catch(() => null),
      mwGet(`/v3/analytics/${CULTURAL_SEARCH_ID}/top_tags`, { source: "twitter" }).catch(() => null),
    ]);

    const totalMentions = analyticsRes.volume ?? 0;
    const sent = analyticsRes.sentiment || {};
    const total = (sent.positive || 0) + (sent.negative || 0) + (sent.neutral || 0) || 1;

    const rawPhrases = Array.isArray(keyphrasesRes) ? keyphrasesRes
      : Array.isArray(keyphrasesRes?.top_keyphrases) ? keyphrasesRes.top_keyphrases
      : Array.isArray(keyphrasesRes?.data) ? keyphrasesRes.data : [];

    const rawTags = Array.isArray(hashtagsRes) ? hashtagsRes
      : Array.isArray(hashtagsRes?.top_tags) ? hashtagsRes.top_tags
      : Array.isArray(hashtagsRes?.data) ? hashtagsRes.data : [];

    // Extract time series for volume chart
    const timeSeries = (analyticsRes.time_series || []).map((d: any) => ({
      date: new Date(d.date || d.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      mentions: d.count ?? d.volume ?? 0,
    }));

    // Unique authors
    const uniqueAuthors = analyticsRes.unique_authors ?? 0;

    return NextResponse.json({
      live: true,
      data: {
        totalMentions,
        uniqueAuthors,
        sentiment: {
          positive: parseFloat(((sent.positive || 0) / total * 100).toFixed(1)),
          negative: parseFloat(((sent.negative || 0) / total * 100).toFixed(1)),
          neutral: parseFloat(((sent.neutral || 0) / total * 100).toFixed(1)),
        },
        timeSeries,
        topKeyphrases: rawPhrases.slice(0, 10).map((k: any) => ({
          phrase: k.phrase || k.keyphrase || k.text || "",
          count: k.count ?? k.volume ?? 0,
        })),
        topHashtags: rawTags.slice(0, 10).map((h: any) => {
          const tag = h.tag || h.hashtag || h.text || "";
          return {
            tag: tag.startsWith("#") ? tag : `#${tag}`,
            count: h.count ?? h.volume ?? 0,
          };
        }),
      },
    });
  } catch (err: any) {
    console.error("Meltwater Cultural Affinity error:", err.message);
    return NextResponse.json({ live: false, error: err.message });
  }
}
