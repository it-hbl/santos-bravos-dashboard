import { NextResponse } from "next/server";
import { prMedia, fanSentiment } from "@/app/lib/data";

const MW_TOKEN = "CwyOVYu0hn3hdXQ1CFPCqr5LLRVkuPNjn6tSAGtZ";
const SEARCH_ID = "27861227";
const HYBE_LATIN_SEARCH_ID = "27924306"; // HBL | Hybe Latin America (parent brand)
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

// Rolling 14-day window for WoW comparison
function get14DayRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 14);
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
    // Fetch analytics + keyphrases + hashtags + sources in parallel
    // Also fetch 14-day analytics for WoW comparison
    const { start: start14, end: end14 } = get14DayRange();
    const [analyticsRes, keyphrasesRes, hashtagsRes, sourcesRes, entitiesRes, sharedLinksRes, mentionsRes, topicsRes, locationsRes, analytics14Res, hybeLatinRes, twitterRes, instagramRes, newsRes, tiktokRes, redditRes] = await Promise.all([
      mwGet(`/v3/analytics/${SEARCH_ID}`),
      mwGet(`/v3/analytics/${SEARCH_ID}/top_keyphrases`, { source: "twitter" }),
      mwGet(`/v3/analytics/${SEARCH_ID}/top_tags`, { source: "twitter" }),
      mwGet(`/v3/analytics/${SEARCH_ID}/top_sources`).catch(() => null),
      mwGet(`/v3/analytics/${SEARCH_ID}/top_entities`).catch(() => null),
      mwGet(`/v3/analytics/${SEARCH_ID}/top_shared_links`).catch(() => null),
      mwGet(`/v3/analytics/${SEARCH_ID}/top_mentions`, { source: "twitter" }).catch(() => null),
      mwGet(`/v3/analytics/${SEARCH_ID}/top_topics`).catch(() => null),
      mwGet(`/v3/analytics/${SEARCH_ID}/top_locations`).catch(() => null),
      fetch(`${BASE}/v3/analytics/${SEARCH_ID}?start=${start14}&end=${end14}&tz=America/Mexico_City`, {
        headers: { apikey: MW_TOKEN, Accept: "application/json" },
      }).then(r => r.ok ? r.json() : null).catch(() => null),
      mwGet(`/v3/analytics/${HYBE_LATIN_SEARCH_ID}`).catch(() => null),
      // Per-source sentiment for platform breakdown
      mwGet(`/v3/analytics/${SEARCH_ID}`, { source: "twitter" }).catch(() => null),
      mwGet(`/v3/analytics/${SEARCH_ID}`, { source: "instagram" }).catch(() => null),
      mwGet(`/v3/analytics/${SEARCH_ID}`, { source: "news" }).catch(() => null),
      mwGet(`/v3/analytics/${SEARCH_ID}`, { source: "tiktok" }).catch(() => null),
      mwGet(`/v3/analytics/${SEARCH_ID}`, { source: "reddit" }).catch(() => null),
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

    // Top languages (from main analytics response)
    const LANG_NAMES: Record<string, string> = {
      es: "Spanish", en: "English", pt: "Portuguese", ja: "Japanese", ko: "Korean",
      fr: "French", de: "German", it: "Italian", id: "Indonesian", tl: "Tagalog",
      ar: "Arabic", hi: "Hindi", zh: "Chinese", tr: "Turkish", th: "Thai",
      ru: "Russian", nl: "Dutch", pl: "Polish", sv: "Swedish", vi: "Vietnamese",
    };
    const LANG_FLAGS: Record<string, string> = {
      es: "🇪🇸", en: "🇬🇧", pt: "🇧🇷", ja: "🇯🇵", ko: "🇰🇷",
      fr: "🇫🇷", de: "🇩🇪", it: "🇮🇹", id: "🇮🇩", tl: "🇵🇭",
      ar: "🇸🇦", hi: "🇮🇳", zh: "🇨🇳", tr: "🇹🇷", th: "🇹🇭",
      ru: "🇷🇺", nl: "🇳🇱", pl: "🇵🇱", sv: "🇸🇪", vi: "🇻🇳",
    };
    const topLanguages = (analytics.top_languages || []).slice(0, 8).map((l: any) => {
      const code = l.code || l.language_code || l.language || "";
      const count = l.count ?? l.volume ?? 0;
      return {
        code,
        name: LANG_NAMES[code] || l.name || code || "Unknown",
        flag: LANG_FLAGS[code] || "🌐",
        count,
        pct: parseFloat((count / (totalMentions || 1) * 100).toFixed(1)),
      };
    });

    // Top keyphrases — handle various response shapes
    const rawPhrases = Array.isArray(keyphrasesRes) ? keyphrasesRes
      : Array.isArray(keyphrasesRes?.top_keyphrases) ? keyphrasesRes.top_keyphrases
      : Array.isArray(keyphrasesRes?.data) ? keyphrasesRes.data
      : [];
    const topKeyphrases = rawPhrases.slice(0, 9).map((k: any) => ({
      phrase: k.phrase || k.keyphrase || k.text || "",
      count: k.count ?? k.volume ?? 0,
    }));

    // Top hashtags — handle various response shapes
    const rawTags = Array.isArray(hashtagsRes) ? hashtagsRes
      : Array.isArray(hashtagsRes?.top_tags) ? hashtagsRes.top_tags
      : Array.isArray(hashtagsRes?.data) ? hashtagsRes.data
      : [];
    const topHashtags = rawTags.slice(0, 7).map((h: any) => {
      const tag = h.tag || h.hashtag || h.text || "";
      const count = h.count ?? h.volume ?? 0;
      return {
        tag: tag.startsWith("#") ? tag : `#${tag}`,
        count,
        pct: parseFloat((count / (totalMentions || 1) * 100).toFixed(1)),
      };
    });

    // Top sources — media outlets / platforms
    const rawSources = sourcesRes
      ? (Array.isArray(sourcesRes) ? sourcesRes
        : Array.isArray(sourcesRes?.top_sources) ? sourcesRes.top_sources
        : Array.isArray(sourcesRes?.data) ? sourcesRes.data
        : [])
      : [];
    const topSources = rawSources.slice(0, 8).map((s: any) => ({
      name: s.name || s.source || s.domain || "Unknown",
      count: s.count ?? s.volume ?? 0,
      type: s.type || s.source_type || "other",
    }));

    // Top entities (people, orgs, places mentioned)
    const rawEntities = entitiesRes
      ? (Array.isArray(entitiesRes) ? entitiesRes
        : Array.isArray(entitiesRes?.top_entities) ? entitiesRes.top_entities
        : Array.isArray(entitiesRes?.data) ? entitiesRes.data
        : [])
      : [];
    const topEntities = rawEntities.slice(0, 8).map((e: any) => ({
      name: e.name || e.entity || e.text || "Unknown",
      count: e.count ?? e.volume ?? 0,
      type: e.type || e.entity_type || "unknown",
    }));

    // Top shared links
    const rawLinks = sharedLinksRes
      ? (Array.isArray(sharedLinksRes) ? sharedLinksRes
        : Array.isArray(sharedLinksRes?.top_shared_links) ? sharedLinksRes.top_shared_links
        : Array.isArray(sharedLinksRes?.data) ? sharedLinksRes.data
        : [])
      : [];
    const topSharedLinks = rawLinks.slice(0, 5).map((l: any) => ({
      url: l.url || l.link || "",
      title: l.title || l.text || l.url || "",
      count: l.count ?? l.shares ?? l.volume ?? 0,
    }));

    // Top topics (conversation themes)
    const rawTopics = topicsRes
      ? (Array.isArray(topicsRes) ? topicsRes
        : Array.isArray(topicsRes?.top_topics) ? topicsRes.top_topics
        : Array.isArray(topicsRes?.data) ? topicsRes.data
        : [])
      : [];
    const topTopics = rawTopics.slice(0, 10).map((t: any) => ({
      topic: t.topic || t.name || t.text || "Unknown",
      count: t.count ?? t.volume ?? 0,
    }));

    // Top mentions (influencer handles)
    const rawMentions = mentionsRes
      ? (Array.isArray(mentionsRes) ? mentionsRes
        : Array.isArray(mentionsRes?.top_mentions) ? mentionsRes.top_mentions
        : Array.isArray(mentionsRes?.data) ? mentionsRes.data
        : [])
      : [];
    const topMentions = rawMentions.slice(0, 10).map((m: any) => ({
      handle: m.name || m.mention || m.handle || m.text || "Unknown",
      count: m.count ?? m.volume ?? 0,
    }));

    // Top locations (cities)
    const rawLocations = locationsRes
      ? (Array.isArray(locationsRes) ? locationsRes
        : Array.isArray(locationsRes?.top_locations) ? locationsRes.top_locations
        : Array.isArray(locationsRes?.data) ? locationsRes.data
        : [])
      : [];
    const topCities = rawLocations.slice(0, 10).map((l: any) => ({
      city: l.name || l.city || l.location || "Unknown",
      country: l.country || l.country_code || "",
      count: l.count ?? l.volume ?? 0,
      flag: FLAG_MAP[l.country || l.country_code || ""] || "🌍",
    }));

    // Compute Week-over-Week comparison from 14-day data
    let wow: { thisWeek: number; lastWeek: number; change: number; changePct: number; thisWeekSeries: { day: string; mentions: number }[]; lastWeekSeries: { day: string; mentions: number }[] } | null = null;
    if (analytics14Res) {
      const ts14 = (analytics14Res.time_series || []).map((d: any) => ({
        date: new Date(d.date || d.timestamp),
        mentions: d.count ?? d.volume ?? 0,
      }));
      // Sort by date ascending
      ts14.sort((a: any, b: any) => a.date.getTime() - b.date.getTime());
      const midpoint = Math.ceil(ts14.length / 2);
      const lastWeekDays = ts14.slice(0, midpoint);
      const thisWeekDays = ts14.slice(midpoint);
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const lwTotal = lastWeekDays.reduce((s: number, d: any) => s + d.mentions, 0);
      const twTotal = thisWeekDays.reduce((s: number, d: any) => s + d.mentions, 0);
      const changePct = lwTotal > 0 ? ((twTotal - lwTotal) / lwTotal) * 100 : 0;
      wow = {
        thisWeek: twTotal,
        lastWeek: lwTotal,
        change: twTotal - lwTotal,
        changePct: parseFloat(changePct.toFixed(1)),
        thisWeekSeries: thisWeekDays.map((d: any) => ({ day: dayNames[d.date.getDay()], mentions: d.mentions })),
        lastWeekSeries: lastWeekDays.map((d: any) => ({ day: dayNames[d.date.getDay()], mentions: d.mentions })),
      };
    }

    // Build period string
    const { start, end } = getDateRange();
    const startDate = new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const endDate = new Date(end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const period = `${startDate} – ${endDate}`;

    // Estimate daily sentiment by distributing overall sentiment ratios across daily volume
    const sentimentTimeline = timeSeries.map((d: { date: string; mentions: number }) => ({
      date: d.date,
      positive: Math.round(d.mentions * (positive.pct / 100)),
      neutral: Math.round(d.mentions * (neutral.pct / 100)),
      negative: Math.round(d.mentions * (negative.pct / 100)),
      total: d.mentions,
    }));

    // Parse HYBE Latin America (parent brand) analytics for Share of Voice
    let hybeLatin: { totalMentions: number; uniqueAuthors: number; sentiment: { positive: number; negative: number; neutral: number } } | null = null;
    if (hybeLatinRes) {
      const hlSent = hybeLatinRes.sentiment || {};
      const hlTotal = (hlSent.positive || 0) + (hlSent.negative || 0) + (hlSent.neutral || 0) || 1;
      hybeLatin = {
        totalMentions: hybeLatinRes.volume ?? 0,
        uniqueAuthors: hybeLatinRes.unique_authors ?? 0,
        sentiment: {
          positive: parseFloat(((hlSent.positive || 0) / hlTotal * 100).toFixed(1)),
          negative: parseFloat(((hlSent.negative || 0) / hlTotal * 100).toFixed(1)),
          neutral: parseFloat(((hlSent.neutral || 0) / hlTotal * 100).toFixed(1)),
        },
      };
    }

    // Parse per-source sentiment for platform breakdown
    const parseSourceSentiment = (res: any, name: string, icon: string, color: string) => {
      if (!res) return null;
      const s = res.sentiment || {};
      const vol = res.volume ?? 0;
      const t = (s.positive || 0) + (s.negative || 0) + (s.neutral || 0) || 1;
      return {
        name,
        icon,
        color,
        volume: vol,
        positive: parseFloat(((s.positive || 0) / t * 100).toFixed(1)),
        negative: parseFloat(((s.negative || 0) / t * 100).toFixed(1)),
        neutral: parseFloat(((s.neutral || 0) / t * 100).toFixed(1)),
        nss: parseFloat((((s.positive || 0) - (s.negative || 0)) / t * 100).toFixed(1)),
      };
    };

    const sentimentByPlatform = [
      parseSourceSentiment(twitterRes, "X / Twitter", "𝕏", "#1DA1F2"),
      parseSourceSentiment(instagramRes, "Instagram", "📷", "#E1306C"),
      parseSourceSentiment(newsRes, "News", "📰", "#8B5CF6"),
      parseSourceSentiment(tiktokRes, "TikTok", "🎵", "#00F2EA"),
      parseSourceSentiment(redditRes, "Reddit", "🟠", "#FF4500"),
    ].filter(Boolean);

    return NextResponse.json({
      live: true,
      data: {
        prMedia: { period, totalMentions, perDay, uniqueAuthors, timeSeries, topCountries, topKeyphrases, topSources, topMentions, topTopics, topCities, topLanguages, wow },
        fanSentiment: { period, positive, negative, neutral, topHashtags, topEntities, topSharedLinks, sentimentTimeline, sentimentByPlatform },
        hybeLatin,
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
