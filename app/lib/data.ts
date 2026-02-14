// Centralized data — swap these for live API calls later
// All data as of Feb 9, 2026. Prior day = Feb 4, 2026 (last report)

// === RELEASE DATES (single source of truth) ===
export const RELEASES = [
  { id: "debut",   name: "Santos Bravos Debut",       trackName: null,                        date: "2026-01-24", color: "#a78bfa", emoji: "🌟", spotifyId: null, youtubeVideoId: null },
  { id: "0pct",    name: "0% Official MV",             trackName: "0%",                        date: "2026-01-31", color: "#22c55e", emoji: "🎬", spotifyId: "0V91BVy8lD7xoxQBNajPiu", youtubeVideoId: "ogmUm0xh8-w" },
  { id: "0pct-pt", name: "0% (Portuguese Version)",    trackName: "0% (Portuguese Version)",   date: "2026-02-03", color: "#06b6d4", emoji: "🌎", spotifyId: "4WwOkpl2MxLCeIfDOFjziN", youtubeVideoId: "_9tvZ5qoH_I" },
  { id: "kawasaki",name: "KAWASAKI",                    trackName: "KAWASAKI",                  date: "2026-02-07", color: "#ec4899", emoji: "🏍️", spotifyId: "1ojKC4x3rDKoaikvEx1Lt2", youtubeVideoId: "Cmy8CsYIUL0" },
] as const;

// Additional YouTube video IDs not tied to a release
export const YOUTUBE_VIDEO_IDS: Record<string, string> = {
  "0% Official MV": "ogmUm0xh8-w",
  "0% Debut Visualizer": "CYse_hesElw",
  "0% (Portuguese) Lyric Video": "_9tvZ5qoH_I",
  "KAWASAKI Performance Video": "Cmy8CsYIUL0",
};

/** Get YouTube URL for a video by its dashboard name */
export function getVideoYoutubeUrl(videoName: string): string | null {
  const id = YOUTUBE_VIDEO_IDS[videoName];
  return id ? `https://youtube.com/watch?v=${id}` : null;
}

/** Spotify track URL map — get the open.spotify.com link for a track by name */
export const TRACK_SPOTIFY_URLS: Record<string, string> = Object.fromEntries(
  RELEASES.filter(r => r.spotifyId).map(r => [r.trackName!, `https://open.spotify.com/track/${r.spotifyId}`])
);

/** Get Spotify URL for a track name, returns null if not found */
export function getTrackSpotifyUrl(trackName: string): string | null {
  return TRACK_SPOTIFY_URLS[trackName] ?? null;
}

/** Get release date for a track by name */
export function getTrackReleaseDate(trackName: string): string | null {
  const r = RELEASES.find(r => r.trackName === trackName);
  return r ? r.date : null;
}

/** Days since release for a track (relative to a reference date) */
export function daysSinceRelease(trackName: string, refDate: string | Date = new Date()): number {
  const releaseDate = getTrackReleaseDate(trackName);
  if (!releaseDate) return 0;
  const ref = typeof refDate === "string" ? new Date(refDate + "T12:00:00") : refDate;
  const rel = new Date(releaseDate + "T12:00:00");
  return Math.max(0, Math.round((ref.getTime() - rel.getTime()) / 86400000));
}

export const reportDate = "February 9, 2026";
export const priorDate = "February 4, 2026";

// === SECTION 1: Business Performance Snapshot ===
export const businessPerformance = {
  spotifyMonthlyListeners: { current: 335584, prior: 325961, label: "Spotify Monthly Listeners (Global)" },
  spotifyPopularity: { current: 51, prior: null, label: "Spotify Popularity Index" },
  spotifyFollowers: { current: 97592, prior: null as number | null, label: "Spotify Followers" },
  tracks: [
    { name: "0%", spotifyStreams: { current: 4818683, prior: 4712736 } },
    { name: "0% (Portuguese Version)", spotifyStreams: { current: 902520, prior: 868325 } },
    { name: "KAWASAKI", spotifyStreams: { current: 914305, prior: 648672 } },
  ],
  totalCrossPlatformStreams: { current: 29748186, prior: null, label: "Total Cross-Platform Streams (All DSPs + YouTube)" },
  youtubeVideos: [
    { name: "KAWASAKI Performance Video", views: { current: 3849420, prior: 2158030 } },
    { name: "0% Official MV", views: { current: 12084773, prior: 11975502 } },
    { name: "0% (Portuguese) Lyric Video", views: { current: 953545, prior: 941246 } },
    { name: "0% Debut Visualizer", views: { current: 6224940, prior: 6181833 } },
  ],
  spl: { current: 6.129, prior: null as number | null, label: "Streams Per Listener (SPL) — 28 Days" },
};

// Daily streams from Spotify for Artists (Feb 8, 24h)
export const dailyStreams = [
  { name: "KAWASAKI", streams: 73780, listeners: 41053, saves: 5906 },
  { name: "0%", streams: 30444, listeners: 21361, saves: 1084 },
  { name: "0% (Portuguese)", streams: 10121, listeners: 6363, saves: 288 },
];

// === SECTION 2: Social Media Performance (SNS) ===
export const socialMedia = {
  totalFootprint: { current: 1706313, prior: 1663235, label: "Total SNS Footprint (IG + TT + YT + WV)" },
  platforms: [
    { platform: "YouTube", metric: "Subscribers", current: 471000, prior: 459235, color: "#FF0000", icon: "▶" },
    { platform: "TikTok", metric: "Followers", current: 652800, prior: 639100, color: "#00F2EA", icon: "♪" },
    { platform: "Instagram", metric: "Followers", current: 399513, prior: 386935, color: "#E1306C", icon: "◉" },
    { platform: "Weverse", metric: "Members", current: 183000, prior: 177965, color: "#B8FF01", icon: "W" },
  ],
};

// === SECTION 3: Audio Virality (TT + IG Audio Tracker) ===
export const audioVirality = {
  totalAudioViews: { current: 10404617, prior: 10263380, label: "Total Audio Views (TT + IG)" },
  tracks: [
    { name: "0%", views: 8469658, tiktokCreates: 7657, igCreates: 1781 },
    { name: "0% (Portuguese)", views: 1934959, tiktokCreates: 7657, igCreates: 0 },
    { name: "KAWASAKI", views: 0, tiktokCreates: 4903, igCreates: 0 },
  ],
};

// === SECTION 4: Band Member Followers ===
export const members = [
  { name: "Kenneth Lavíll", handle: "@soykennethlavill", followers: 685000, country: "🇲🇽" },
  { name: "Kauê Penna", handle: "@kauepenna", followers: 250000, country: "🇧🇷" },
  { name: "Alejandro Aramburu", handle: "@alearamburu_oficial", followers: 207000, country: "🇲🇽" },
  { name: "Drew Venegas", handle: "@and.venn", followers: 179000, country: "🇺🇸" },
  { name: "Gabi Bermúdez", handle: "@gabiprpr", followers: 130000, country: "🇵🇷" },
];
export const totalMemberFollowers = { current: 1451000, prior: null as number | null };

// === SECTION 5: Geo Signals ===
export const geoCountries = [
  { name: "Mexico", listeners: 136133, flag: "🇲🇽" },
  { name: "Peru", listeners: 46276, flag: "🇵🇪" },
  { name: "United States", listeners: 33662, flag: "🇺🇸" },
  { name: "Brazil", listeners: 26778, flag: "🇧🇷" },
  { name: "Chile", listeners: 21296, flag: "🇨🇱" },
  { name: "Colombia", listeners: 11763, flag: "🇨🇴" },
  { name: "Argentina", listeners: 11527, flag: "🇦🇷" },
  { name: "Spain", listeners: 6728, flag: "🇪🇸" },
  { name: "Guatemala", listeners: 5584, flag: "🇬🇹" },
  { name: "Ecuador", listeners: 5039, flag: "🇪🇨" },
];

export const geoCities = [
  { name: "Mexico City", listeners: 36503 },
  { name: "Lima", listeners: 30136 },
  { name: "Santiago", listeners: 13296 },
  { name: "Guadalajara", listeners: 7529 },
  { name: "Puebla", listeners: 6711 },
];

// === SECTION 6: PR & Media Exposure (Meltwater) ===
export const prMedia = {
  period: "Feb 3 – Feb 9, 2026",
  totalMentions: 6046,
  perDay: 863,
  uniqueAuthors: 2991,
  timeSeries: [
    { date: "Feb 3", mentions: 1717 },
    { date: "Feb 4", mentions: 935 },
    { date: "Feb 5", mentions: 895 },
    { date: "Feb 6", mentions: 797 },
    { date: "Feb 7", mentions: 687 },
    { date: "Feb 8", mentions: 609 },
    { date: "Feb 9", mentions: 406 },
  ],
  topCountries: [
    { code: "PE", name: "Peru", mentions: 329, flag: "🇵🇪" },
    { code: "MX", name: "Mexico", mentions: 185, flag: "🇲🇽" },
    { code: "US", name: "United States", mentions: 169, flag: "🇺🇸" },
    { code: "BR", name: "Brazil", mentions: 112, flag: "🇧🇷" },
    { code: "JP", name: "Japan", mentions: 55, flag: "🇯🇵" },
    { code: "AR", name: "Argentina", mentions: 33, flag: "🇦🇷" },
  ],
  topKeyphrases: [
    { phrase: "santos bravos", count: 673 },
    { phrase: "grupo de kpop", count: 613 },
    { phrase: "sunbaenim", count: 183 },
    { phrase: "lindo de verdad", count: 161 },
    { phrase: "mejores amigos", count: 143 },
    { phrase: "lives de santos", count: 142 },
    { phrase: "new group", count: 132 },
    { phrase: "festivales de música", count: 125 },
    { phrase: "nuevo video", count: 125 },
  ],
  topMentions: [
    { handle: "@santos_bravos", count: 1842 },
    { handle: "@ABORINGSTORY2", count: 456 },
    { handle: "@hyikiara", count: 312 },
    { handle: "@soykennethlavill", count: 287 },
    { handle: "@hybelatinamerica", count: 264 },
    { handle: "@alearamburu_oficial", count: 198 },
    { handle: "@and.venn", count: 167 },
    { handle: "@kauepenna", count: 143 },
    { handle: "@gabiprpr", count: 112 },
    { handle: "@SpotifyMexico", count: 89 },
  ],
  topSources: [
    { name: "X (Twitter)", count: 3842, type: "social" },
    { name: "Instagram", count: 1105, type: "social" },
    { name: "TikTok", count: 487, type: "social" },
    { name: "YouTube", count: 234, type: "social" },
    { name: "Reddit", count: 156, type: "social" },
    { name: "News Sites", count: 122, type: "news" },
    { name: "Blogs", count: 67, type: "blog" },
    { name: "Facebook", count: 33, type: "social" },
  ],
  wow: {
    thisWeek: 6046,
    lastWeek: 7823,
    change: -1777,
    changePct: -22.7,
    thisWeekSeries: [
      { day: "Mon", mentions: 1717 },
      { day: "Tue", mentions: 935 },
      { day: "Wed", mentions: 895 },
      { day: "Thu", mentions: 797 },
      { day: "Fri", mentions: 687 },
      { day: "Sat", mentions: 609 },
      { day: "Sun", mentions: 406 },
    ],
    lastWeekSeries: [
      { day: "Mon", mentions: 2134 },
      { day: "Tue", mentions: 1456 },
      { day: "Wed", mentions: 1203 },
      { day: "Thu", mentions: 1087 },
      { day: "Fri", mentions: 892 },
      { day: "Sat", mentions: 643 },
      { day: "Sun", mentions: 408 },
    ],
  },
};

// Top Topics (Meltwater conversation themes)
// Appended to prMedia
// @ts-ignore — accessed via prMedia.topTopics
(prMedia as any).topTopics = [
  { topic: "Latin Pop Debut", count: 1842 },
  { topic: "Boy Band / Group Formation", count: 1203 },
  { topic: "Music Video Release", count: 987 },
  { topic: "HYBE Expansion", count: 856 },
  { topic: "K-pop Crossover", count: 643 },
  { topic: "TikTok Viral", count: 521 },
  { topic: "Concert / Live Performance", count: 398 },
  { topic: "Fan Community", count: 312 },
  { topic: "Streaming Records", count: 287 },
  { topic: "Cultural Representation", count: 234 },
];

// @ts-ignore — accessed via prMedia.topCities
(prMedia as any).topCities = [
  { city: "Lima", country: "PE", count: 187, flag: "🇵🇪" },
  { city: "Mexico City", country: "MX", count: 124, flag: "🇲🇽" },
  { city: "São Paulo", country: "BR", count: 78, flag: "🇧🇷" },
  { city: "Bogotá", country: "CO", count: 52, flag: "🇨🇴" },
  { city: "Santiago", country: "CL", count: 45, flag: "🇨🇱" },
  { city: "Buenos Aires", country: "AR", count: 33, flag: "🇦🇷" },
  { city: "Los Angeles", country: "US", count: 28, flag: "🇺🇸" },
  { city: "Madrid", country: "ES", count: 22, flag: "🇪🇸" },
];

// @ts-ignore — accessed via prMedia.topLanguages
(prMedia as any).topLanguages = [
  { code: "es", name: "Spanish", flag: "🇪🇸", count: 3627, pct: 60.0 },
  { code: "en", name: "English", flag: "🇬🇧", count: 1209, pct: 20.0 },
  { code: "pt", name: "Portuguese", flag: "🇧🇷", count: 544, pct: 9.0 },
  { code: "ja", name: "Japanese", flag: "🇯🇵", count: 302, pct: 5.0 },
  { code: "ko", name: "Korean", flag: "🇰🇷", count: 181, pct: 3.0 },
  { code: "fr", name: "French", flag: "🇫🇷", count: 121, pct: 2.0 },
  { code: "id", name: "Indonesian", flag: "🇮🇩", count: 60, pct: 1.0 },
];

// === SECTION 7: Fan Sentiment (Meltwater) ===
export const fanSentiment = {
  period: "Feb 3 – Feb 9, 2026",
  positive: { count: 1441, pct: 23.8 },
  negative: { count: 935, pct: 15.5 },
  neutral: { count: 3669, pct: 60.7 },
  topHashtags: [
    { tag: "#santosbravos", count: 2732, pct: 45.9 },
    { tag: "#stbv", count: 1477, pct: 24.8 },
    { tag: "#hybelatinamerica", count: 1056, pct: 17.7 },
    { tag: "#hybe", count: 1033, pct: 17.3 },
    { tag: "#alejandroaramburu", count: 453, pct: 7.6 },
    { tag: "#kawasaki", count: 248, pct: 4.2 },
    { tag: "#cortis", count: 200, pct: 3.4 },
  ],
  topEntities: [
    { name: "Santos Bravos", count: 4200, type: "organization" },
    { name: "HYBE", count: 1850, type: "organization" },
    { name: "Kenneth Lavíll", count: 620, type: "person" },
    { name: "Alejandro Aramburu", count: 453, type: "person" },
    { name: "Kauê Penna", count: 380, type: "person" },
    { name: "Drew Venegas", count: 290, type: "person" },
    { name: "Gabi Bermúdez", count: 215, type: "person" },
    { name: "Bang Si-Hyuk", count: 89, type: "person" },
  ],
  topSharedLinks: [],
  sentimentTimeline: [
    { date: "Feb 3", positive: 409, neutral: 1042, negative: 266, total: 1717 },
    { date: "Feb 4", positive: 223, neutral: 568, negative: 145, total: 935 },
    { date: "Feb 5", positive: 213, neutral: 543, negative: 139, total: 895 },
    { date: "Feb 6", positive: 190, neutral: 484, negative: 124, total: 797 },
    { date: "Feb 7", positive: 164, neutral: 417, negative: 107, total: 687 },
    { date: "Feb 8", positive: 145, neutral: 370, negative: 94, total: 609 },
    { date: "Feb 9", positive: 97, neutral: 246, negative: 63, total: 406 },
  ],
  priorNss: null,
  sentimentByPlatform: [
    { name: "X / Twitter", icon: "𝕏", color: "#1DA1F2", volume: 3870, positive: 26.1, negative: 16.8, neutral: 57.1, nss: 9.3 },
    { name: "Instagram", icon: "📷", color: "#E1306C", volume: 1205, positive: 31.2, negative: 10.4, neutral: 58.4, nss: 20.8 },
    { name: "News", icon: "📰", color: "#8B5CF6", volume: 620, positive: 18.5, negative: 8.2, neutral: 73.3, nss: 10.3 },
    { name: "TikTok", icon: "🎵", color: "#00F2EA", volume: 285, positive: 35.8, negative: 12.3, neutral: 51.9, nss: 23.5 },
    { name: "Reddit", icon: "🟠", color: "#FF4500", volume: 66, positive: 19.7, negative: 22.7, neutral: 57.6, nss: -3.0 },
  ],
};

// === Audience Stats (Spotify for Artists, 28 days) ===
export const audienceStats = {
  period: "Jan 12 – Feb 8, 2026",
  listeners: 345077,
  streams: 2114959,
  streamsPerListener: 6.129,
  saves: 120154,
  playlistAdds: 105653,
  followers: 97592,
};

// Legacy exports for chart components
export const artistOverview = {
  name: "Santos Bravos",
  tagline: "The First Latin Boy Band by HYBE",
  monthlyListeners: 335584,
  followers: 97592,
  totalStreams: 29748186,
  snsFootprint: 1706313,
};

export const spotifyTracks = businessPerformance.tracks.map(t => ({
  name: t.name, streams: t.spotifyStreams.current
}));

export const youtubeVideos = businessPerformance.youtubeVideos.map(v => ({
  name: v.name.replace(/ (Performance Video|Official MV|Lyric Video|Debut Visualizer)/, ""),
  views: v.views.current
}));
