import { NextResponse } from "next/server";
import { prMedia, fanSentiment } from "@/app/lib/data";

const MW_TOKEN = "CwyOVYu0hn3hdXQ1CFPCqr5LLRVkuPNjn6tSAGtZ";
const SEARCH_ID = "27861227";
const BASE = "https://api.meltwater.com";

// Rolling 7-day window
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
  if (!res.ok) throw new Error(`Meltwater ${path} failed: ${res.status}`);
  return res.json();
}

const FLAG_MAP: Record<string, string> = {
  PE: "🇵🇪", MX: "🇲🇽", US: "🇺🇸", BR: "🇧🇷", JP: "🇯🇵", AR: "🇦🇷",
  CL: "🇨🇱", CO: "🇨🇴", ES: "🇪🇸", GB: "🇬🇧", FR: "🇫🇷", DE: "🇩🇪",
  KR: "🇰🇷", PH: "🇵🇭", ID: "🇮🇩", IN: "🇮🇳", CA: "🇨🇦", EC: "🇪🇨",
  GT: "🇬🇹", VE: "🇻🇪", BO: "🇧🇴", PY: "🇵🇾", UY: "🇺🇾", CR: "🇨🇷",
};

const COUNTRY_NAMES: Record<string, string> = {
  PE: "Peru", MX: "Mexico", US: "United States", BR: "Brazil", JP: "Japan",
  AR: "Argentina", CL: "Chile", CO: "Colombia", ES: "Spain", GB: "United Kingdom",
  FR: "France", DE: "Germany", KR: "South Korea", PH: "Philippines",
  ID: "Indonesia", IN: "India", CA: "Canada", EC: "Ecuador", GT: "Guatemala",
  VE: "Venezuela", BO: "Bolivia", PY: "Paraguay", UY: "Uruguay", CR: "Costa Rica",
};

export async function GET() {
  try {
    // Fetch analytics + keyphrases + hashtags in parallel
    const [analyticsRes, keyphrasesRes, hashtagsRes] = await Promise.all([
      mwGet(`/v3/analytics/${SEARCH_ID}`),
      mwGet(`/v3/analytics/${SEARCH_ID}/top_keyphrases`, { source: "twitter" }),
      mwGet(`/v3/analytics/${SEARCH_ID}/top_tags`, { source: "twitter" }),
    ]);

    const analytics = analyticsRes;

    // Extract volume & sentiment
    const totalMentions = analytics.volume ?? prMedia.totalMentions;
    const timeSeries = (analytics.time_series || []).map((d: any) => ({
      date: new Date(d.date || d.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      mentions: d.count ?? d.volume ?? 0,
    }));
    const days = timeSeries.length || 7;
    const perDay = Math.round(totalMentions / days);
    const uniqueAuthors = analytics.unique_authors ?? prMedia.uniqueAuthors;

    // Sentiment
    const sent = analytics.sentiment || {};
    const total = (sent.positive || 0) + (sent.negative || 0) + (sent.neutral || 0) || 1;
    const positive = { count: sent.positive || 0, pct: parseFloat(((sent.positive || 0) / total * 100).toFixed(1)) };
    const negative = { count: sent.negative || 0, pct: parseFloat(((sent.negative || 0) / total * 100).toFixed(1)) };
    const neutral = { count: sent.neutral || 0, pct: parseFloat(((sent.neutral || 0) / total * 100).toFixed(1)) };

    // Top countries
    const topCountries = (analytics.top_countries || []).slice(0, 6).map((c: any) => ({
      code: c.code || c.country_code || "",
      name: COUNTRY_NAMES[c.code || c.country_code || ""] || c.name || c.code || "Unknown",
      mentions: c.count ?? c.volume ?? 0,
      flag: FLAG_MAP[c.code || c.country_code || ""] || "🌍",
    }));

    // Top keyphrases
    const topKeyphrases = (keyphrasesRes?.top_keyphrases || keyphrasesRes || []).slice(0, 9).map((k: any) => ({
      phrase: k.phrase || k.keyphrase || k.text || "",
      count: k.count ?? k.volume ?? 0,
    }));

    // Top hashtags
    const rawTags = hashtagsRes?.top_tags || hashtagsRes || [];
    const topHashtags = rawTags.slice(0, 7).map((h: any) => {
      const tag = h.tag || h.hashtag || h.text || "";
      const count = h.count ?? h.volume ?? 0;
      return {
        tag: tag.startsWith("#") ? tag : `#${tag}`,
        count,
        pct: parseFloat((count / (totalMentions || 1) * 100).toFixed(1)),
      };
    });

    // Build period string
    const { start, end } = getDateRange();
    const startDate = new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const endDate = new Date(end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const period = `${startDate} – ${endDate}`;

    return NextResponse.json({
      live: true,
      data: {
        prMedia: { period, totalMentions, perDay, uniqueAuthors, timeSeries, topCountries, topKeyphrases },
        fanSentiment: { period, positive, negative, neutral, topHashtags },
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("Meltwater API error:", err.message);
    return NextResponse.json({
      live: false,
      error: err.message,
      data: {
        prMedia,
        fanSentiment,
        fetchedAt: null,
      },
    });
  }
}
