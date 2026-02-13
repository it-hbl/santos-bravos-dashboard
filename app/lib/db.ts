import { supabase } from './supabase';
import * as fallback from './data';

export interface DashboardData {
  reportDate: string;
  priorDate: string;
  businessPerformance: typeof fallback.businessPerformance;
  dailyStreams: typeof fallback.dailyStreams;
  socialMedia: typeof fallback.socialMedia;
  audioVirality: typeof fallback.audioVirality;
  members: typeof fallback.members;
  totalMemberFollowers: typeof fallback.totalMemberFollowers;
  geoCountries: typeof fallback.geoCountries;
  geoCities: typeof fallback.geoCities;
  prMedia: typeof fallback.prMedia;
  fanSentiment: typeof fallback.fanSentiment;
  audienceStats: typeof fallback.audienceStats;
  artistOverview: typeof fallback.artistOverview;
}

/** Get list of available report dates */
export async function getAvailableDates(): Promise<string[]> {
  const { data, error } = await supabase
    .from('daily_reports')
    .select('report_date')
    .order('report_date', { ascending: false });

  if (error || !data || data.length === 0) {
    return ['2026-02-09'];
  }
  return data.map((r: any) => r.report_date);
}

/** Fetch all dashboard data for a given date. Falls back to hardcoded data. */
export async function getDashboardData(date: string): Promise<DashboardData> {
  try {
    // Fetch daily report
    const { data: report } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('report_date', date)
      .single();

    if (!report) return getFallbackData();

    // Fetch all related data in parallel
    const [
      { data: tracks },
      { data: social },
      { data: membersData },
      { data: countries },
      { data: cities },
      { data: pr },
      { data: sentiment },
      { data: ytVideos },
      { data: audience },
    ] = await Promise.all([
      supabase.from('track_metrics').select('*').eq('report_date', date),
      supabase.from('social_metrics').select('*').eq('report_date', date),
      supabase.from('member_followers').select('*').eq('report_date', date).order('followers', { ascending: false }),
      supabase.from('geo_countries').select('*').eq('report_date', date).order('listeners', { ascending: false }),
      supabase.from('geo_cities').select('*').eq('report_date', date).order('listeners', { ascending: false }),
      supabase.from('pr_media').select('*').eq('report_date', date).single(),
      supabase.from('fan_sentiment').select('*').eq('report_date', date).single(),
      supabase.from('youtube_videos').select('*').eq('report_date', date),
      supabase.from('audience_stats').select('*').eq('report_date', date).single(),
    ]);

    // Format report date nicely
    const d = new Date(date + 'T12:00:00');
    const reportDateStr = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Find actual prior date (previous available date in DB)
    const { data: allDates } = await supabase
      .from('daily_reports')
      .select('report_date')
      .lt('report_date', date)
      .order('report_date', { ascending: false })
      .limit(1);
    const priorDateRaw = allDates?.[0]?.report_date;
    const priorDateStr = priorDateRaw
      ? new Date(priorDateRaw + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : '';

    // Fetch prior report for fields that don't have _prior columns
    let priorReport: any = null;
    if (priorDateRaw) {
      const { data: pr } = await supabase
        .from('daily_reports')
        .select('spotify_followers, total_member_followers, spl')
        .eq('report_date', priorDateRaw)
        .single();
      priorReport = pr;
    }

    // Build businessPerformance
    const trackList = (tracks || []).map((t: any) => ({
      name: t.track_name,
      spotifyStreams: { current: t.spotify_streams, prior: t.spotify_streams_prior },
    }));

    const ytVideoList = (ytVideos || []).map((v: any) => ({
      name: v.video_name,
      views: { current: v.views, prior: v.views_prior },
      likes: v.likes || 0,
      comments: v.comments || 0,
    }));

    const socialPlatforms = (social || []).map((s: any) => ({
      platform: s.platform,
      metric: s.metric_name,
      current: s.value,
      prior: s.prior_value,
      color: s.color || '#FFFFFF',
      icon: s.icon || '',
    }));

    const viralityTracks = (tracks || []).map((t: any) => ({
      name: t.track_name,
      views: t.audio_views || 0,
      tiktokCreates: t.tiktok_creates || 0,
      igCreates: t.ig_creates || 0,
    }));

    const prData = pr ? {
      period: pr.period || '',
      totalMentions: pr.total_mentions,
      perDay: pr.per_day,
      uniqueAuthors: pr.unique_authors,
      timeSeries: pr.time_series || [],
      topCountries: pr.top_countries || [],
      topKeyphrases: pr.top_keyphrases || [],
      topMentions: pr.top_mentions || [],
      topSources: pr.top_sources || [],
      wow: pr.wow || {},
      topTopics: pr.top_topics || [],
    } : fallback.prMedia;

    const sentimentData = sentiment ? {
      period: sentiment.period || '',
      positive: { count: sentiment.positive_count, pct: parseFloat(sentiment.positive_pct) },
      negative: { count: sentiment.negative_count, pct: parseFloat(sentiment.negative_pct) },
      neutral: { count: sentiment.neutral_count, pct: parseFloat(sentiment.neutral_pct) },
      topHashtags: sentiment.top_hashtags || [],
      topEntities: sentiment.top_entities || [],
      topSharedLinks: sentiment.top_shared_links || [],
      sentimentTimeline: sentiment.sentiment_timeline || [],
    } : fallback.fanSentiment;

    const audienceData = audience ? {
      period: audience.period || '',
      listeners: audience.listeners,
      streams: audience.streams,
      streamsPerListener: parseFloat(audience.streams_per_listener),
      saves: audience.saves,
      playlistAdds: audience.playlist_adds,
      followers: audience.followers,
    } : fallback.audienceStats;

    return {
      reportDate: reportDateStr,
      priorDate: priorDateStr || (report.spotify_monthly_listeners_prior ? 'Prior Report' : ''),
      businessPerformance: {
        spotifyMonthlyListeners: { current: report.spotify_monthly_listeners, prior: report.spotify_monthly_listeners_prior, label: "Spotify Monthly Listeners (Global)" },
        spotifyPopularity: { current: report.spotify_popularity, prior: report.spotify_popularity_prior, label: "Spotify Popularity Index" },
        spotifyFollowers: { current: report.spotify_followers, prior: priorReport?.spotify_followers ?? null, label: "Spotify Followers" },
        tracks: trackList,
        totalCrossPlatformStreams: { current: report.total_cross_platform_streams, prior: report.total_cross_platform_streams_prior, label: "Total Cross-Platform Streams (All DSPs + YouTube)" },
        youtubeVideos: ytVideoList,
        spl: { current: parseFloat(report.spl) || 0, prior: priorReport?.spl ? parseFloat(priorReport.spl) : null, label: "Streams Per Listener (SPL) — 28 Days" },
      },
      dailyStreams: (tracks || []).filter((t: any) => t.daily_streams > 0).map((t: any) => ({
        name: t.track_name,
        streams: t.daily_streams,
        listeners: t.daily_listeners,
        saves: t.daily_saves,
      })),
      socialMedia: {
        totalFootprint: { current: report.total_sns_footprint, prior: report.total_sns_footprint_prior, label: "Total SNS Footprint (IG + TT + YT + WV)" },
        platforms: socialPlatforms,
      },
      audioVirality: {
        totalAudioViews: { current: report.total_audio_views || 0, prior: report.total_audio_views_prior || null, label: "Total Audio Views (TT + IG)" },
        tracks: viralityTracks,
      },
      members: (membersData || []).map((m: any) => ({
        name: m.member_name,
        handle: m.handle,
        followers: m.followers,
        country: m.country || '',
      })),
      totalMemberFollowers: { current: report.total_member_followers || 0, prior: priorReport?.total_member_followers ?? null },
      geoCountries: (countries || []).map((c: any) => ({
        name: c.country_name,
        listeners: c.listeners,
        flag: c.flag || '',
      })),
      geoCities: (cities || []).map((c: any) => ({
        name: c.city_name,
        listeners: c.listeners,
      })),
      prMedia: prData as any,
      fanSentiment: sentimentData as any,
      audienceStats: audienceData,
      artistOverview: {
        name: "Santos Bravos",
        tagline: "The First Latin Boy Band by HYBE",
        monthlyListeners: report.spotify_monthly_listeners,
        followers: report.spotify_followers || 0,
        totalStreams: report.total_cross_platform_streams,
        snsFootprint: report.total_sns_footprint,
      },
    };
  } catch (err) {
    console.error('Error fetching from Supabase:', err);
    return getFallbackData();
  }
}

function getFallbackData(): DashboardData {
  return {
    reportDate: fallback.reportDate,
    priorDate: fallback.priorDate,
    businessPerformance: fallback.businessPerformance,
    dailyStreams: fallback.dailyStreams,
    socialMedia: fallback.socialMedia,
    audioVirality: fallback.audioVirality,
    members: fallback.members,
    totalMemberFollowers: fallback.totalMemberFollowers,
    geoCountries: fallback.geoCountries,
    geoCities: fallback.geoCities,
    prMedia: fallback.prMedia,
    fanSentiment: fallback.fanSentiment,
    audienceStats: fallback.audienceStats,
    artistOverview: fallback.artistOverview,
  };
}
