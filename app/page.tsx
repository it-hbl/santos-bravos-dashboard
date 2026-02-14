"use client";

import {
  reportDate as fallbackReportDate, priorDate as fallbackPriorDate,
  businessPerformance as fallbackBP, dailyStreams as fallbackDailyStreams,
  socialMedia as fallbackSocialMedia, audioVirality as fallbackAudioVirality,
  members as fallbackMembers, totalMemberFollowers as fallbackTotalMemberFollowers,
  geoCountries as fallbackGeoCountries, geoCities as fallbackGeoCities,
  prMedia as fallbackPrMedia, fanSentiment as fallbackFanSentiment,
  audienceStats as fallbackAudienceStats, artistOverview as fallbackArtistOverview,
  RELEASES, getTrackReleaseDate,
} from "./lib/data";
import { getDashboardData, getAvailableDates } from "./lib/db";
import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import DatePicker from "./components/DatePicker";
import { AnimatedSection, CountUpValue, StaggerChildren, StaggerItem } from "./components/AnimatedSection";
import Image from "next/image";
import { LiveDataProvider, LiveBadge, useLiveData } from "./components/LiveDataProvider";
import UserMenu from "./components/UserMenu";
import CollapsibleSection from "./components/CollapsibleSection";
import ScrollProgress from "./components/ScrollProgress";
import Sparkline from "./components/Sparkline";
import MetricTooltip from "./components/MetricTooltip";
import StickyTicker from "./components/StickyTicker";
import DataFreshness from "./components/DataFreshness";
import SkeletonLoader from "./components/SkeletonLoader";
import BackToTop from "./components/BackToTop";
import TopMoverBadge, { Mover } from "./components/TopMoverBadge";
import { ErrorBoundary, SectionErrorBoundary } from "./components/ErrorBoundary";
import GlowCard from "./components/GlowCard";
import useSectionHash from "./components/useSectionHash";
import { useFocusMode, FocusOverlay } from "./components/FocusMode";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Dynamic imports — lazy-loaded below-fold components for faster initial page load
const StreamingCharts = dynamic(() => import("./components/StreamingCharts"), { ssr: false });
const SocialChart = dynamic(() => import("./components/SocialChart"), { ssr: false });
const GeoChart = dynamic(() => import("./components/GeoChart").then(m => ({ default: m.default })), { ssr: false });
const GeoProgressBarsLazy = dynamic(() => import("./components/GeoChart").then(m => ({ default: m.GeoProgressBars })), { ssr: false });
const MentionsChart = dynamic(() => import("./components/MentionsChart"), { ssr: false });
const SentimentDonut = dynamic(() => import("./components/SentimentDonut"), { ssr: false });
const ViralityChart = dynamic(() => import("./components/ViralityChart"), { ssr: false });
const ViralityRatio = dynamic(() => import("./components/ViralityRatio"), { ssr: false });
const SourceDonut = dynamic(() => import("./components/SourceDonut"), { ssr: false });
const KeyHighlights = dynamic(() => import("./components/KeyHighlights"), { ssr: false });
const GrowthVelocity = dynamic(() => import("./components/GrowthVelocity"), { ssr: false });
const SectionNav = dynamic(() => import("./components/SectionNav"), { ssr: false });
const PlatformDistribution = dynamic(() => import("./components/PlatformDistribution"), { ssr: false });
const SentimentGauge = dynamic(() => import("./components/SentimentGauge"), { ssr: false });
const TrackRadar = dynamic(() => import("./components/TrackRadar"), { ssr: false });
const MemberBuzz = dynamic(() => import("./components/MemberBuzz"), { ssr: false });
const CopySummary = dynamic(() => import("./components/CopySummary"), { ssr: false });
const SentimentTimeline = dynamic(() => import("./components/SentimentTimeline"), { ssr: false });
const AudienceFunnel = dynamic(() => import("./components/AudienceFunnel"), { ssr: false });
const DataSourcesStatus = dynamic(() => import("./components/DataSourcesStatus"), { ssr: false });
const MilestonesTracker = dynamic(() => import("./components/MilestonesTracker"), { ssr: false });
const KeyboardShortcuts = dynamic(() => import("./components/KeyboardShortcuts"), { ssr: false });
const GeoTreemap = dynamic(() => import("./components/GeoTreemap"), { ssr: false });
const DailyComparisonChart = dynamic(() => import("./components/DailyComparisonChart"), { ssr: false });
const TopInfluencers = dynamic(() => import("./components/TopInfluencers"), { ssr: false });
const AnalystNote = dynamic(() => import("./components/AnalystNote"), { ssr: false });
const ExportCSV = dynamic(() => import("./components/ExportCSV"), { ssr: false });
const RegionalBreakdown = dynamic(() => import("./components/RegionalBreakdown"), { ssr: false });
const PerformanceScore = dynamic(() => import("./components/PerformanceScore"), { ssr: false });
const WowComparison = dynamic(() => import("./components/WowComparison"), { ssr: false });
const MobileNav = dynamic(() => import("./components/MobileNav"), { ssr: false });
const CommandPalette = dynamic(() => import("./components/CommandPalette"), { ssr: false });
const TopTopics = dynamic(() => import("./components/TopTopics"), { ssr: false });
const ExecutiveOneLiner = dynamic(() => import("./components/ExecutiveOneLiner"), { ssr: false });
const ReleaseTimeline = dynamic(() => import("./components/ReleaseTimeline"), { ssr: false });
const InsightCarousel = dynamic(() => import("./components/InsightCarousel"), { ssr: false });
const SocialMediaCards = dynamic(() => import("./components/SocialMediaCards"), { ssr: false });
const MediaVsAudience = dynamic(() => import("./components/MediaVsAudience"), { ssr: false });
const MentionMomentum = dynamic(() => import("./components/MentionMomentum"), { ssr: false });
const WeekdayHeatmap = dynamic(() => import("./components/WeekdayHeatmap"), { ssr: false });
const HistoricalTrends = dynamic(() => import("./components/HistoricalTrends"), { ssr: false });
const TrackHistory = dynamic(() => import("./components/TrackHistory"), { ssr: false });
const YouTubeHistory = dynamic(() => import("./components/YouTubeHistory"), { ssr: false });
const SocialHistory = dynamic(() => import("./components/SocialHistory"), { ssr: false });
const QuickShare = dynamic(() => import("./components/QuickShare"), { ssr: false });
const EngagementDepth = dynamic(() => import("./components/EngagementDepth"), { ssr: false });
const StreamProjections = dynamic(() => import("./components/StreamProjections"), { ssr: false });
const ContentEfficiency = dynamic(() => import("./components/ContentEfficiency"), { ssr: false });
const ReleasePacing = dynamic(() => import("./components/ReleasePacing"), { ssr: false });
const AudienceHealth = dynamic(() => import("./components/AudienceHealth"), { ssr: false });
const ReachDiversity = dynamic(() => import("./components/ReachDiversity"), { ssr: false });
const MarketPenetration = dynamic(() => import("./components/MarketPenetration"), { ssr: false });
const SpotifyEmbed = dynamic(() => import("./components/SpotifyEmbed"), { ssr: false });
const NotableChanges = dynamic(() => import("./components/NotableChanges"), { ssr: false });
const WeeklyWins = dynamic(() => import("./components/WeeklyWins"), { ssr: false });
const RiskRadar = dynamic(() => import("./components/RiskRadar"), { ssr: false });
const ActionItems = dynamic(() => import("./components/ActionItems"), { ssr: false });
const ComparisonTable = dynamic(() => import("./components/ComparisonTable"), { ssr: false });
const ShareOfVoice = dynamic(() => import("./components/ShareOfVoice"), { ssr: false });
const CulturalAffinity = dynamic(() => import("./components/CulturalAffinity"), { ssr: false });
const MetricAlerts = dynamic(() => import("./components/MetricAlerts"), { ssr: false });
const PrintQR = dynamic(() => import("./components/PrintQR"), { ssr: false });
const SectionDivider = dynamic(() => import("./components/SectionDivider"), { ssr: false });
const RevenueEstimate = dynamic(() => import("./components/RevenueEstimate"), { ssr: false });
const HeroScoreBadge = dynamic(() => import("./components/HeroScoreBadge"), { ssr: false });

/** Extract short date like "2/9/26" from "February 9, 2026" or ISO date */
function shortDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    // Try parsing as a readable date like "February 9, 2026"
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(-2)}`;
    }
  } catch {}
  return dateStr;
}

/** Extract just the day number from a date string */
function dayNumber(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return String(d.getDate());
  } catch {}
  return "—";
}

/** Format date for section subtitles like "As of 2/9/26" */
function sectionDate(dateStr: string): string {
  return `As of ${shortDate(dateStr)}`;
}

function fmt(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n?.toLocaleString() ?? "—";
}

function dod(current: number, prior: number | null) {
  if (prior === null || prior === 0) return { diff: "—", pct: "—", positive: true };
  const diff = current - prior;
  const pct = ((diff / prior) * 100).toFixed(1);
  return {
    diff: (diff >= 0 ? "+" : "") + fmt(diff),
    pct: (diff >= 0 ? "+" : "") + pct + "%",
    positive: diff >= 0,
  };
}

function DodBadge({ current, prior }: { current: number; prior: number | null }) {
  if (prior === null) return null;
  const d = dod(current, prior);
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${d.positive ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
      {d.pct}
    </span>
  );
}

function MetricRow({ label, current, prior, accent, tooltip }: { label: string; current: number; prior: number | null; accent?: string; tooltip?: string }) {
  const d = dod(current, prior);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-white/[0.03] last:border-0 group hover:bg-white/[0.01] px-2 -mx-2 rounded gap-1 sm:gap-0">
      <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors flex-1 truncate">
        {tooltip ? <MetricTooltip term={tooltip}>{label}</MetricTooltip> : label}
      </span>
      <div className="flex items-center gap-3 sm:gap-4 pl-0 sm:pl-4">
        <span className={`text-sm font-bold tabular-nums ${accent || "text-white"}`}>{fmt(current)}</span>
        {prior !== null && (
          <>
            <span className="text-[10px] text-neutral-600 tabular-nums hidden sm:inline w-16 text-right">{fmt(prior)}</span>
            <span className={`text-[10px] font-semibold tabular-nums hidden sm:inline w-16 text-right ${d.positive ? "text-emerald-400" : "text-red-400"}`}>{d.diff}</span>
            <DodBadge current={current} prior={prior} />
          </>
        )}
      </div>
    </div>
  );
}

/** Generate a plausible 7-point trend line between prior and current values */
function trendPoints(prior: number | null, current: number, points = 7): number[] {
  const start = prior ?? current * 0.95;
  const arr: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    // ease-in curve with slight noise
    const base = start + (current - start) * (t * t * (3 - 2 * t));
    const noise = base * (Math.sin(i * 2.5) * 0.008);
    arr.push(Math.round(base + noise));
  }
  arr[arr.length - 1] = current; // pin endpoint
  return arr;
}

function SectionHeader({ number, title, subtitle, color }: { number: string; title: string; subtitle?: string; color: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-[11px] font-black text-white`}>{number}</div>
        <h2 className="text-lg font-bold tracking-tight text-white">{title}</h2>
      </div>
      {subtitle && <span className="text-[10px] text-neutral-600 uppercase tracking-widest">{subtitle}</span>}
    </div>
  );
}

function Dashboard() {
  // Sync URL hash with visible section for deep linking
  useSectionHash();

  // Focus mode — presentation view for individual sections
  const focus = useFocusMode();

  // Read initial date from URL query param (?date=YYYY-MM-DD) or default
  const getInitialDate = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlDate = params.get("date");
      if (urlDate && /^\d{4}-\d{2}-\d{2}$/.test(urlDate)) return urlDate;
    }
    return "2026-02-09";
  };

  const [selectedDate, setSelectedDate] = useState(getInitialDate);
  const [availableDates, setAvailableDates] = useState<string[]>(["2026-02-09"]);
  const [dateLoading, setDateLoading] = useState(false);
  const initialLoadDone = useRef(false);

  // Data state — defaults to fallback (hardcoded)
  const [reportDate, setReportDate] = useState(fallbackReportDate);
  const [priorDate, setPriorDate] = useState(fallbackPriorDate);
  const [businessPerformance, setBusinessPerformance] = useState(fallbackBP);
  const [dailyStreams, setDailyStreams] = useState(fallbackDailyStreams);
  const [socialMedia, setSocialMedia] = useState(fallbackSocialMedia);
  const [audioVirality, setAudioVirality] = useState(fallbackAudioVirality);
  const [members, setMembers] = useState(fallbackMembers);
  const [totalMemberFollowers, setTotalMemberFollowers] = useState(fallbackTotalMemberFollowers);
  const [geoCountries, setGeoCountries] = useState(fallbackGeoCountries);
  const [geoCities, setGeoCities] = useState(fallbackGeoCities);
  const [prMedia, setPrMedia] = useState(fallbackPrMedia);
  const [fanSentiment, setFanSentiment] = useState(fallbackFanSentiment);
  const [audienceStats, setAudienceStats] = useState(fallbackAudienceStats);
  const [artistOverview, setArtistOverview] = useState(fallbackArtistOverview);

  // Sync selected date to URL without full page reload
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (selectedDate && selectedDate !== "2026-02-09") {
      url.searchParams.set("date", selectedDate);
    } else {
      url.searchParams.delete("date");
    }
    window.history.replaceState({}, "", url.toString());
  }, [selectedDate]);

  // Fetch available dates on mount, then load URL date if present
  useEffect(() => {
    getAvailableDates().then(dates => {
      if (dates.length > 0) {
        setAvailableDates(dates);
        // If URL had a date param, load that date's data on mount
        const urlDate = getInitialDate();
        if (urlDate !== "2026-02-09" && dates.includes(urlDate) && !initialLoadDone.current) {
          initialLoadDone.current = true;
          handleDateChange(urlDate);
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch data when date changes
  const handleDateChange = useCallback(async (date: string) => {
    setSelectedDate(date);
    setDateLoading(true);
    // Scroll to top so the user sees fresh data from the beginning
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const data = await getDashboardData(date);
      setReportDate(data.reportDate);
      setPriorDate(data.priorDate);
      setBusinessPerformance(data.businessPerformance);
      setDailyStreams(data.dailyStreams);
      setSocialMedia(data.socialMedia);
      setAudioVirality(data.audioVirality);
      setMembers(data.members);
      setTotalMemberFollowers(data.totalMemberFollowers);
      setGeoCountries(data.geoCountries);
      setGeoCities(data.geoCities);
      setPrMedia(data.prMedia as any);
      setFanSentiment(data.fanSentiment as any);
      setAudienceStats(data.audienceStats);
      setArtistOverview(data.artistOverview);
    } catch (err) {
      console.error('Failed to fetch data for date:', date, err);
    } finally {
      setDateLoading(false);
    }
  }, []);

  const bp = businessPerformance;
  const o = artistOverview;
  const { refresh } = useLiveData();

  // All data now comes from Supabase via date picker — no more live API overlays
  const livePR = prMedia as any;
  const liveSentiment = fanSentiment as any;
  const liveListeners = bp.spotifyMonthlyListeners.current;
  const liveFollowers = bp.spotifyFollowers?.current ?? 0;
  const livePopularity = bp.spotifyPopularity.current;
  const liveTrackStreams = bp.tracks;

  // All data from Supabase — no live API overlays
  const liveYTVideos = bp.youtubeVideos.map((v: any) => ({
    ...v,
    likes: v.likes ?? 0,
    comments: v.comments ?? 0,
  }));
  const liveSocialMedia = socialMedia;
  const liveYTSubscribers = socialMedia.platforms.find(p => p.platform === "YouTube")?.current ?? 471000;

  // Compute section trends for collapsed badges
  function sectionTrend(current: number, prior: number | null | undefined): { value: string; positive: boolean } | null {
    if (prior == null || prior === 0) return null;
    const pct = ((current - prior) / prior * 100).toFixed(1);
    return { value: `${Math.abs(parseFloat(pct))}%`, positive: current >= prior };
  }
  const trendListeners = sectionTrend(bp.spotifyMonthlyListeners.current, bp.spotifyMonthlyListeners.prior);
  const trendSNS = sectionTrend(liveSocialMedia.totalFootprint.current, liveSocialMedia.totalFootprint.prior);
  const trendSentiment = liveSentiment.positive.pct > liveSentiment.negative.pct
    ? { value: `+${(liveSentiment.positive.pct - liveSentiment.negative.pct).toFixed(0)} net`, positive: true }
    : { value: `${(liveSentiment.positive.pct - liveSentiment.negative.pct).toFixed(0)} net`, positive: false };

  // Dynamic browser tab title — shows key metric so executives see the number even in background tabs
  useEffect(() => {
    const listenerStr = fmt(liveListeners);
    const streamStr = fmt(bp.totalCrossPlatformStreams.current);
    const netSent = liveSentiment.positive.pct - liveSentiment.negative.pct;
    const sentStr = netSent >= 0 ? `+${netSent.toFixed(0)}` : netSent.toFixed(0);
    document.title = `${listenerStr} Listeners · ${streamStr} Streams · Sent ${sentStr} — Santos Bravos`;
  }, [liveListeners, bp.totalCrossPlatformStreams.current, liveSentiment.positive.pct, liveSentiment.negative.pct]);

  return (
    <main className="min-h-screen">
      {/* Focus mode overlay */}
      <FocusOverlay active={focus.active} sectionId={focus.sectionId} title={focus.title} onExit={focus.exit} />
      {/* Print-only header */}
      <div className="print-header hidden" style={{ display: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #7C3AED', paddingBottom: '8px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '3px' }}>HYBE</div>
            <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '2px' }}>Latin America · Artist Intelligence</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>SANTOS BRAVOS — Daily Report</div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>{reportDate} · Printed {new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>
      <ScrollProgress />
      <StickyTicker metrics={[
        {
          label: "Listeners",
          value: fmt(liveListeners),
          color: "text-spotify",
          change: bp.spotifyMonthlyListeners.prior ? dod(liveListeners, bp.spotifyMonthlyListeners.prior).pct : undefined,
          positive: bp.spotifyMonthlyListeners.prior ? dod(liveListeners, bp.spotifyMonthlyListeners.prior).positive : true,
          sectionId: "business",
          sparkData: trendPoints(bp.spotifyMonthlyListeners.prior, liveListeners, 5),
        },
        {
          label: "Followers",
          value: fmt(liveFollowers),
          color: "text-spotify",
          sectionId: "business",
          sparkData: bp.spotifyFollowers?.prior ? trendPoints(bp.spotifyFollowers.prior, liveFollowers, 5) : undefined,
        },
        {
          label: "Streams",
          value: fmt(bp.totalCrossPlatformStreams.current),
          color: "text-white",
          sectionId: "charts",
          sparkData: trendPoints(bp.totalCrossPlatformStreams.prior, bp.totalCrossPlatformStreams.current, 5),
        },
        {
          label: "SNS",
          value: fmt(liveSocialMedia.totalFootprint.current),
          color: "text-tiktok",
          change: liveSocialMedia.totalFootprint.prior ? dod(liveSocialMedia.totalFootprint.current, liveSocialMedia.totalFootprint.prior).pct : undefined,
          positive: liveSocialMedia.totalFootprint.prior ? dod(liveSocialMedia.totalFootprint.current, liveSocialMedia.totalFootprint.prior).positive : true,
          sectionId: "social",
          sparkData: trendPoints(liveSocialMedia.totalFootprint.prior, liveSocialMedia.totalFootprint.current, 5),
        },
        {
          label: "YT Subs",
          value: fmt(liveYTSubscribers),
          color: "text-ytred",
          sectionId: "social",
        },
        {
          label: "Mentions",
          value: fmt(livePR.totalMentions),
          color: "text-violet-400",
          sectionId: "pr",
          sparkData: livePR.timeSeries?.length >= 2 ? livePR.timeSeries.slice(-5).map((d: any) => d.mentions) : undefined,
        },
        {
          label: "Sentiment",
          value: `+${(liveSentiment.positive.pct - liveSentiment.negative.pct).toFixed(0)}`,
          color: liveSentiment.positive.pct > liveSentiment.negative.pct ? "text-emerald-400" : "text-red-400",
          sectionId: "sentiment",
        },
      ]} />
      {/* Skip to content — keyboard accessibility */}
      <a href="#main-content" className="skip-to-content">Skip to dashboard content</a>
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-white/5 px-3 sm:px-6 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <svg viewBox="0 0 100 24" className="h-4 text-white flex-shrink-0" fill="currentColor">
            <text x="0" y="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="22" letterSpacing="3">HYBE</text>
          </svg>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.2em] hidden sm:inline">Latin America</span>
          <div className="w-px h-4 bg-white/10 hidden md:block" />
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.15em] hidden md:inline">Artist Intelligence</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <DatePicker
            selectedDate={selectedDate}
            availableDates={availableDates}
            onDateChange={handleDateChange}
            loading={dateLoading}
          />
          <button
            onClick={() => window.print()}
            className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 sm:px-3 py-1.5 hover:bg-white/[0.08] transition-colors"
            title="Print / Save as PDF"
          >
            <span className="text-[10px] text-white font-bold uppercase tracking-wider">🖨️<span className="hidden sm:inline"> PDF</span></span>
          </button>
          <CopySummary data={{
            reportDate,
            listeners: liveListeners,
            listenersPrior: bp.spotifyMonthlyListeners.prior,
            totalStreams: bp.totalCrossPlatformStreams.current,
            snsFootprint: liveSocialMedia.totalFootprint.current,
            snsFootprintPrior: liveSocialMedia.totalFootprint.prior,
            tracks: liveTrackStreams.map(t => ({ name: t.name, streams: t.spotifyStreams.current })),
            ytVideos: liveYTVideos.map(v => ({ name: v.name, views: v.views.current })),
            ytSubscribers: liveYTSubscribers,
            platforms: liveSocialMedia.platforms.map(p => ({ platform: p.platform, current: p.current })),
            prMentions: livePR.totalMentions,
            prPerDay: livePR.perDay,
            sentimentPositive: liveSentiment.positive.pct,
            sentimentNegative: liveSentiment.negative.pct,
            sentimentNeutral: liveSentiment.neutral.pct,
          }} />
          <ExportCSV data={{
            reportDate,
            listeners: liveListeners,
            listenersPrior: bp.spotifyMonthlyListeners.prior,
            spotifyFollowers: liveFollowers,
            spotifyPopularity: livePopularity,
            totalStreams: bp.totalCrossPlatformStreams.current,
            spl: bp.spl.current,
            tracks: liveTrackStreams.map(t => ({ name: t.name, streams: t.spotifyStreams.current, prior: t.spotifyStreams.prior })),
            ytVideos: liveYTVideos.map(v => ({ name: v.name, views: v.views.current, prior: v.views.prior })),
            ytSubscribers: liveYTSubscribers,
            dailyStreams: dailyStreams,
            platforms: liveSocialMedia.platforms.map(p => ({ platform: p.platform, current: p.current, prior: p.prior })),
            snsFootprint: liveSocialMedia.totalFootprint.current,
            snsFootprintPrior: liveSocialMedia.totalFootprint.prior,
            members: members.map(m => ({ name: m.name, handle: m.handle, followers: m.followers })),
            geoCountries,
            geoCities,
            audienceStats,
            prMentions: livePR.totalMentions,
            prPerDay: livePR.perDay,
            uniqueAuthors: livePR.uniqueAuthors,
            sentimentPositive: liveSentiment.positive.pct,
            sentimentNegative: liveSentiment.negative.pct,
            sentimentNeutral: liveSentiment.neutral.pct,
            topHashtags: liveSentiment.topHashtags,
          }} />
          <QuickShare data={{
            reportDate,
            listeners: liveListeners,
            totalStreams: bp.totalCrossPlatformStreams.current,
            snsFootprint: liveSocialMedia.totalFootprint.current,
            ytSubscribers: liveYTSubscribers,
            prMentions: livePR.totalMentions,
            sentimentNet: liveSentiment.positive.pct - liveSentiment.negative.pct,
            selectedDate,
          }} />
          <a
            href="/guide"
            className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 sm:px-3 py-1.5 hover:bg-white/[0.08] transition-colors hidden sm:inline-flex items-center gap-1"
            title="Dashboard Guide"
          >
            <span className="text-[10px] text-white font-bold uppercase tracking-wider">📖<span className="hidden md:inline"> Guide</span></span>
          </a>
          <LiveBadge />
          <MetricAlerts metrics={(() => {
            const m: { label: string; current: number; prior: number | null; category: "streaming" | "social" | "youtube" | "media" | "audience" }[] = [];
            m.push({ label: "Spotify Monthly Listeners", current: liveListeners, prior: bp.spotifyMonthlyListeners.prior, category: "streaming" });
            m.push({ label: "Spotify Followers", current: liveFollowers, prior: bp.spotifyFollowers.prior, category: "streaming" });
            m.push({ label: "Spotify Popularity", current: livePopularity, prior: bp.spotifyPopularity.prior, category: "streaming" });
            liveTrackStreams.forEach(t => m.push({ label: `${t.name} Streams`, current: t.spotifyStreams.current, prior: t.spotifyStreams.prior, category: "streaming" }));
            m.push({ label: "Cross-Platform Streams", current: bp.totalCrossPlatformStreams.current, prior: bp.totalCrossPlatformStreams.prior, category: "streaming" });
            liveYTVideos.forEach(v => m.push({ label: `YT: ${v.name}`, current: v.views.current, prior: v.views.prior, category: "youtube" }));
            m.push({ label: "YouTube Subscribers", current: liveYTSubscribers, prior: null, category: "youtube" });
            m.push({ label: "SNS Footprint", current: liveSocialMedia.totalFootprint.current, prior: liveSocialMedia.totalFootprint.prior, category: "social" });
            if (liveSocialMedia.platforms) liveSocialMedia.platforms.forEach((p: any) => m.push({ label: `${p.platform} Followers`, current: p.current, prior: p.prior, category: "social" }));
            m.push({ label: "Audio Views (TikTok)", current: audioVirality.totalAudioViews.current, prior: audioVirality.totalAudioViews.prior, category: "social" });
            return m;
          })()} />
          <UserMenu />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* Section Nav */}
        <SectionNav trends={(() => {
          const t: Record<string, { positive: boolean; value: string } | null> = {};
          // Business Performance — listener growth
          if (bp.spotifyMonthlyListeners.prior) {
            const pct = ((liveListeners - bp.spotifyMonthlyListeners.prior) / bp.spotifyMonthlyListeners.prior * 100);
            t.business = { positive: pct >= 0, value: `${Math.abs(pct).toFixed(1)}%` };
          }
          // Social Media — SNS footprint
          if (liveSocialMedia.totalFootprint.prior) {
            const pct = ((liveSocialMedia.totalFootprint.current - liveSocialMedia.totalFootprint.prior) / liveSocialMedia.totalFootprint.prior * 100);
            t.social = { positive: pct >= 0, value: `${Math.abs(pct).toFixed(1)}%` };
          }
          // Audio Virality
          if (audioVirality.totalAudioViews.prior) {
            const pct = ((audioVirality.totalAudioViews.current - audioVirality.totalAudioViews.prior) / audioVirality.totalAudioViews.prior * 100);
            t.virality = { positive: pct >= 0, value: `${Math.abs(pct).toFixed(1)}%` };
          }
          // PR & Media — WoW or total mentions
          if (livePR.wow) {
            t.pr = { positive: livePR.wow.changePct >= 0, value: `${Math.abs(livePR.wow.changePct).toFixed(0)}% WoW` };
          }
          // Fan Sentiment — net sentiment
          const netSent = liveSentiment.positive.pct - liveSentiment.negative.pct;
          t.sentiment = { positive: netSent >= 0, value: `+${Math.abs(netSent).toFixed(0)} net` };
          // Charts — total cross-platform streams
          if (bp.totalCrossPlatformStreams.prior) {
            const pct = ((bp.totalCrossPlatformStreams.current - bp.totalCrossPlatformStreams.prior) / bp.totalCrossPlatformStreams.prior * 100);
            t.charts = { positive: pct >= 0, value: `${Math.abs(pct).toFixed(1)}%` };
          }
          // Members — total member followers
          if (totalMemberFollowers.prior) {
            const pct = ((totalMemberFollowers.current - totalMemberFollowers.prior) / totalMemberFollowers.prior * 100);
            t.members = { positive: pct >= 0, value: `${Math.abs(pct).toFixed(1)}%` };
          }
          return t;
        })()} />

        {/* Skeleton loading state when switching dates */}
        {dateLoading && <SkeletonLoader />}

        {/* Main dashboard content — hidden during date loading */}
        <div className={dateLoading ? "hidden" : "space-y-10"}>

        {/* Hero */}
        <section id="hero" tabIndex={-1} className="hero-bg rounded-3xl p-5 sm:p-8 md:p-10 scroll-mt-16"><span id="main-content" />
          {/* Report Date Banner */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-sm font-black text-white">{dayNumber(reportDate)}</div>
              <div>
                <p className="text-white font-bold text-sm">Daily Report — {reportDate}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-neutral-500">Compared vs prior report: {priorDate}</p>
                  {(() => {
                    try {
                      const cur = new Date(reportDate);
                      const pri = new Date(priorDate);
                      if (!isNaN(cur.getTime()) && !isNaN(pri.getTime())) {
                        const days = Math.round((cur.getTime() - pri.getTime()) / 86400000);
                        if (days > 0) return (
                          <span className="text-[9px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-2 py-0.5">
                            {days}d window
                          </span>
                        );
                      }
                    } catch {}
                    return null;
                  })()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
                <span className="text-[10px] text-emerald-400 font-semibold">DATA CURRENT</span>
              </div>
              <p className="text-[9px] text-neutral-600 mt-0.5">
                {(() => {
                  try {
                    const d = new Date(reportDate);
                    if (!isNaN(d.getTime())) {
                      const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
                      return `${dayName} report · Supabase-backed`;
                    }
                  } catch {}
                  return "Auto-updated via API pipeline";
                })()}
              </p>
            </div>
          </div>

          {/* Executive One-Liner TL;DR */}
          <ExecutiveOneLiner
            reportDate={reportDate}
            listeners={liveListeners}
            listenersPrior={bp.spotifyMonthlyListeners.prior}
            totalStreams={bp.totalCrossPlatformStreams.current}
            totalStreamsPrior={bp.totalCrossPlatformStreams.prior}
            snsFootprint={liveSocialMedia.totalFootprint.current}
            snsFootprintPrior={liveSocialMedia.totalFootprint.prior}
            ytSubscribers={liveYTSubscribers}
            mentionVolume={livePR.totalMentions}
            sentimentPositive={liveSentiment.positive.pct}
            sentimentNegative={liveSentiment.negative.pct}
            tracks={liveTrackStreams.map(t => ({ name: t.name, current: t.spotifyStreams.current, prior: t.spotifyStreams.prior }))}
            ytVideos={liveYTVideos.map(v => ({ name: v.name, current: v.views.current, prior: v.views.prior }))}
            dailyTopTrack={dailyStreams.length > 0 ? { name: dailyStreams[0].name, streams: dailyStreams[0].streams } : null}
          />

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="avatar-ring">
                <Image src="/sb-avatar.jpg" alt="Santos Bravos" width={120} height={120}
                  className="rounded-2xl shadow-2xl shadow-violet-500/20 block" />
              </div>
              {/* Compact Performance Score badge */}
              {(() => {
                // Compute composite score (same weights as PerformanceScore section)
                const listenerGrowth = bp.spotifyMonthlyListeners.prior
                  ? ((liveListeners - bp.spotifyMonthlyListeners.prior) / bp.spotifyMonthlyListeners.prior) * 100 : 0;
                const streamingScore = Math.min(100, Math.max(0, 50 + listenerGrowth * 8));
                const snsScore = Math.min(100, (liveSocialMedia.totalFootprint.current / 2000000) * 100);
                const trackGrowths = liveTrackStreams.filter(t => t.spotifyStreams.prior).map(t =>
                  ((t.spotifyStreams.current - t.spotifyStreams.prior!) / t.spotifyStreams.prior!) * 100);
                const avgTrackGrowth = trackGrowths.length > 0 ? trackGrowths.reduce((a, b) => a + b, 0) / trackGrowths.length : 0;
                const contentScore = Math.min(100, Math.max(0, 40 + avgTrackGrowth * 4));
                const mediaScore = Math.min(100, (livePR.perDay / 1000) * 100);
                const netSentiment = liveSentiment.positive.pct - liveSentiment.negative.pct;
                const sentimentScore = Math.min(100, Math.max(0, 50 + netSentiment));
                const milestoneTargets = [
                  { current: liveListeners, target: 500000 },
                  { current: liveTrackStreams[0]?.spotifyStreams.current ?? 0, target: 10000000 },
                  { current: liveSocialMedia.totalFootprint.current, target: 2000000 },
                  { current: liveYTSubscribers, target: 500000 },
                ];
                const milestoneScore = Math.round(milestoneTargets.reduce((s, m) => s + Math.min(100, (m.current / m.target) * 100), 0) / milestoneTargets.length);
                const weighted = Math.round(
                  streamingScore * 0.25 + snsScore * 0.20 + contentScore * 0.20 +
                  mediaScore * 0.15 + sentimentScore * 0.10 + milestoneScore * 0.10
                );
                return <HeroScoreBadge score={weighted} />;
              })()}
            </div>
            <div className="text-center md:text-left space-y-2 flex-1">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <svg viewBox="0 0 60 14" className="h-2.5 text-neutral-500" fill="currentColor">
                  <text x="0" y="12" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="13" letterSpacing="2">HYBE</text>
                </svg>
                <span className="text-[10px] text-neutral-500">LATIN AMERICA</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight sb-gradient sb-gradient-shimmer">SANTOS BRAVOS</h1>
              <p className="text-neutral-500 text-sm">{o.tagline}</p>
              <div className="flex gap-2 flex-wrap justify-center md:justify-start">
                {["🎤 Latin Pop", "👥 5 Members", "💿 3 Releases", "🌎 LATAM + US"].map(tag => (
                  <span key={tag} className="text-[10px] bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1 text-neutral-500">{tag}</span>
                ))}
              </div>
              {/* Contextual info pills — latest release age + nearest milestone */}
              <div className="flex gap-2 flex-wrap justify-center md:justify-start mt-1">
                {(() => {
                  const releases = RELEASES.slice().reverse().map(r => ({
                    name: r.trackName ? (r.trackName === "0% (Portuguese Version)" ? "0% (PT)" : r.trackName) : r.name.split(" ").pop()!,
                    date: new Date(r.date + "T12:00:00"),
                  }));
                  const now = new Date();
                  const latest = releases[0];
                  const daysSince = Math.floor((now.getTime() - latest.date.getTime()) / 86400000);
                  return (
                    <span className="text-[10px] bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 text-violet-400">
                      🎵 {latest.name} — {daysSince}d ago
                    </span>
                  );
                })()}
                {(() => {
                  const milestones = [
                    { label: "500K YT Subs", current: liveYTSubscribers, target: 500000 },
                    { label: "2M SNS", current: liveSocialMedia.totalFootprint.current, target: 2000000 },
                    { label: "500K Listeners", current: liveListeners, target: 500000 },
                    { label: "50M Streams", current: bp.totalCrossPlatformStreams.current, target: 50000000 },
                  ];
                  const nearest = milestones
                    .filter(m => m.current < m.target)
                    .sort((a, b) => (b.current / b.target) - (a.current / a.target))[0];
                  if (!nearest) return null;
                  const pct = ((nearest.current / nearest.target) * 100).toFixed(0);
                  return (
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 text-emerald-400">
                      🎯 {nearest.label} — {pct}%
                    </span>
                  );
                })()}
              </div>
              {/* Social platform quick links */}
              <div className="flex gap-1.5 flex-wrap justify-center md:justify-start mt-2">
                {[
                  { label: "Spotify", href: "https://open.spotify.com/artist/24Vjp1gvnNuNSWJOvFMZ6G", icon: "🟢", bg: "bg-[#1DB954]/10 border-[#1DB954]/20 text-[#1DB954] hover:bg-[#1DB954]/20" },
                  { label: "YouTube", href: "https://youtube.com/channel/UChKJaUFTKfw5O8JtQmF4Q6g", icon: "▶️", bg: "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" },
                  { label: "TikTok", href: "https://tiktok.com/@santos_bravos", icon: "🎵", bg: "bg-cyan-400/10 border-cyan-400/20 text-cyan-400 hover:bg-cyan-400/20" },
                  { label: "Instagram", href: "https://instagram.com/santos_bravos", icon: "📸", bg: "bg-pink-500/10 border-pink-500/20 text-pink-400 hover:bg-pink-500/20" },
                  { label: "Weverse", href: "https://weverse.io/santosbravos", icon: "💚", bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" },
                ].map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-[10px] font-medium border rounded-full px-2.5 py-1 transition-all inline-flex items-center gap-1 ${link.bg}`}
                  >
                    <span className="text-xs leading-none">{link.icon}</span>
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
              {/* Top Mover rotating badge */}
              {(() => {
                const candidates: Mover[] = [];
                if (bp.spotifyMonthlyListeners.prior) {
                  const pct = ((liveListeners - bp.spotifyMonthlyListeners.prior) / bp.spotifyMonthlyListeners.prior) * 100;
                  candidates.push({ label: "Spotify Listeners", pct, emoji: "🟢" });
                }
                liveTrackStreams.forEach(t => {
                  if (t.spotifyStreams.prior) {
                    const pct = ((t.spotifyStreams.current - t.spotifyStreams.prior) / t.spotifyStreams.prior) * 100;
                    candidates.push({ label: t.name, pct, emoji: "🎵" });
                  }
                });
                liveYTVideos.forEach(v => {
                  if (v.views.prior) {
                    const pct = ((v.views.current - v.views.prior) / v.views.prior) * 100;
                    candidates.push({ label: v.name.replace(/ (Performance Video|Official MV|Lyric Video|Debut Visualizer)/, ""), pct, emoji: "▶️" });
                  }
                });
                if (liveSocialMedia.totalFootprint.prior) {
                  const pct = ((liveSocialMedia.totalFootprint.current - liveSocialMedia.totalFootprint.prior) / liveSocialMedia.totalFootprint.prior) * 100;
                  candidates.push({ label: "SNS Footprint", pct, emoji: "📱" });
                }
                const topMovers = candidates.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct)).slice(0, 4);
                return topMovers.length > 0 ? (
                  <div className="flex justify-center md:justify-start mt-2">
                    <TopMoverBadge movers={topMovers} />
                  </div>
                ) : null;
              })()}
            </div>
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
              {[
                { label: "Listeners", value: liveListeners, prior: bp.spotifyMonthlyListeners.prior, color: "#1DB954", accent: "text-spotify", tooltip: "Monthly Listeners", target: 500000, targetLabel: "500K", sectionId: "business" },
                { label: "SNS", value: liveSocialMedia.totalFootprint.current, prior: liveSocialMedia.totalFootprint.prior, color: "#00F2EA", accent: "text-tiktok", tooltip: "SNS Footprint", target: 2000000, targetLabel: "2M", sectionId: "social" },
                { label: "Streams", value: bp.totalCrossPlatformStreams.current, prior: bp.totalCrossPlatformStreams.prior, color: "#FFFFFF", accent: "text-white", tooltip: "Cross-Platform Streams", target: 50000000, targetLabel: "50M", sectionId: "charts" },
                { label: "SPL", value: bp.spl.current, prior: bp.spl.prior ?? null, color: "#FBBF24", accent: "text-amber-400", isSpl: true, tooltip: "SPL", target: null, targetLabel: null, sectionId: "audience" },
              ].map(card => {
                const targetPct = card.target ? Math.min(100, (card.value / card.target) * 100) : null;
                // Compute daily velocity between prior and current report dates
                const daysBetween = (() => {
                  try {
                    const cur = new Date(reportDate);
                    const pri = new Date(priorDate);
                    if (isNaN(cur.getTime()) || isNaN(pri.getTime())) return 5;
                    return Math.max(1, Math.round((cur.getTime() - pri.getTime()) / 86400000));
                  } catch { return 5; }
                })();
                const dailyRate = card.prior != null && !card.isSpl
                  ? Math.round((card.value - card.prior) / daysBetween)
                  : null;
                return (
                <GlowCard
                  key={card.label}
                  className={`glass-hybe glass-hybe-card hero-card-enter rounded-xl p-3 text-center min-w-[120px] ${card.sectionId ? "cursor-pointer" : "cursor-default"}`}
                  glowColor={`${card.color}20`}
                  glowSize={200}
                  onClick={card.sectionId ? () => {
                    const el = document.getElementById(card.sectionId!);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  } : undefined}
                  title={card.sectionId ? `Jump to ${card.label} section` : undefined}
                >
                  <div className="absolute bottom-0 right-0 opacity-40 pointer-events-none">
                    <Sparkline
                      data={trendPoints(card.prior, card.isSpl ? card.value * 1000 : card.value)}
                      width={80}
                      height={28}
                      color={card.color}
                    />
                  </div>
                  <p className="text-[9px] text-neutral-500 uppercase tracking-wider relative z-10">
                    {card.tooltip ? <MetricTooltip term={card.tooltip}>{card.label}</MetricTooltip> : card.label}
                  </p>
                  <p className={`text-xl font-extrabold ${card.accent} relative z-10`}>
                    {card.isSpl
                      ? <CountUpValue value={card.value * 1000} formatFn={(n) => (n / 1000).toFixed(3)} />
                      : <CountUpValue value={card.value} />}
                  </p>
                  {card.prior != null && (
                    <div className="relative z-10 flex items-center justify-center gap-1.5">
                      <DodBadge current={card.value} prior={card.prior} />
                      {dailyRate !== null && dailyRate !== 0 && (
                        <span className="text-[9px] text-neutral-500 tabular-nums">
                          {dailyRate > 0 ? "+" : ""}{fmt(dailyRate)}/d
                        </span>
                      )}
                    </div>
                  )}
                  {targetPct !== null && (
                    <div className="relative z-10 mt-1.5">
                      <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-[1.5s] ease-out"
                          style={{ width: `${targetPct}%`, backgroundColor: card.color, opacity: 0.7 }}
                        />
                      </div>
                      <p className="text-[8px] text-neutral-600 mt-0.5">{targetPct.toFixed(0)}% → {card.targetLabel}</p>
                    </div>
                  )}
                </GlowCard>
                );
              })}
            </div>
          </div>
        </section>

        {/* Data Freshness Warning */}
        <DataFreshness reportDate={reportDate} />

        {/* Release Timeline */}
        <div id="release-timeline" className="scroll-mt-16" />
        <SectionErrorBoundary sectionName="Release Timeline">
        <AnimatedSection>
          <section className="glass-hybe rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-black text-white">📅</div>
              <div>
                <h2 className="text-sm font-bold text-white">Release Timeline</h2>
                <p className="text-[10px] text-neutral-500">Content rollout since debut</p>
              </div>
            </div>
            <ReleaseTimeline />
          </section>
        </AnimatedSection>
        </SectionErrorBoundary>

                {/* Insight Carousel — auto-cycling data insights */}
        <InsightCarousel
          listeners={liveListeners}
          listenersPrior={bp.spotifyMonthlyListeners.prior}
          tracks={liveTrackStreams.map(t => ({ name: t.name, streams: t.spotifyStreams.current, prior: t.spotifyStreams.prior }))}
          ytVideos={liveYTVideos.map(v => ({ name: v.name.replace(/ (Performance Video|Official MV|Lyric Video|Debut Visualizer)/, ""), views: v.views.current, prior: v.views.prior }))}
          snsFootprint={liveSocialMedia.totalFootprint.current}
          snsPrior={liveSocialMedia.totalFootprint.prior}
          topCountry={geoCountries[0] ? { name: geoCountries[0].name, flag: geoCountries[0].flag, pct: (geoCountries[0].listeners / geoCountries.reduce((s: number, c: any) => s + c.listeners, 0)) * 100 } : null}
          prMentions={livePR.totalMentions}
          prPerDay={livePR.perDay}
          netSentiment={liveSentiment.positive.pct - liveSentiment.negative.pct}
          topHashtag={liveSentiment.topHashtags?.[0]?.tag ?? null}
        />

        {/* Key Highlights - Executive Summary */}
        <div id="highlights" className="scroll-mt-16" />
        <SectionErrorBoundary sectionName="Key Highlights">
        <AnimatedSection>
          <KeyHighlights
            spotifyListeners={{ current: liveListeners, prior: bp.spotifyMonthlyListeners.prior }}
            tracks={liveTrackStreams.map(t => ({ name: t.name, current: t.spotifyStreams.current, prior: t.spotifyStreams.prior }))}
            ytVideos={liveYTVideos.map(v => ({ name: v.name, current: v.views.current, prior: v.views.prior }))}
            snsTotal={{ current: liveSocialMedia.totalFootprint.current, prior: liveSocialMedia.totalFootprint.prior }}
            totalStreams={{ current: bp.totalCrossPlatformStreams.current, prior: bp.totalCrossPlatformStreams.prior }}
            dailyTopTrack={dailyStreams.length > 0 ? { name: dailyStreams[0].name, streams: dailyStreams[0].streams } : null}
            mentionVolume={livePR.totalMentions}
            sentimentPositivePct={liveSentiment.positive.pct}
            topMarket={geoCountries[0]?.name || ""}
            reportDate={reportDate}
            priorDate={priorDate}
          />
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* Notable Changes */}
        <SectionErrorBoundary sectionName="Notable Changes">
        <AnimatedSection>
          <NotableChanges changes={[
            ...(bp.spotifyMonthlyListeners.prior ? [{ metric: "Spotify Listeners", current: liveListeners, prior: bp.spotifyMonthlyListeners.prior, pctChange: ((liveListeners - bp.spotifyMonthlyListeners.prior) / bp.spotifyMonthlyListeners.prior) * 100, category: "streaming" as const, sectionId: "business" }] : []),
            ...(bp.spotifyFollowers?.prior ? [{ metric: "Spotify Followers", current: liveFollowers, prior: bp.spotifyFollowers.prior, pctChange: ((liveFollowers - bp.spotifyFollowers.prior) / bp.spotifyFollowers.prior) * 100, category: "streaming" as const, sectionId: "business" }] : []),
            ...liveTrackStreams.filter(t => t.spotifyStreams.prior).map(t => ({ metric: `${t.name} Streams`, current: t.spotifyStreams.current, prior: t.spotifyStreams.prior!, pctChange: ((t.spotifyStreams.current - t.spotifyStreams.prior!) / t.spotifyStreams.prior!) * 100, category: "streaming" as const, sectionId: "charts" })),
            ...liveYTVideos.filter(v => v.views.prior).map(v => ({ metric: `${v.name.replace(/ (Performance Video|Official MV|Lyric Video|Debut Visualizer)/, "")} YT`, current: v.views.current, prior: v.views.prior!, pctChange: ((v.views.current - v.views.prior!) / v.views.prior!) * 100, category: "youtube" as const, sectionId: "business" })),
            ...liveSocialMedia.platforms.filter(p => p.prior).map(p => ({ metric: `${p.platform} Followers`, current: p.current, prior: p.prior!, pctChange: ((p.current - p.prior!) / p.prior!) * 100, category: "social" as const, sectionId: "social" })),
            ...(liveSocialMedia.totalFootprint.prior ? [{ metric: "Total SNS Footprint", current: liveSocialMedia.totalFootprint.current, prior: liveSocialMedia.totalFootprint.prior, pctChange: ((liveSocialMedia.totalFootprint.current - liveSocialMedia.totalFootprint.prior) / liveSocialMedia.totalFootprint.prior) * 100, category: "social" as const, sectionId: "social" }] : []),
            ...(audioVirality.totalAudioViews.prior ? [{ metric: "Audio Views", current: audioVirality.totalAudioViews.current, prior: audioVirality.totalAudioViews.prior, pctChange: ((audioVirality.totalAudioViews.current - audioVirality.totalAudioViews.prior) / audioVirality.totalAudioViews.prior) * 100, category: "virality" as const, sectionId: "virality" }] : []),
          ]} threshold={3} />
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* All Metrics Comparison Table */}
        <div id="comparison" className="scroll-mt-16" />
        <SectionErrorBoundary sectionName="Comparison Table">
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <CollapsibleSection id="comparison-table" number="📋" title="All Metrics at a Glance" subtitle="Sortable · Filterable" color="bg-gradient-to-br from-slate-500 to-zinc-500">
          <p className="text-[10px] text-neutral-500 mb-4">Every tracked metric in one table. Click column headers to sort. Filter by category.</p>
          <ComparisonTable rows={[
            ...(bp.spotifyMonthlyListeners.prior != null ? [{ metric: "Spotify Monthly Listeners", category: "spotify", current: liveListeners, prior: bp.spotifyMonthlyListeners.prior, change: liveListeners - bp.spotifyMonthlyListeners.prior, changePct: ((liveListeners - bp.spotifyMonthlyListeners.prior) / bp.spotifyMonthlyListeners.prior) * 100 }] : [{ metric: "Spotify Monthly Listeners", category: "spotify", current: liveListeners, prior: null, change: null, changePct: null }]),
            ...(bp.spotifyFollowers?.prior != null ? [{ metric: "Spotify Followers", category: "spotify", current: liveFollowers, prior: bp.spotifyFollowers.prior, change: liveFollowers - bp.spotifyFollowers.prior, changePct: ((liveFollowers - bp.spotifyFollowers.prior) / bp.spotifyFollowers.prior) * 100 }] : [{ metric: "Spotify Followers", category: "spotify", current: liveFollowers, prior: null, change: null, changePct: null }]),
            { metric: "Spotify Popularity", category: "spotify", current: livePopularity, prior: bp.spotifyPopularity.prior, change: bp.spotifyPopularity.prior != null ? livePopularity - bp.spotifyPopularity.prior : null, changePct: bp.spotifyPopularity.prior ? ((livePopularity - bp.spotifyPopularity.prior) / bp.spotifyPopularity.prior) * 100 : null },
            ...liveTrackStreams.map(t => ({ metric: `${t.name} — Spotify Streams`, category: "spotify", current: t.spotifyStreams.current, prior: t.spotifyStreams.prior, change: t.spotifyStreams.prior != null ? t.spotifyStreams.current - t.spotifyStreams.prior : null, changePct: t.spotifyStreams.prior ? ((t.spotifyStreams.current - t.spotifyStreams.prior) / t.spotifyStreams.prior) * 100 : null })),
            { metric: "Cross-Platform Streams", category: "spotify", current: bp.totalCrossPlatformStreams.current, prior: bp.totalCrossPlatformStreams.prior, change: bp.totalCrossPlatformStreams.prior != null ? bp.totalCrossPlatformStreams.current - bp.totalCrossPlatformStreams.prior : null, changePct: bp.totalCrossPlatformStreams.prior ? ((bp.totalCrossPlatformStreams.current - bp.totalCrossPlatformStreams.prior) / bp.totalCrossPlatformStreams.prior) * 100 : null },
            ...liveYTVideos.map(v => ({ metric: `${v.name.replace(/ (Performance Video|Official MV|Lyric Video|Debut Visualizer)/, "")} — YT Views`, category: "youtube", current: v.views.current, prior: v.views.prior, change: v.views.prior != null ? v.views.current - v.views.prior : null, changePct: v.views.prior ? ((v.views.current - v.views.prior) / v.views.prior) * 100 : null })),
            ...liveSocialMedia.platforms.map(p => ({ metric: `${p.platform} Followers`, category: "social", current: p.current, prior: p.prior, change: p.prior != null ? p.current - p.prior : null, changePct: p.prior ? ((p.current - p.prior) / p.prior) * 100 : null })),
            { metric: "Total SNS Footprint", category: "social", current: liveSocialMedia.totalFootprint.current, prior: liveSocialMedia.totalFootprint.prior, change: liveSocialMedia.totalFootprint.prior != null ? liveSocialMedia.totalFootprint.current - liveSocialMedia.totalFootprint.prior : null, changePct: liveSocialMedia.totalFootprint.prior ? ((liveSocialMedia.totalFootprint.current - liveSocialMedia.totalFootprint.prior) / liveSocialMedia.totalFootprint.prior) * 100 : null },
            { metric: "Total Audio Views", category: "virality", current: audioVirality.totalAudioViews.current, prior: audioVirality.totalAudioViews.prior, change: audioVirality.totalAudioViews.prior != null ? audioVirality.totalAudioViews.current - audioVirality.totalAudioViews.prior : null, changePct: audioVirality.totalAudioViews.prior ? ((audioVirality.totalAudioViews.current - audioVirality.totalAudioViews.prior) / audioVirality.totalAudioViews.prior) * 100 : null },
            ...audioVirality.tracks.map((t: any) => ({ metric: `${t.name} TT Creates`, category: "virality" as const, current: t.tiktokCreates ?? 0, prior: t.priorTiktokCreates ?? null, change: t.priorTiktokCreates != null ? (t.tiktokCreates ?? 0) - t.priorTiktokCreates : null, changePct: t.priorTiktokCreates ? (((t.tiktokCreates ?? 0) - t.priorTiktokCreates) / t.priorTiktokCreates) * 100 : null })),
            ...audioVirality.tracks.map((t: any) => ({ metric: `${t.name} IG Creates`, category: "virality" as const, current: t.igCreates ?? 0, prior: t.priorIgCreates ?? null, change: t.priorIgCreates != null ? (t.igCreates ?? 0) - t.priorIgCreates : null, changePct: t.priorIgCreates ? (((t.igCreates ?? 0) - t.priorIgCreates) / t.priorIgCreates) * 100 : null })),
            { metric: "Total Member IG Followers", category: "social", current: totalMemberFollowers.current, prior: totalMemberFollowers.prior, change: totalMemberFollowers.prior != null ? totalMemberFollowers.current - totalMemberFollowers.prior : null, changePct: totalMemberFollowers.prior ? ((totalMemberFollowers.current - totalMemberFollowers.prior) / totalMemberFollowers.prior) * 100 : null },
            { metric: "PR Mentions (7d)", category: "media", current: livePR.totalMentions, prior: null, change: null, changePct: livePR.wow?.changePct ?? null },
            { metric: "Unique PR Authors", category: "media", current: livePR.uniqueAuthors, prior: null, change: null, changePct: null },
          ]} />
          </CollapsibleSection>
        </section>
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* Analyst Note */}
        <SectionErrorBoundary sectionName="Analyst Note">
        <AnimatedSection>
          <AnalystNote
            reportDate={reportDate}
            spotifyListeners={{ current: liveListeners, prior: bp.spotifyMonthlyListeners.prior }}
            tracks={liveTrackStreams.map(t => ({ name: t.name, current: t.spotifyStreams.current, prior: t.spotifyStreams.prior }))}
            ytSubscribers={liveYTSubscribers}
            snsTotal={{ current: liveSocialMedia.totalFootprint.current, prior: liveSocialMedia.totalFootprint.prior }}
            totalStreams={{ current: bp.totalCrossPlatformStreams.current, prior: bp.totalCrossPlatformStreams.prior }}
            mentionVolume={livePR.totalMentions}
            sentimentPositive={liveSentiment.positive.pct}
            sentimentNegative={liveSentiment.negative.pct}
            topMarket={geoCountries[0]?.name || ""}
            dailyTopTrack={dailyStreams.length > 0 ? { name: dailyStreams[0].name, streams: dailyStreams[0].streams } : null}
          />
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* Weekly Wins */}
        <SectionErrorBoundary sectionName="Weekly Wins">
        <AnimatedSection>
          <WeeklyWins
            listeners={{ current: liveListeners, prior: bp.spotifyMonthlyListeners.prior }}
            followers={liveFollowers}
            tracks={liveTrackStreams.map(t => ({ name: t.name, current: t.spotifyStreams.current, prior: t.spotifyStreams.prior }))}
            ytViews={liveYTVideos.map(v => ({ name: v.name, current: v.views.current, prior: v.views.prior }))}
            ytSubscribers={liveYTSubscribers}
            snsFootprint={{ current: liveSocialMedia.totalFootprint.current, prior: liveSocialMedia.totalFootprint.prior }}
            totalStreams={bp.totalCrossPlatformStreams.current}
            mentions={livePR.totalMentions}
            sentiment={{ positive: liveSentiment.positive.pct, negative: liveSentiment.negative.pct }}
            audienceStats={{ streamsPerListener: audienceStats.streamsPerListener, saves: audienceStats.saves, streams: audienceStats.streams }}
          />
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* Recommended Actions */}
        <SectionErrorBoundary sectionName="Recommended Actions">
        <AnimatedSection>
          <ActionItems
            listeners={liveListeners}
            listenersPrior={bp.spotifyMonthlyListeners.prior}
            totalStreams={bp.totalCrossPlatformStreams.current}
            snsFootprint={liveSocialMedia.totalFootprint.current}
            snsFootprintPrior={liveSocialMedia.totalFootprint.prior}
            ytSubscribers={liveYTSubscribers}
            sentimentPositive={liveSentiment.positive.pct}
            sentimentNegative={liveSentiment.negative.pct}
            mentionVolume={livePR.totalMentions}
            tracks={liveTrackStreams.map(t => ({ name: t.name, current: t.spotifyStreams.current, prior: t.spotifyStreams.prior }))}
            ytVideos={liveYTVideos.map(v => ({ name: v.name, current: v.views.current, prior: v.views.prior }))}
            geoTop={geoCountries.slice(0, 5).map(c => ({ name: c.name, listeners: c.listeners }))}
            dailyTopTrack={dailyStreams.length > 0 ? { name: dailyStreams.sort((a, b) => b.streams - a.streams)[0].name, streams: dailyStreams.sort((a, b) => b.streams - a.streams)[0].streams } : null}
            spotifyFollowers={liveFollowers}
            spotifyPopularity={bp.spotifyPopularity?.current ?? 0}
          />
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* Risk Radar */}
        <SectionErrorBoundary sectionName="Risk Radar">
        <AnimatedSection>
          <RiskRadar
            listeners={{ current: liveListeners, prior: bp.spotifyMonthlyListeners.prior }}
            tracks={liveTrackStreams.map(t => ({ name: t.name, current: t.spotifyStreams.current, prior: t.spotifyStreams.prior }))}
            ytViews={liveYTVideos.map(v => ({ name: v.name, current: v.views.current, prior: v.views.prior }))}
            snsFootprint={{ current: liveSocialMedia.totalFootprint.current, prior: liveSocialMedia.totalFootprint.prior }}
            sentiment={{ positive: liveSentiment.positive.pct, negative: liveSentiment.negative.pct, neutral: liveSentiment.neutral.pct }}
            geoConcentration={(() => {
              const totalListeners = geoCountries.reduce((s, c) => s + c.listeners, 0) || 1;
              const sorted = [...geoCountries].sort((a, b) => b.listeners - a.listeners);
              return {
                top1Pct: (sorted[0]?.listeners || 0) / totalListeners * 100,
                top3Pct: sorted.slice(0, 3).reduce((s, c) => s + c.listeners, 0) / totalListeners * 100,
              };
            })()}
            mentions={livePR.wow ? { current: livePR.totalMentions, wowChangePct: livePR.wow.changePct } : undefined}
            dailyStreams={dailyStreams.map(t => ({ name: t.name, streams: t.streams, listeners: t.listeners }))}
          />
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* Performance Score */}
        <div id="score" className="scroll-mt-16" />
        <SectionErrorBoundary sectionName="Performance Score">
        <AnimatedSection>
          <PerformanceScore metrics={(() => {
            // Streaming growth (listener growth %)
            const listenerGrowth = bp.spotifyMonthlyListeners.prior
              ? ((liveListeners - bp.spotifyMonthlyListeners.prior) / bp.spotifyMonthlyListeners.prior) * 100
              : 0;
            const streamingScore = Math.min(100, Math.max(0, 50 + listenerGrowth * 8));

            // Social reach (SNS footprint vs 2M target)
            const snsScore = Math.min(100, (liveSocialMedia.totalFootprint.current / 2000000) * 100);

            // Content velocity (track growth avg)
            const trackGrowths = liveTrackStreams.filter(t => t.spotifyStreams.prior).map(t =>
              ((t.spotifyStreams.current - t.spotifyStreams.prior!) / t.spotifyStreams.prior!) * 100
            );
            const avgTrackGrowth = trackGrowths.length > 0 ? trackGrowths.reduce((a, b) => a + b, 0) / trackGrowths.length : 0;
            const contentScore = Math.min(100, Math.max(0, 40 + avgTrackGrowth * 4));

            // Media presence (mentions volume — 1000/day = 100 score)
            const mediaScore = Math.min(100, (livePR.perDay / 1000) * 100);

            // Sentiment health (net sentiment mapped: -100→0, 0→50, +100→100)
            const netSentiment = liveSentiment.positive.pct - liveSentiment.negative.pct;
            const sentimentScore = Math.min(100, Math.max(0, 50 + netSentiment));

            // Milestone progress (avg of all milestones)
            const milestoneTargets = [
              { current: liveListeners, target: 500000 },
              { current: liveTrackStreams[0]?.spotifyStreams.current ?? 0, target: 10000000 },
              { current: liveSocialMedia.totalFootprint.current, target: 2000000 },
              { current: liveYTSubscribers, target: 500000 },
            ];
            const milestoneScore = Math.round(milestoneTargets.reduce((s, m) => s + Math.min(100, (m.current / m.target) * 100), 0) / milestoneTargets.length);

            return [
              { label: "Streaming Growth", score: Math.round(streamingScore), weight: 25, color: "bg-emerald-500" },
              { label: "Social Reach", score: Math.round(snsScore), weight: 20, color: "bg-cyan-500" },
              { label: "Content Velocity", score: Math.round(contentScore), weight: 20, color: "bg-violet-500" },
              { label: "Media Presence", score: Math.round(mediaScore), weight: 15, color: "bg-pink-500" },
              { label: "Sentiment Health", score: Math.round(sentimentScore), weight: 10, color: "bg-amber-500" },
              { label: "Milestone Progress", score: milestoneScore, weight: 10, color: "bg-indigo-500" },
            ];
          })()} />
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* Milestones & Targets */}
        <div id="milestones" className="scroll-mt-16" />
        <SectionErrorBoundary sectionName="Milestones">
        <AnimatedSection>
          <MilestonesTracker milestones={[
            { label: "Spotify Monthly Listeners", current: liveListeners, target: 500000, prior: bp.spotifyMonthlyListeners.prior, priorDaysAgo: 5, icon: "🎧", color: "bg-gradient-to-r from-spotify to-emerald-400" },
            { label: "0% — 10M Streams", current: liveTrackStreams[0]?.spotifyStreams.current ?? 0, target: 10000000, prior: bp.tracks[0]?.spotifyStreams.prior, priorDaysAgo: 5, icon: "💿", color: "bg-gradient-to-r from-violet-500 to-purple-400" },
            { label: "KAWASAKI — 2M Streams", current: liveTrackStreams[2]?.spotifyStreams.current ?? 0, target: 2000000, prior: bp.tracks[2]?.spotifyStreams.prior, priorDaysAgo: 5, icon: "🏍️", color: "bg-gradient-to-r from-pink-500 to-rose-400" },
            { label: "SNS Footprint — 2M", current: liveSocialMedia.totalFootprint.current, target: 2000000, prior: liveSocialMedia.totalFootprint.prior, priorDaysAgo: 5, icon: "📱", color: "bg-gradient-to-r from-tiktok to-cyan-400" },
            { label: "YouTube Subscribers — 500K", current: liveYTSubscribers, target: 500000, prior: liveSocialMedia.platforms.find(p => p.platform === "YouTube")?.prior ?? null, priorDaysAgo: 5, icon: "▶️", color: "bg-gradient-to-r from-red-500 to-red-400" },
            { label: "Cross-Platform Streams — 50M", current: bp.totalCrossPlatformStreams.current, target: 50000000, prior: bp.totalCrossPlatformStreams.prior, priorDaysAgo: 5, icon: "🌎", color: "bg-gradient-to-r from-amber-500 to-orange-400" },
          ]} />
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* ── Divider: Executive Summary → Performance Data ── */}
        <SectionDivider label="Performance Data" variant="violet" />

        {/* Growth Velocity */}
        <div id="velocity" className="scroll-mt-16" />
        <SectionErrorBoundary sectionName="Growth Velocity">
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-5 sm:p-6">
          <CollapsibleSection id="velocity" number="📊" title="Growth Velocity" subtitle="Period-over-Period %" color="bg-gradient-to-br from-cyan-500 to-blue-500">
          <GrowthVelocity items={[
            ...(bp.spotifyMonthlyListeners.prior ? [{ label: "Spotify Listeners", category: "spotify" as const, pct: ((liveListeners - bp.spotifyMonthlyListeners.prior) / bp.spotifyMonthlyListeners.prior) * 100 }] : []),
            ...liveTrackStreams.filter(t => t.spotifyStreams.prior).map(t => ({
              label: `${t.name} Streams`,
              category: "spotify" as const,
              pct: ((t.spotifyStreams.current - t.spotifyStreams.prior!) / t.spotifyStreams.prior!) * 100,
            })),
            ...liveYTVideos.filter(v => v.views.prior).map(v => {
              const shortName = v.name.replace(/ (Performance Video|Official MV|Lyric Video|Debut Visualizer)/, "").trim();
              return {
                label: `${shortName} YT`,
                category: "youtube" as const,
                pct: ((v.views.current - v.views.prior!) / v.views.prior!) * 100,
              };
            }),
            ...liveSocialMedia.platforms.filter(p => p.prior).map(p => ({
              label: p.platform,
              category: "sns" as const,
              pct: ((p.current - p.prior!) / p.prior!) * 100,
            })),
            ...(liveSocialMedia.totalFootprint.prior ? [{ label: "Total SNS", category: "sns" as const, pct: ((liveSocialMedia.totalFootprint.current - liveSocialMedia.totalFootprint.prior) / liveSocialMedia.totalFootprint.prior) * 100 }] : []),
          ]} />
          </CollapsibleSection>
        </section>
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* Historical Trends — multi-date line chart from Supabase */}
        <div id="historical" className="scroll-mt-16" />
        <SectionErrorBoundary sectionName="Historical Trends">
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <CollapsibleSection id="historical-trends" number="📈" title="Historical Trends" subtitle="All Report Dates" color="bg-gradient-to-br from-emerald-500 to-cyan-400">
            <HistoricalTrends />
            <div className="mt-6 pt-5 border-t border-white/[0.05]">
              <TrackHistory />
            </div>
            <div className="mt-6 pt-5 border-t border-white/[0.05]">
              <YouTubeHistory />
            </div>
            <div className="mt-6 pt-5 border-t border-white/[0.05]">
              <SocialHistory />
            </div>
          </CollapsibleSection>
        </section>
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* Section 1: Business Performance */}
        <div id="business" className="scroll-mt-16 print-page-break" />
        <SectionErrorBoundary sectionName="Business Performance">
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <CollapsibleSection id="business" number="1" title="Business Performance Snapshot" subtitle="Spotify + YouTube" color="bg-spotify" trend={trendListeners} collapsedSummary={`${fmt(liveListeners)} listeners · ${fmt(liveFollowers)} followers · ${liveTrackStreams.length} tracks · ${fmt(bp.totalCrossPlatformStreams.current)} total streams · ${liveYTVideos.length} videos`}>
          <div className="mb-3 hidden sm:flex items-center gap-6 text-[9px] text-neutral-600 uppercase tracking-wider px-2 py-2 bg-white/[0.015] rounded-lg">
            <span className="flex-1">Metric</span>
            <span className="w-20 text-right font-bold text-violet-400">{shortDate(reportDate)}</span>
            <span className="w-16 text-right">{shortDate(priorDate)}</span>
            <span className="w-16 text-right">Change</span>
            <span className="w-16 text-right"><MetricTooltip term="DoD">DoD %</MetricTooltip></span>
          </div>
          <MetricRow label={bp.spotifyMonthlyListeners.label} current={liveListeners} prior={bp.spotifyMonthlyListeners.prior} accent="text-spotify" />
          <MetricRow label={bp.spotifyFollowers.label} current={liveFollowers} prior={bp.spotifyFollowers.prior} accent="text-spotify" />
          <MetricRow label="Spotify Popularity Index" current={livePopularity} prior={bp.spotifyPopularity.prior} tooltip="Spotify Popularity Index" />
          {liveTrackStreams.map(t => (
            <MetricRow key={t.name} label={`Spotify Total Streams: ${t.name}`} current={t.spotifyStreams.current} prior={t.spotifyStreams.prior} accent="text-spotify" />
          ))}
          <div className="my-3 border-t border-white/[0.05]" />
          <MetricRow label={bp.totalCrossPlatformStreams.label} current={bp.totalCrossPlatformStreams.current} prior={bp.totalCrossPlatformStreams.prior} tooltip="Cross-Platform Streams" />
          {liveYTVideos.map(v => (
            <MetricRow key={v.name} label={`YouTube Views: ${v.name}`} current={v.views.current} prior={v.views.prior} accent="text-ytred" />
          ))}

          {/* YouTube Engagement Breakdown */}
          {liveYTVideos.some(v => v.likes > 0 || v.comments > 0) && (
            <>
              <div className="my-3 border-t border-white/[0.05]" />
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium mb-3 px-2">YouTube Engagement</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                {liveYTVideos.map(v => {
                  const engRate = v.views.current > 0 ? ((v.likes + v.comments) / v.views.current * 100) : 0;
                  const shortName = v.name.replace("YouTube Views: ", "").replace(/ (Performance Video|Official MV|Lyric Video|Debut Visualizer)/, "").trim();
                  return (
                    <div key={`eng-${v.name}`} className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                      <p className="text-[10px] text-neutral-500 font-medium truncate mb-2">{shortName}</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-neutral-600">👍 Likes</span>
                          <span className="text-xs font-bold text-white tabular-nums">{fmt(v.likes)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-neutral-600">💬 Comments</span>
                          <span className="text-xs font-bold text-white tabular-nums">{fmt(v.comments)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                          <span className="text-[9px] text-neutral-600">Eng. Rate</span>
                          <span className={`text-xs font-extrabold tabular-nums ${engRate >= 5 ? "text-emerald-400" : engRate >= 3 ? "text-amber-400" : "text-neutral-400"}`}>
                            {engRate.toFixed(2)}%
                          </span>
                        </div>
                        {/* Engagement bar */}
                        <div className="w-full bg-white/[0.04] rounded-full h-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${engRate >= 5 ? "bg-emerald-500" : engRate >= 3 ? "bg-amber-500" : "bg-neutral-600"}`}
                            style={{ width: `${Math.min(engRate * 10, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Totals row */}
              <div className="flex items-center justify-between py-2 px-2 bg-white/[0.015] rounded-lg">
                <span className="text-[10px] text-neutral-500 font-medium">Total Engagement</span>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-neutral-400">👍 <span className="text-white font-bold">{fmt(liveYTVideos.reduce((s, v) => s + v.likes, 0))}</span></span>
                  <span className="text-[10px] text-neutral-400">💬 <span className="text-white font-bold">{fmt(liveYTVideos.reduce((s, v) => s + v.comments, 0))}</span></span>
                  <span className="text-[10px] text-neutral-400">📊 <span className="text-white font-bold">
                    {((liveYTVideos.reduce((s, v) => s + v.likes + v.comments, 0) / Math.max(liveYTVideos.reduce((s, v) => s + v.views.current, 0), 1) * 100)).toFixed(2)}%
                  </span> avg</span>
                </div>
              </div>
            </>
          )}

          <div className="my-3 border-t border-white/[0.05]" />
          <MetricRow label={bp.spl.label} current={bp.spl.current} prior={bp.spl.prior ?? null} accent="text-amber-400" />
          </CollapsibleSection>
        </section>
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* Stream Velocity & Projections */}
        <SectionErrorBoundary sectionName="Stream Projections">
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <CollapsibleSection id="stream-projections" number="🚀" title="Stream Velocity & Projections" subtitle="Run rates → milestones" color="bg-gradient-to-br from-emerald-500 to-cyan-500">
            <StreamProjections
              tracks={liveTrackStreams.map(t => ({
                name: t.name,
                currentStreams: t.spotifyStreams.current,
                priorStreams: t.spotifyStreams.prior,
                periodDays: 5,
              }))}
              dailyStreams={dailyStreams.map(d => ({ name: d.name, streams: d.streams }))}
            />
          </CollapsibleSection>
        </section>
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* Daily Streams (SFA) */}
        <div id="daily" className="scroll-mt-16" />
        <SectionErrorBoundary sectionName="Daily Snapshot">
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <CollapsibleSection id="daily-snapshot" number="⚡" title="Spotify for Artists — Daily Snapshot" subtitle={`${reportDate} (24h)`} color="bg-gradient-to-br from-spotify to-emerald-400" collapsedSummary={dailyStreams.length > 0 ? `${dailyStreams.map(t => `${t.name} ${fmt(t.streams)}`).join(' · ')} daily streams` : undefined}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dailyStreams.map(t => (
              <div key={t.name} className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                <p className="font-bold text-white text-sm mb-3">{t.name}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[9px] text-neutral-500 uppercase">Streams</p>
                    <p className="text-lg font-extrabold text-spotify">{fmt(t.streams)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-neutral-500 uppercase">Listeners</p>
                    <p className="text-lg font-extrabold text-white">{fmt(t.listeners)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-neutral-500 uppercase"><MetricTooltip term="Saves">Saves</MetricTooltip></p>
                    <p className="text-lg font-extrabold text-violet-400">{fmt(t.saves)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <EngagementDepth tracks={dailyStreams} />
          <DailyComparisonChart tracks={dailyStreams} />
          </CollapsibleSection>
        </section>
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* Charts */}
        <div id="charts" className="scroll-mt-16 print-page-break" />
        <SectionErrorBoundary sectionName="Streaming Charts">
        <AnimatedSection>
        <section className="space-y-4">
          <StreamingCharts
            spotifyTracks={bp.tracks.map(t => ({ name: t.name, streams: t.spotifyStreams.current }))}
            youtubeVideos={liveYTVideos.map(v => ({ name: v.name.split(":")[0].replace("YouTube Views", "").trim() || v.name, views: v.views.current }))}
            dailyStreams={dailyStreams.map(d => ({ name: d.name, streams: d.streams }))}
          />
          <section className="glass-hybe rounded-2xl p-6">
            <SpotifyEmbed />
          </section>
          <ContentEfficiency
            tracks={liveTrackStreams.map(t => ({ name: t.name, streams: t.spotifyStreams.current }))}
            reportDate={reportDate}
          />
          <PlatformDistribution
            spotifyStreams={liveTrackStreams.reduce((s, t) => s + t.spotifyStreams.current, 0)}
            youtubeViews={liveYTVideos.reduce((s, v) => s + v.views.current, 0)}
            tiktokAudioViews={audioVirality.totalAudioViews.current}
          />
          <section className="glass-hybe rounded-2xl p-6">
            <CollapsibleSection id="revenue-estimate" number="💰" title="Estimated Revenue" subtitle="Industry avg rates" color="bg-gradient-to-br from-emerald-500 to-teal-500">
              <p className="text-[10px] text-neutral-500 mb-4">Revenue projections based on cumulative streams across all platforms using industry-average per-stream payout rates.</p>
              <RevenueEstimate
                spotifyStreams={liveTrackStreams.reduce((s, t) => s + t.spotifyStreams.current, 0)}
                youtubeViews={liveYTVideos.reduce((s, v) => s + v.views.current, 0)}
                tiktokAudioViews={audioVirality.totalAudioViews.current}
                spotifyStreamsPrior={liveTrackStreams.reduce((s, t) => s + (t.spotifyStreams.prior ?? 0), 0) || null}
                youtubeViewsPrior={liveYTVideos.reduce((s, v) => s + (v.views.prior ?? 0), 0) || null}
                tiktokAudioViewsPrior={audioVirality.totalAudioViews.prior}
              />
            </CollapsibleSection>
          </section>
          <section className="glass-hybe rounded-2xl p-6">
            <CollapsibleSection id="release-pacing" number="🏁" title="Release Pacing Comparison" subtitle="Streams from Day 0" color="bg-gradient-to-br from-amber-500 to-pink-500">
              <p className="text-[10px] text-neutral-500 mb-4">How fast each track accumulated Spotify streams since its release date. Steeper curves = faster growth.</p>
              <ReleasePacing
                tracks={[
                  { name: "0%", releaseDate: getTrackReleaseDate("0%") || "2026-01-31", currentStreams: liveTrackStreams[0]?.spotifyStreams.current ?? 0, dailyRate: dailyStreams[0]?.streams ?? 0 },
                  { name: "0% (Portuguese Version)", releaseDate: getTrackReleaseDate("0% (Portuguese Version)") || "2026-02-03", currentStreams: liveTrackStreams[1]?.spotifyStreams.current ?? 0, dailyRate: dailyStreams[2]?.streams ?? 0 },
                  { name: "KAWASAKI", releaseDate: getTrackReleaseDate("KAWASAKI") || "2026-02-07", currentStreams: liveTrackStreams[2]?.spotifyStreams.current ?? 0, dailyRate: dailyStreams[1]?.streams ?? 0 },
                ]}
                reportDate={reportDate}
              />
            </CollapsibleSection>
          </section>
        </section>
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* Section 2: Social Media */}
        <div id="social" className="scroll-mt-16 print-page-break" />
        <SectionErrorBoundary sectionName="Social Media">
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <CollapsibleSection id="social-media" number="2" title="Social Media Performance" subtitle={`SNS · ${sectionDate(reportDate)}`} color="bg-gradient-to-br from-tiktok to-cyan-300" trend={trendSNS} collapsedSummary={`${fmt(liveSocialMedia.totalFootprint.current)} total · ${liveSocialMedia.platforms.map(p => `${p.platform} ${fmt(p.current)}`).join(' · ')}`}>
          <SocialMediaCards
            platforms={liveSocialMedia.platforms}
            totalFootprint={liveSocialMedia.totalFootprint}
          />
          <div className="mt-4">
            <SocialChart data={liveSocialMedia.platforms.map(p => ({ platform: p.platform, followers: p.current, color: p.color }))} />
          </div>
          </CollapsibleSection>
        </section>
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* Section 3: Audio Virality */}
        <div id="virality" className="scroll-mt-16" />
        <SectionErrorBoundary sectionName="Audio Virality">
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <CollapsibleSection id="audio-virality" number="3" title="Audio Virality" subtitle={`Cobrand · TT + IG · ${sectionDate(reportDate)}`} color="bg-gradient-to-br from-purple-500 to-pink-500" collapsedSummary={`${fmt(audioVirality.totalAudioViews.current)} audio views · ${audioVirality.tracks.length} tracks · ${fmt(audioVirality.tracks.reduce((s, t) => s + (t.tiktokCreates ?? 0), 0))} TT creates`}>
          <MetricRow label={audioVirality.totalAudioViews.label} current={audioVirality.totalAudioViews.current} prior={audioVirality.totalAudioViews.prior} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {audioVirality.tracks.map((t: any) => {
              const viewsChange = t.priorViews != null && t.priorViews > 0 ? ((t.views - t.priorViews) / t.priorViews * 100) : null;
              const ttChange = t.priorTiktokCreates != null && t.priorTiktokCreates > 0 ? (((t.tiktokCreates ?? 0) - t.priorTiktokCreates) / t.priorTiktokCreates * 100) : null;
              const igChange = t.priorIgCreates != null && t.priorIgCreates > 0 ? (((t.igCreates ?? 0) - t.priorIgCreates) / t.priorIgCreates * 100) : null;
              const changeBadge = (pct: number | null) => pct != null ? (
                <span className={`text-[9px] font-semibold px-1 py-0.5 rounded ml-1 ${pct >= 0 ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
                  {pct >= 0 ? "↑" : "↓"}{Math.abs(pct).toFixed(1)}%
                </span>
              ) : null;
              return (
              <div key={t.name} className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                <p className="font-bold text-white text-sm mb-2">{t.name}</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-neutral-500">Audio Views</span>
                    <span className="flex items-center"><span className="text-sm font-bold text-white">{fmt(t.views)}</span>{changeBadge(viewsChange)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-neutral-500"><MetricTooltip term="TikTok Creates">TikTok Creates</MetricTooltip></span>
                    <span className="flex items-center"><span className="text-sm font-bold text-tiktok">{t.tiktokCreates?.toLocaleString() ?? "—"}</span>{changeBadge(ttChange)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-neutral-500"><MetricTooltip term="IG Creates">IG Creates</MetricTooltip></span>
                    <span className="flex items-center"><span className="text-sm font-bold text-pink-400">{t.igCreates?.toLocaleString() ?? "—"}</span>{changeBadge(igChange)}</span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
          <div className="mt-5">
            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium mb-2">Platform Creates Comparison</p>
            <ViralityChart tracks={audioVirality.tracks} />
          </div>
          <div className="mt-5">
            <ViralityRatio tracks={audioVirality.tracks.map((t, i) => ({
              name: t.name,
              tiktokCreates: t.tiktokCreates ?? 0,
              igCreates: t.igCreates ?? 0,
              spotifyStreams: liveTrackStreams[i]?.spotifyStreams.current ?? 0,
            }))} />
          </div>
          </CollapsibleSection>
        </section>
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* Track Performance Radar */}
        <div id="track-radar" className="scroll-mt-16" />
        <SectionErrorBoundary sectionName="Track Comparison">
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <CollapsibleSection id="track-comparison" number="🎯" title="Track Performance Comparison" subtitle="Cross-Dimensional Radar" color="bg-gradient-to-br from-emerald-500 to-cyan-500">
          <p className="text-[10px] text-neutral-500 mb-4">Each dimension normalized to 100% of the top performer — showing relative strengths across streams, virality, and engagement.</p>
          <TrackRadar tracks={[
            { name: "0%", spotifyStreams: liveTrackStreams[0].spotifyStreams.current, dailyStreams: dailyStreams[0]?.streams ?? 0, tiktokCreates: audioVirality.tracks[0]?.tiktokCreates ?? 0, igCreates: audioVirality.tracks[0]?.igCreates ?? 0, saves: dailyStreams[0]?.saves ?? 0 },
            { name: "0% (PT)", spotifyStreams: liveTrackStreams[1].spotifyStreams.current, dailyStreams: dailyStreams[2]?.streams ?? 0, tiktokCreates: audioVirality.tracks[1]?.tiktokCreates ?? 0, igCreates: audioVirality.tracks[1]?.igCreates ?? 0, saves: dailyStreams[2]?.saves ?? 0 },
            { name: "KAWASAKI", spotifyStreams: liveTrackStreams[2].spotifyStreams.current, dailyStreams: dailyStreams[1]?.streams ?? 0, tiktokCreates: audioVirality.tracks[2]?.tiktokCreates ?? 0, igCreates: audioVirality.tracks[2]?.igCreates ?? 0, saves: dailyStreams[1]?.saves ?? 0 },
          ]} />
          </CollapsibleSection>
        </section>
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* ── Divider: Streaming → Artist & Community ── */}
        <SectionDivider label="Artist & Community" variant="cyan" />

        {/* Section 4: Band Member Followers */}
        <div id="members" className="scroll-mt-16 print-page-break" />
        <SectionErrorBoundary sectionName="Band Members">
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <CollapsibleSection id="band-members" number="4" title="Band Member Followers" subtitle={`Instagram · ${sectionDate(reportDate)}`} color="bg-gradient-to-br from-pink-500 to-rose-400" collapsedSummary={`${fmt(totalMemberFollowers.current)} total · ${members[0]?.name} ${fmt(members[0]?.followers)} · ${members.length} members`}>
          <StaggerChildren className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {members.map((m, i) => {
              const gradients = ["from-violet-600 to-blue-500", "from-cyan-500 to-blue-400", "from-pink-500 to-rose-400", "from-amber-500 to-orange-400", "from-emerald-500 to-teal-400"];
              const barColors = ["bg-violet-500", "bg-cyan-500", "bg-pink-500", "bg-amber-500", "bg-emerald-500"];
              const sharePct = totalMemberFollowers.current > 0 ? (m.followers / totalMemberFollowers.current) * 100 : 0;
              const igUrl = `https://instagram.com/${m.handle.replace("@", "")}/`;
              return (
                <StaggerItem key={m.handle}>
                  <GlowCard className="rounded-xl" glowColor={`${["#8B5CF620", "#06B6D420", "#EC489920", "#F59E0B20", "#10B98120"][i]}`} glowSize={180}>
                  <a
                    href={igUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white/[0.02] rounded-xl p-4 text-center border border-white/[0.04] hover:border-pink-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/5 transition-all group"
                  >
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      {/* SVG progress ring showing follower share */}
                      <svg className="absolute inset-0 w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />
                        <circle
                          cx="32" cy="32" r="28" fill="none"
                          stroke={["#8B5CF6","#06B6D4","#EC4899","#F59E0B","#10B981"][i]}
                          strokeWidth="3" strokeLinecap="round"
                          strokeDasharray={`${sharePct * 1.76} ${176 - sharePct * 1.76}`}
                          className="transition-all duration-1000"
                          style={{ filter: `drop-shadow(0 0 4px ${["#8B5CF680","#06B6D480","#EC489980","#F59E0B80","#10B98180"][i]})` }}
                        />
                      </svg>
                      <div className={`absolute inset-[6px] rounded-lg bg-gradient-to-br ${gradients[i]} flex items-center justify-center text-sm font-bold text-white group-hover:scale-105 transition-transform`}>
                        {m.country}
                      </div>
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center text-[9px] font-black text-neutral-500 z-10">#{i + 1}</span>
                    </div>
                    <p className="font-bold text-xs text-white group-hover:text-pink-300 transition-colors">{m.name}</p>
                    <p className="text-[9px] text-neutral-600 group-hover:text-neutral-400 transition-colors">{m.handle}</p>
                    <p className="text-base font-extrabold text-pink-400 mt-1">{fmt(m.followers)}</p>
                    {(m as any).priorFollowers != null && (m as any).priorFollowers > 0 && (() => {
                      const prior = (m as any).priorFollowers;
                      const change = m.followers - prior;
                      const pct = ((change / prior) * 100).toFixed(1);
                      if (change === 0) return null;
                      return (
                        <p className={`text-[9px] font-semibold mt-0.5 ${change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {change > 0 ? '↑' : '↓'} {pct}% ({change > 0 ? '+' : ''}{fmt(change)})
                        </p>
                      );
                    })()}
                    <div className="mt-2">
                      <div className="w-full bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full ${barColors[i]} rounded-full transition-all duration-1000`} style={{ width: `${sharePct}%` }} />
                      </div>
                      <p className="text-[9px] text-neutral-600 mt-1">{sharePct.toFixed(1)}% of total</p>
                    </div>
                  </a>
                  </GlowCard>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
          <div className="flex items-center justify-between py-3 px-2 bg-white/[0.02] rounded-lg border border-white/[0.04]">
            <span className="text-sm font-semibold text-neutral-400">Total Band Member Followers</span>
            <span className="text-xl font-extrabold text-white">{fmt(totalMemberFollowers.current)}</span>
          </div>
          <MemberBuzz
            members={members.map(m => ({ name: m.name, followers: m.followers }))}
            mentions={(liveSentiment.topEntities || []).filter((e: any) => e.type === "person")}
          />
          </CollapsibleSection>
        </section>
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* Section 5: Geo Signals */}
        <div id="geo" className="scroll-mt-16 print-page-break" />
        <SectionErrorBoundary sectionName="Geo Signals">
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <CollapsibleSection id="geo-signals" number="5" title="Geo Signals" subtitle={`Spotify · 28-Day Window · ${sectionDate(reportDate)}`} color="bg-gradient-to-br from-blue-500 to-indigo-400" collapsedSummary={`${geoCountries.length}+ countries · #1 ${geoCountries[0]?.flag} ${geoCountries[0]?.name} (${fmt(geoCountries[0]?.listeners)}) · ${geoCities.length} top cities`}>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04] text-center">
              <p className="text-[9px] text-neutral-500 uppercase tracking-wider">Countries</p>
              <p className="text-xl font-extrabold text-cyan-400 mt-1">{geoCountries.length}+</p>
            </div>
            <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04] text-center">
              <p className="text-[9px] text-neutral-500 uppercase tracking-wider">Top Market</p>
              <p className="text-xl font-extrabold text-white mt-1">{geoCountries[0]?.flag} {geoCountries[0]?.name}</p>
            </div>
            <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04] text-center">
              <p className="text-[9px] text-neutral-500 uppercase tracking-wider">Top 10 Listeners</p>
              <p className="text-xl font-extrabold text-blue-400 mt-1">{fmt(geoCountries.reduce((s, c) => s + c.listeners, 0))}</p>
            </div>
          </div>
          {/* Reach Diversity Index + Regional Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-1">
              <ReachDiversity data={geoCountries} />
            </div>
            <div className="lg:col-span-2">
              <RegionalBreakdown data={geoCountries} />
            </div>
          </div>
          {/* Market Penetration Index */}
          <div className="mb-6">
            <MarketPenetration countries={geoCountries} />
          </div>
          {/* Geographic Treemap */}
          <div className="mb-6">
            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium mb-3">Listener Distribution by Country</p>
            <GeoTreemap data={geoCountries} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">Top Countries</p>
              <GeoProgressBarsLazy data={geoCountries} color="#6366F1" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">Top Cities</p>
              <GeoChart data={geoCities.map(c => ({ name: c.name, listeners: c.listeners }))} color="#06B6D4" />
            </div>
          </div>
          </CollapsibleSection>
        </section>
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* Audience Deep Dive */}
        <div id="audience" className="scroll-mt-16" />
        <SectionErrorBoundary sectionName="Audience">
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <CollapsibleSection id="audience-dive" number="📊" title="Audience Deep Dive" subtitle={`Spotify for Artists · ${audienceStats.period}`} color="bg-gradient-to-br from-amber-500 to-orange-400" collapsedSummary={`${fmt(audienceStats.listeners)} listeners · ${fmt(audienceStats.streams)} streams · ${audienceStats.streamsPerListener.toFixed(1)} SPL · ${fmt(audienceStats.saves)} saves`}>
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Listeners", value: audienceStats.listeners, accent: "" },
              { label: "Streams", value: audienceStats.streams, accent: "" },
              { label: "Streams / Listener", value: audienceStats.streamsPerListener, accent: "text-amber-400", isSpl: true },
              { label: "Saves", value: audienceStats.saves, accent: "text-violet-400" },
              { label: "Playlist Adds", value: audienceStats.playlistAdds, accent: "text-cyan-400" },
              { label: "Followers", value: audienceStats.followers, accent: "text-spotify" },
            ].map(s => (
              <div key={s.label} className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04] text-center">
                <p className="text-[9px] text-neutral-500 uppercase tracking-wider">{s.label}</p>
                <p className={`text-lg font-extrabold mt-1 ${s.accent || "text-white"}`}>
                  {s.isSpl ? (s.value as number).toFixed(2) : fmt(s.value as number)}
                </p>
              </div>
            ))}
          </div>
          <AudienceFunnel
            listeners={audienceStats.listeners}
            streams={audienceStats.streams}
            saves={audienceStats.saves}
            playlistAdds={audienceStats.playlistAdds}
            followers={audienceStats.followers}
          />
          <AudienceHealth
            listeners={audienceStats.listeners}
            streams={audienceStats.streams}
            saves={audienceStats.saves}
            playlistAdds={audienceStats.playlistAdds}
            followers={audienceStats.followers}
            streamsPerListener={audienceStats.streamsPerListener}
          />
          </CollapsibleSection>
        </section>
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* ── Divider: Community → Media Intelligence ── */}
        <SectionDivider label="Media Intelligence" variant="emerald" />

        {/* Section 6: PR & Media */}
        <div id="pr" className="scroll-mt-16 print-page-break" />
        <SectionErrorBoundary sectionName="PR & Media">
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <CollapsibleSection id="pr-media" number="6" title="PR & Media Exposure" subtitle={`Meltwater · ${livePR.period}`} color="bg-gradient-to-br from-violet-500 to-indigo-400" trend={livePR.wow ? { value: `${Math.abs(livePR.wow.changePct)}% WoW`, positive: livePR.wow.changePct >= 0 } : null} collapsedSummary={`${fmt(livePR.totalMentions)} mentions · ${fmt(livePR.perDay)}/day · ${fmt(livePR.uniqueAuthors)} authors · ${livePR.topSources?.[0]?.name ?? ''} leads`}>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Total Mentions", value: livePR.totalMentions, accent: "text-violet-400" },
              { label: "Avg / Day", value: livePR.perDay, accent: "text-white" },
              { label: "Unique Authors", value: livePR.uniqueAuthors, accent: "text-cyan-400", tooltip: "Unique Authors" },
            ].map(s => (
              <div key={s.label} className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04] text-center">
                <p className="text-[9px] text-neutral-500 uppercase tracking-wider">
                  {s.tooltip ? <MetricTooltip term={s.tooltip}>{s.label}</MetricTooltip> : s.label}
                </p>
                <p className={`text-xl font-extrabold mt-1 ${s.accent}`}><CountUpValue value={s.value} /></p>
              </div>
            ))}
          </div>
          {/* Share of Voice vs HYBE Latin America */}
          <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04] mb-5">
            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium mb-3">📊 Share of Voice — Santos Bravos vs HYBE Latin America</p>
            <ShareOfVoice />
          </div>
          <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium mb-2">Daily Mention Volume</p>
          <MentionsChart data={livePR.timeSeries} />
          {/* Momentum + WoW row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <MentionMomentum timeSeries={livePR.timeSeries} totalMentions={livePR.totalMentions} />
            {livePR.wow && <div><WowComparison data={livePR.wow} /></div>}
          </div>
          {/* Conversation Topics */}
          {((livePR as any).topTopics || []).length > 0 && (
            <div className="mt-5">
              <TopTopics topics={(livePR as any).topTopics || []} />
            </div>
          )}
          {/* Weekday Heatmap */}
          {livePR.timeSeries && livePR.timeSeries.length >= 3 && (
            <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04] mt-5">
              <WeekdayHeatmap timeSeries={livePR.timeSeries} />
            </div>
          )}
          {/* Row 1: Source Donut + Countries + Sources (3 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
            {/* Source Distribution Donut */}
            <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium mb-3">Source Distribution</p>
              <SourceDonut sources={livePR.topSources} />
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
                {livePR.topSources.slice(0, 5).map((s: any) => {
                  const colors: Record<string, string> = {
                    "X (Twitter)": "bg-[#1DA1F2]", "Twitter": "bg-[#1DA1F2]", "Instagram": "bg-[#E1306C]",
                    "TikTok": "bg-[#00F2EA]", "YouTube": "bg-[#FF0000]", "Reddit": "bg-[#FF4500]",
                    "News Sites": "bg-violet-400", "Blogs": "bg-amber-400", "Facebook": "bg-[#1877F2]",
                  };
                  const totalCount = livePR.topSources.reduce((a: number, b: any) => a + b.count, 0);
                  return (
                    <div key={s.name} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${colors[s.name] || "bg-indigo-400"}`} />
                      <span className="text-[9px] text-neutral-500">{s.name} {totalCount > 0 ? ((s.count / totalCount) * 100).toFixed(0) : 0}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Top Countries */}
            <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">🌍 Top Countries by Mentions</p>
              <div className="space-y-2.5">
                {livePR.topCountries.map((c: any, i: number) => {
                  const maxMentions = livePR.topCountries[0]?.mentions || 1;
                  return (
                    <div key={c.code}>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] text-neutral-600 w-4 text-right font-bold">{i + 1}</span>
                        <span className="text-sm">{c.flag}</span>
                        <span className="text-sm text-neutral-300 flex-1">{c.name}</span>
                        <span className="text-sm font-bold tabular-nums text-white">{c.mentions?.toLocaleString() ?? "—"}</span>
                      </div>
                      <div className="ml-[44px] w-auto bg-white/[0.04] rounded-full h-1 overflow-hidden">
                        <div className="bg-indigo-500/70 h-full rounded-full transition-all duration-700" style={{ width: `${(c.mentions / maxMentions) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Top Sources (bars) */}
            <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">📰 Top Sources</p>
              <div className="space-y-2.5">
                {livePR.topSources.slice(0, 8).map((s: any) => {
                  const icons: Record<string, string> = { social: "🌐", news: "📰", blog: "✍️", other: "📄" };
                  return (
                    <div key={s.name}>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm">{icons[s.type] || "📄"}</span>
                        <span className="text-sm text-neutral-300 flex-1 truncate">{s.name}</span>
                        <span className="text-[10px] font-bold tabular-nums text-neutral-400">{s.count?.toLocaleString() ?? "—"}</span>
                      </div>
                      <div className="ml-[32px] w-auto bg-white/[0.04] rounded-full h-1 overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full transition-all duration-700" style={{ width: `${(s.count / (livePR.topSources[0]?.count || 1)) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Row 2: Cities + Languages + Keyphrases + Influencers + Media vs Audience (5 cols on xl, 2 on md) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mt-4">
            {/* Top Cities by Mentions */}
            {((livePR as any).topCities || []).length > 0 && (
              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">🏙️ Top Cities by Mentions</p>
                <div className="space-y-2.5">
                  {((livePR as any).topCities || []).slice(0, 8).map((c: any, i: number) => {
                    const maxCount = ((livePR as any).topCities || [])[0]?.count || 1;
                    return (
                      <div key={c.city}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] text-neutral-600 w-4 text-right font-bold">{i + 1}</span>
                          <span className="text-xs">{c.flag}</span>
                          <span className="text-sm text-neutral-300 flex-1 truncate">{c.city}</span>
                          <span className="text-[10px] font-bold tabular-nums text-rose-400">{c.count?.toLocaleString() ?? "—"}</span>
                        </div>
                        <div className="ml-[36px] w-auto bg-white/[0.04] rounded-full h-1 overflow-hidden">
                          <div className="bg-rose-500/70 h-full rounded-full transition-all duration-700" style={{ width: `${(c.count / maxCount) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Top Languages */}
            {((livePR as any).topLanguages || []).length > 0 && (
              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">🗣️ Top Languages</p>
                <div className="space-y-2.5">
                  {((livePR as any).topLanguages || []).slice(0, 7).map((l: any, i: number) => {
                    const maxCount = ((livePR as any).topLanguages || [])[0]?.count || 1;
                    return (
                      <div key={l.code}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs">{l.flag}</span>
                          <span className="text-sm text-neutral-300 flex-1">{l.name}</span>
                          <span className="text-[10px] text-neutral-500 tabular-nums">{l.pct}%</span>
                          <span className="text-[10px] font-bold tabular-nums text-amber-400">{l.count?.toLocaleString() ?? "—"}</span>
                        </div>
                        <div className="ml-[28px] w-auto bg-white/[0.04] rounded-full h-1 overflow-hidden">
                          <div className="bg-amber-500/70 h-full rounded-full transition-all duration-700" style={{ width: `${(l.count / maxCount) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Trending Keyphrases */}
            <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">🔥 Trending Keyphrases</p>
              <div className="space-y-2.5">
                {livePR.topKeyphrases.slice(0, 8).map((k: any) => (
                  <div key={k.phrase}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm text-neutral-300 flex-1 truncate">{k.phrase}</span>
                      <span className="text-[10px] font-bold tabular-nums text-violet-400">{k.count}</span>
                    </div>
                    <div className="w-full bg-white/[0.04] rounded-full h-1 overflow-hidden">
                      <div className="bg-violet-500 h-full rounded-full transition-all duration-700" style={{ width: `${(k.count / (livePR.topKeyphrases[0]?.count || 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Top Mentions / Influencers */}
            <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
              <TopInfluencers mentions={livePR.topMentions || []} />
            </div>
            {/* Media vs Audience Geography */}
            <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
              <MediaVsAudience mediaCountries={livePR.topCountries} listenerCountries={geoCountries.map(c => ({ country: (c as any).name || (c as any).country, listeners: c.listeners, flag: c.flag }))} />
            </div>
          </div>
          </CollapsibleSection>
        </section>
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* Section 7: Fan Sentiment */}
        <div id="sentiment" className="scroll-mt-16 print-page-break" />
        <SectionErrorBoundary sectionName="Fan Sentiment">
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <CollapsibleSection id="fan-sentiment" number="7" title="Fan Sentiment & Conversation" subtitle={`Meltwater · ${liveSentiment.period}`} color="bg-gradient-to-br from-rose-500 to-pink-400" trend={trendSentiment} collapsedSummary={`${liveSentiment.positive.pct}% positive · ${liveSentiment.neutral.pct}% neutral · ${liveSentiment.negative.pct}% negative · Net +${(liveSentiment.positive.pct - liveSentiment.negative.pct).toFixed(0)}`}>

          {/* Sentiment summary cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Positive", count: liveSentiment.positive.count, pct: liveSentiment.positive.pct, color: "text-emerald-400", bg: "bg-emerald-500", barBg: "bg-emerald-500/20", emoji: "😊" },
              { label: "Neutral", count: liveSentiment.neutral.count, pct: liveSentiment.neutral.pct, color: "text-neutral-400", bg: "bg-neutral-500", barBg: "bg-neutral-500/20", emoji: "😐" },
              { label: "Negative", count: liveSentiment.negative.count, pct: liveSentiment.negative.pct, color: "text-red-400", bg: "bg-red-500", barBg: "bg-red-500/20", emoji: "😟" },
            ].map(s => (
              <div key={s.label} className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider">{s.emoji} {s.label}</span>
                  <span className={`text-xs font-bold ${s.color}`}>{s.pct}%</span>
                </div>
                <p className={`text-xl font-extrabold ${s.color} tabular-nums`}>{s.count != null ? <CountUpValue value={s.count} /> : "—"}</p>
                <div className={`w-full ${s.barBg} rounded-full h-1.5 mt-2 overflow-hidden`}>
                  <div className={`h-full ${s.bg} rounded-full transition-all duration-1000`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Sentiment Timeline */}
          {(liveSentiment.sentimentTimeline || []).length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium mb-2">Sentiment Trend (Daily Breakdown)</p>
              <SentimentTimeline data={liveSentiment.sentimentTimeline!} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Gauge + Donut */}
            <div className="space-y-5">
              <div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium mb-2"><MetricTooltip term="Net Sentiment Score">Net Sentiment Score</MetricTooltip></p>
                <SentimentGauge positive={liveSentiment.positive.pct} negative={liveSentiment.negative.pct} neutral={liveSentiment.neutral.pct} priorNss={liveSentiment.priorNss ?? null} />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium mb-2">Sentiment Breakdown</p>
                <SentimentDonut positive={liveSentiment.positive.pct} negative={liveSentiment.negative.pct} neutral={liveSentiment.neutral.pct} />
                <div className="flex justify-center gap-6 mt-2">
                  {[
                    { label: "Positive", pct: liveSentiment.positive.pct, color: "bg-emerald-400" },
                    { label: "Neutral", pct: liveSentiment.neutral.pct, color: "bg-neutral-600" },
                    { label: "Negative", pct: liveSentiment.negative.pct, color: "bg-red-400" },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${s.color}`} />
                      <span className="text-[10px] text-neutral-400">{s.label} {s.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hashtags */}
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">Top Hashtags (X / Twitter)</p>
              <div className="space-y-2">
                {liveSentiment.topHashtags.map((h: any) => (
                  <a key={h.tag} href={`https://x.com/search?q=${encodeURIComponent(h.tag)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                    <span className="text-sm text-pink-400 group-hover:text-pink-300 transition-colors flex-1 truncate">{h.tag}</span>
                    <div className="w-20 bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-pink-500 h-full rounded-full" style={{ width: `${(h.count / (liveSentiment.topHashtags[0]?.count || 1)) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-bold tabular-nums text-neutral-400 w-14 text-right">{h.pct}%</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Conversation Drivers (Entities) */}
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">Conversation Drivers</p>
              <div className="space-y-2">
                {(liveSentiment.topEntities || []).slice(0, 8).map((e: any) => {
                  const icons: Record<string, string> = { person: "👤", organization: "🏢", location: "📍", unknown: "💬" };
                  const maxCount = (liveSentiment.topEntities || [])[0]?.count || 1;
                  return (
                    <div key={e.name} className="flex items-center gap-2">
                      <span className="text-xs">{icons[e.type] || "💬"}</span>
                      <span className="text-sm text-neutral-300 flex-1 truncate">{e.name}</span>
                      <div className="w-16 bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(e.count / maxCount) * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-bold tabular-nums text-neutral-400 w-12 text-right">{e.count?.toLocaleString() ?? "—"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Shared Links */}
          {(liveSentiment.topSharedLinks || []).length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/[0.05]">
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">🔗 Most Shared Links</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(liveSentiment.topSharedLinks || []).slice(0, 6).map((link: any, i: number) => {
                  let domain = "";
                  try { domain = new URL(link.url).hostname.replace("www.", ""); } catch { domain = link.url; }
                  const maxShares = (liveSentiment.topSharedLinks || [])[0]?.count || 1;
                  return (
                    <a
                      key={`${link.url}-${i}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-white/[0.02] hover:bg-white/[0.04] rounded-xl p-3 border border-white/[0.04] hover:border-rose-500/20 transition-all"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-[10px] font-bold text-rose-400 tabular-nums mt-0.5">#{i + 1}</span>
                        <p className="text-xs text-neutral-300 group-hover:text-white transition-colors line-clamp-2 flex-1 leading-relaxed">
                          {link.title || domain}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-neutral-600 truncate max-w-[60%]">{domain}</span>
                        <span className="text-[10px] font-bold text-rose-400 tabular-nums">{link.count?.toLocaleString() ?? "—"} shares</span>
                      </div>
                      <div className="w-full bg-white/[0.04] rounded-full h-1 mt-2 overflow-hidden">
                        <div className="bg-rose-500/60 h-full rounded-full transition-all duration-700" style={{ width: `${(link.count / maxShares) * 100}%` }} />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
          </CollapsibleSection>
        </section>
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* Section 8: Cultural Affinity */}
        <SectionErrorBoundary sectionName="Cultural Affinity">
        <AnimatedSection>
        <section id="section-cultural" className="scroll-mt-16">
          <CollapsibleSection id="cultural-affinity" number="8" title="Cultural Affinity" subtitle="Meltwater · Cultural context & audience themes" color="bg-gradient-to-br from-fuchsia-500 to-purple-400" collapsedSummary="Cultural themes, hashtags & sentiment from dedicated affinity search">
            <CulturalAffinity />
          </CollapsibleSection>
        </section>
        </AnimatedSection>
        </SectionErrorBoundary>

        {/* Footer */}
        <footer className="text-center py-10 border-t border-white/[0.03] space-y-2">
          <div className="flex items-center justify-center gap-3">
            <svg viewBox="0 0 60 14" className="h-3 text-neutral-600" fill="currentColor">
              <text x="0" y="12" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="13" letterSpacing="2">HYBE</text>
            </svg>
            <span className="text-neutral-700">·</span>
            <span className="text-[10px] font-medium tracking-[0.15em] text-neutral-600 uppercase">Latin America</span>
          </div>
          <p className="text-neutral-700 text-[10px] uppercase tracking-[0.3em]">Artist Intelligence Platform · {reportDate}</p>
          <p className="text-neutral-800 text-[10px]">Chartmetric · Spotify for Artists · YouTube Data API · Cobrand · Weverse · Instagram · Meltwater</p>
          <PrintQR reportDate={reportDate} />
          <div className="mt-4">
            <DataSourcesStatus />
          </div>
        </footer>
        </div>{/* end dateLoading wrapper */}
      </div>
      <KeyboardShortcuts onRefresh={refresh} />
      <CommandPalette onRefresh={refresh} />
      <MobileNav />
      <BackToTop />
      {/* Bottom padding for mobile nav */}
      <div className="h-16 lg:hidden print:hidden" />
    </main>
  );
}

function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
        {/* Ambient glow orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-cyan-500/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>
        <div className="relative flex flex-col items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <svg viewBox="0 0 100 24" className="h-6 text-white/80" fill="currentColor">
              <text x="0" y="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="22" letterSpacing="3">HYBE</text>
            </svg>
            <div className="w-px h-5 bg-white/10" />
            <span className="text-sm font-bold text-violet-400 uppercase tracking-wider">Latin America</span>
          </div>
          {/* Artist name */}
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            SANTOS BRAVOS
          </h1>
          {/* Loading bar */}
          <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-violet-500 rounded-full animate-loading-bar" />
          </div>
          <p className="text-xs text-neutral-500 uppercase tracking-widest">Loading Intelligence Dashboard</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div suppressHydrationWarning>
      <ErrorBoundary>
        <LiveDataProvider>
          <Dashboard />
        </LiveDataProvider>
      </ErrorBoundary>
    </div>
  );
}

// Disable SSR entirely to avoid hydration mismatch errors
export default dynamic(() => Promise.resolve(Home), { ssr: false });
