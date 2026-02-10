"use client";

import {
  reportDate, priorDate, businessPerformance, dailyStreams, socialMedia,
  audioVirality, members, totalMemberFollowers, geoCountries, geoCities,
  prMedia, fanSentiment, audienceStats, artistOverview,
} from "./lib/data";
import StreamingCharts from "./components/StreamingCharts";
import SocialChart from "./components/SocialChart";
import GeoChart, { GeoProgressBars } from "./components/GeoChart";
import MentionsChart from "./components/MentionsChart";
import SentimentDonut from "./components/SentimentDonut";
import { AnimatedSection, CountUpValue, StaggerChildren, StaggerItem } from "./components/AnimatedSection";
import Image from "next/image";
import { LiveDataProvider, LiveBadge, useLiveData } from "./components/LiveDataProvider";
import ViralityChart from "./components/ViralityChart";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
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

function MetricRow({ label, current, prior, accent }: { label: string; current: number; prior: number | null; accent?: string }) {
  const d = dod(current, prior);
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.03] last:border-0 group hover:bg-white/[0.01] px-2 -mx-2 rounded">
      <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors flex-1">{label}</span>
      <div className="flex items-center gap-4">
        <span className={`text-sm font-bold tabular-nums ${accent || "text-white"}`}>{fmt(current)}</span>
        {prior !== null && (
          <>
            <span className="text-[10px] text-neutral-600 tabular-nums w-16 text-right">{fmt(prior)}</span>
            <span className={`text-[10px] font-semibold tabular-nums w-16 text-right ${d.positive ? "text-emerald-400" : "text-red-400"}`}>{d.diff}</span>
            <DodBadge current={current} prior={prior} />
          </>
        )}
      </div>
    </div>
  );
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
  const bp = businessPerformance;
  const o = artistOverview;
  const { chartmetric, youtube, meltwater, isLive } = useLiveData();

  // Overlay live Meltwater data when available
  const livePR = meltwater?.prMedia ?? prMedia;
  const liveSentiment = meltwater?.fanSentiment ?? fanSentiment;

  // Overlay live data when available
  const liveListeners = chartmetric?.spotifyMonthlyListeners ?? bp.spotifyMonthlyListeners.current;
  const livePopularity = chartmetric?.spotifyPopularity ?? bp.spotifyPopularity.current;
  const liveTrackStreams = bp.tracks.map((t, i) => ({
    ...t,
    spotifyStreams: {
      ...t.spotifyStreams,
      current: chartmetric?.tracks?.[i]?.spotifyStreams ?? t.spotifyStreams.current,
    },
  }));

  // Overlay live YouTube data when available
  const liveYTVideos = bp.youtubeVideos.map((v) => {
    const liveMatch = youtube?.videos?.find((lv) => lv.name === v.name);
    return {
      ...v,
      views: {
        ...v.views,
        current: liveMatch?.views ?? v.views.current,
      },
      likes: liveMatch?.likes ?? 0,
      comments: liveMatch?.comments ?? 0,
    };
  });
  const liveYTSubscribers = youtube?.subscribers ?? socialMedia.platforms.find(p => p.platform === "YouTube")?.current ?? 471000;

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <svg viewBox="0 0 100 24" className="h-4 text-white" fill="currentColor">
            <text x="0" y="20" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="22" letterSpacing="3">HYBE</text>
          </svg>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.2em]">Latin America</span>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.15em]">Artist Intelligence</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5">
            <span className="text-[10px] text-white font-bold uppercase tracking-wider">📅 Report: 2/9/2026</span>
          </div>
          <LiveBadge />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* Hero */}
        <section className="hero-bg rounded-3xl p-8 md:p-10">
          {/* Report Date Banner */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-sm font-black text-white">9</div>
              <div>
                <p className="text-white font-bold text-sm">Daily Report — {reportDate}</p>
                <p className="text-[10px] text-neutral-500">Compared vs prior report: {priorDate}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
                <span className="text-[10px] text-emerald-400 font-semibold">DATA CURRENT</span>
              </div>
              <p className="text-[9px] text-neutral-600 mt-0.5">Auto-updated via API pipeline</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <Image src="/sb-avatar.jpg" alt="Santos Bravos" width={120} height={120}
              className="rounded-2xl shadow-2xl shadow-violet-500/20 ring-2 ring-violet-500/20 flex-shrink-0" />
            <div className="text-center md:text-left space-y-2 flex-1">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <svg viewBox="0 0 60 14" className="h-2.5 text-neutral-500" fill="currentColor">
                  <text x="0" y="12" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="13" letterSpacing="2">HYBE</text>
                </svg>
                <span className="text-[10px] text-neutral-500">LATIN AMERICA</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight sb-gradient">SANTOS BRAVOS</h1>
              <p className="text-neutral-500 text-sm">{o.tagline}</p>
              <div className="flex gap-2 flex-wrap justify-center md:justify-start">
                {["🎤 Latin Pop", "👥 5 Members", "💿 3 Releases", "🌎 LATAM + US"].map(tag => (
                  <span key={tag} className="text-[10px] bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1 text-neutral-500">{tag}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
              <div className="glass-hybe rounded-xl p-3 text-center min-w-[120px]">
                <p className="text-[9px] text-neutral-500 uppercase tracking-wider">Listeners</p>
                <p className="text-xl font-extrabold text-spotify"><CountUpValue value={liveListeners} /></p>
                <DodBadge current={liveListeners} prior={bp.spotifyMonthlyListeners.prior} />
              </div>
              <div className="glass-hybe rounded-xl p-3 text-center min-w-[120px]">
                <p className="text-[9px] text-neutral-500 uppercase tracking-wider">SNS</p>
                <p className="text-xl font-extrabold text-tiktok"><CountUpValue value={socialMedia.totalFootprint.current} /></p>
                <DodBadge current={socialMedia.totalFootprint.current} prior={socialMedia.totalFootprint.prior} />
              </div>
              <div className="glass-hybe rounded-xl p-3 text-center min-w-[120px]">
                <p className="text-[9px] text-neutral-500 uppercase tracking-wider">Streams</p>
                <p className="text-xl font-extrabold text-white"><CountUpValue value={bp.totalCrossPlatformStreams.current} /></p>
              </div>
              <div className="glass-hybe rounded-xl p-3 text-center min-w-[120px]">
                <p className="text-[9px] text-neutral-500 uppercase tracking-wider">SPL</p>
                <p className="text-xl font-extrabold text-amber-400"><CountUpValue value={bp.spl.current * 1000} formatFn={(n) => (n / 1000).toFixed(3)} /></p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Business Performance */}
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <SectionHeader number="1" title="Business Performance Snapshot" subtitle="Spotify + YouTube" color="bg-spotify" />
          <div className="mb-3 flex items-center gap-6 text-[9px] text-neutral-600 uppercase tracking-wider px-2 py-2 bg-white/[0.015] rounded-lg">
            <span className="flex-1">Metric</span>
            <span className="w-20 text-right font-bold text-violet-400">2/9/26</span>
            <span className="w-16 text-right">2/4/26</span>
            <span className="w-16 text-right">Change</span>
            <span className="w-16 text-right">DoD %</span>
          </div>
          <MetricRow label={bp.spotifyMonthlyListeners.label} current={liveListeners} prior={bp.spotifyMonthlyListeners.prior} accent="text-spotify" />
          <MetricRow label="Spotify Popularity Index" current={livePopularity} prior={bp.spotifyPopularity.prior} />
          {liveTrackStreams.map(t => (
            <MetricRow key={t.name} label={`Spotify Total Streams: ${t.name}`} current={t.spotifyStreams.current} prior={t.spotifyStreams.prior} accent="text-spotify" />
          ))}
          <div className="my-3 border-t border-white/[0.05]" />
          <MetricRow label={bp.totalCrossPlatformStreams.label} current={bp.totalCrossPlatformStreams.current} prior={bp.totalCrossPlatformStreams.prior} />
          {liveYTVideos.map(v => (
            <MetricRow key={v.name} label={`YouTube Views: ${v.name}`} current={v.views.current} prior={v.views.prior} accent="text-ytred" />
          ))}
          <MetricRow label={bp.spl.label} current={bp.spl.current} prior={null} accent="text-amber-400" />
        </section>
        </AnimatedSection>

        {/* Daily Streams (SFA) */}
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <SectionHeader number="⚡" title="Spotify for Artists — Daily Snapshot" subtitle="Saturday, February 8, 2026 (24h)" color="bg-gradient-to-br from-spotify to-emerald-400" />
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
                    <p className="text-[9px] text-neutral-500 uppercase">Saves</p>
                    <p className="text-lg font-extrabold text-violet-400">{fmt(t.saves)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        </AnimatedSection>

        {/* Charts */}
        <AnimatedSection>
        <section className="space-y-4">
          <StreamingCharts
            spotifyTracks={bp.tracks.map(t => ({ name: t.name, streams: t.spotifyStreams.current }))}
            youtubeVideos={liveYTVideos.map(v => ({ name: v.name.split(":")[0].replace("YouTube Views", "").trim() || v.name, views: v.views.current }))}
            dailyStreams={dailyStreams.map(d => ({ name: d.name, streams: d.streams }))}
          />
        </section>
        </AnimatedSection>

        {/* Section 2: Social Media */}
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <SectionHeader number="2" title="Social Media Performance" subtitle="SNS · As of 2/9/26" color="bg-gradient-to-br from-tiktok to-cyan-300" />
          <MetricRow label={socialMedia.totalFootprint.label} current={socialMedia.totalFootprint.current} prior={socialMedia.totalFootprint.prior} accent="text-tiktok" />
          {socialMedia.platforms.map(p => (
            <MetricRow key={p.platform} label={`${p.platform} ${p.metric} (Total)`} current={p.current} prior={p.prior} accent={`text-[${p.color}]`} />
          ))}
          <div className="mt-4">
            <SocialChart data={socialMedia.platforms.map(p => ({ platform: p.platform, followers: p.current, color: p.color }))} />
          </div>
        </section>
        </AnimatedSection>

        {/* Section 3: Audio Virality */}
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <SectionHeader number="3" title="Audio Virality" subtitle="Cobrand · TT + IG · As of 2/9/26" color="bg-gradient-to-br from-purple-500 to-pink-500" />
          <MetricRow label={audioVirality.totalAudioViews.label} current={audioVirality.totalAudioViews.current} prior={audioVirality.totalAudioViews.prior} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {audioVirality.tracks.map(t => (
              <div key={t.name} className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                <p className="font-bold text-white text-sm mb-2">{t.name}</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-neutral-500">Audio Views</span>
                    <span className="text-sm font-bold text-white">{fmt(t.views)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-neutral-500">TikTok Creates</span>
                    <span className="text-sm font-bold text-tiktok">{t.tiktokCreates.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-neutral-500">IG Creates</span>
                    <span className="text-sm font-bold text-pink-400">{t.igCreates.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium mb-2">Platform Creates Comparison</p>
            <ViralityChart tracks={audioVirality.tracks} />
          </div>
        </section>
        </AnimatedSection>

        {/* Section 4: Band Member Followers */}
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <SectionHeader number="4" title="Band Member Followers" subtitle="Instagram · As of 2/9/26" color="bg-gradient-to-br from-pink-500 to-rose-400" />
          <StaggerChildren className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {members.map((m, i) => {
              const gradients = ["from-violet-600 to-blue-500", "from-cyan-500 to-blue-400", "from-pink-500 to-rose-400", "from-amber-500 to-orange-400", "from-emerald-500 to-teal-400"];
              return (
                <StaggerItem key={m.handle} className="bg-white/[0.02] rounded-xl p-4 text-center border border-white/[0.04] hover:border-violet-500/20 hover:-translate-y-0.5 transition-all">
                  <div className={`w-12 h-12 mx-auto rounded-lg bg-gradient-to-br ${gradients[i]} flex items-center justify-center text-sm font-bold text-white mb-2`}>
                    {m.country}
                  </div>
                  <p className="font-bold text-xs text-white">{m.name}</p>
                  <p className="text-[9px] text-neutral-600">{m.handle}</p>
                  <p className="text-base font-extrabold text-pink-400 mt-1">{fmt(m.followers)}</p>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
          <div className="flex items-center justify-between py-3 px-2 bg-white/[0.02] rounded-lg border border-white/[0.04]">
            <span className="text-sm font-semibold text-neutral-400">Total Band Member Followers</span>
            <span className="text-xl font-extrabold text-white">{fmt(totalMemberFollowers.current)}</span>
          </div>
        </section>
        </AnimatedSection>

        {/* Section 5: Geo Signals */}
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <SectionHeader number="5" title="Geo Signals" subtitle="Spotify · Jan 12 – Feb 8, 2026 (28 Days)" color="bg-gradient-to-br from-blue-500 to-indigo-400" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">Top Countries</p>
              <GeoProgressBars data={geoCountries} color="#6366F1" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">Top Cities</p>
              <GeoChart data={geoCities.map(c => ({ name: c.name, listeners: c.listeners }))} color="#06B6D4" />
            </div>
          </div>
        </section>
        </AnimatedSection>

        {/* Audience Deep Dive */}
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <SectionHeader number="📊" title="Audience Deep Dive" subtitle={`Spotify for Artists · ${audienceStats.period}`} color="bg-gradient-to-br from-amber-500 to-orange-400" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
        </section>
        </AnimatedSection>

        {/* Section 6: PR & Media */}
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <SectionHeader number="6" title="PR & Media Exposure" subtitle={`Meltwater · ${livePR.period}`} color="bg-gradient-to-br from-violet-500 to-indigo-400" />
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Total Mentions", value: livePR.totalMentions.toLocaleString(), accent: "text-violet-400" },
              { label: "Avg / Day", value: livePR.perDay.toLocaleString(), accent: "text-white" },
              { label: "Unique Authors", value: livePR.uniqueAuthors.toLocaleString(), accent: "text-cyan-400" },
            ].map(s => (
              <div key={s.label} className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04] text-center">
                <p className="text-[9px] text-neutral-500 uppercase tracking-wider">{s.label}</p>
                <p className={`text-xl font-extrabold mt-1 ${s.accent}`}>{s.value}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-neutral-500 uppercase tracking-[0.15em] font-medium mb-2">Daily Mention Volume</p>
          <MentionsChart data={livePR.timeSeries} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">Top Countries (Mentions)</p>
              <div className="space-y-2">
                {livePR.topCountries.map((c, i) => (
                  <div key={c.code} className="flex items-center gap-3">
                    <span className="text-[10px] text-neutral-600 w-4 text-right">{i + 1}</span>
                    <span className="text-sm">{c.flag}</span>
                    <span className="text-sm text-neutral-300 flex-1">{c.name}</span>
                    <span className="text-sm font-bold tabular-nums text-white">{c.mentions.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">Top Sources</p>
              <div className="space-y-2">
                {livePR.topSources.slice(0, 6).map((s) => {
                  const icons: Record<string, string> = { social: "🌐", news: "📰", blog: "✍️", other: "📄" };
                  return (
                    <div key={s.name} className="flex items-center gap-3">
                      <span className="text-sm">{icons[s.type] || "📄"}</span>
                      <span className="text-sm text-neutral-300 flex-1 truncate">{s.name}</span>
                      <div className="w-20 bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(s.count / (livePR.topSources[0]?.count || 1)) * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-bold tabular-nums text-neutral-400 w-12 text-right">{s.count.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">Trending Keyphrases</p>
              <div className="space-y-2">
                {livePR.topKeyphrases.slice(0, 6).map((k) => (
                  <div key={k.phrase} className="flex items-center gap-3">
                    <span className="text-sm text-neutral-300 flex-1 truncate">{k.phrase}</span>
                    <div className="w-20 bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-violet-500 h-full rounded-full" style={{ width: `${(k.count / (livePR.topKeyphrases[0]?.count || 1)) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-bold tabular-nums text-neutral-400 w-10 text-right">{k.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        </AnimatedSection>

        {/* Section 7: Fan Sentiment */}
        <AnimatedSection>
        <section className="glass-hybe rounded-2xl p-6">
          <SectionHeader number="7" title="Fan Sentiment" subtitle={`Meltwater · ${liveSentiment.period}`} color="bg-gradient-to-br from-rose-500 to-pink-400" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium mb-3">Top Hashtags (X / Twitter)</p>
              <div className="space-y-2">
                {liveSentiment.topHashtags.map((h) => (
                  <div key={h.tag} className="flex items-center gap-3">
                    <span className="text-sm text-pink-400 flex-1 truncate">{h.tag}</span>
                    <div className="w-20 bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-pink-500 h-full rounded-full" style={{ width: `${(h.count / (liveSentiment.topHashtags[0]?.count || 1)) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-bold tabular-nums text-neutral-400 w-14 text-right">{h.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        </AnimatedSection>

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
        </footer>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <LiveDataProvider>
      <Dashboard />
    </LiveDataProvider>
  );
}
